import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";
import mongoose from 'mongoose';

// Define the schema directly in this file
const PracticeProgressSchema = new mongoose.Schema({
  userId: String,
  field: String,
  subField: String,
  questions: [String],
  currentIndex: Number,
  scores: [Number],
  totalTime: Number,
  streakCount: Number,
  isCompleted: Boolean,
  startedAt: { type: Date, default: Date.now },
  lastUpdatedAt: { type: Date, default: Date.now }
});

// Get the model safely
const PracticeProgress = mongoose.models.PracticeProgress || 
  mongoose.model('PracticeProgress', PracticeProgressSchema);

// Get a specific progress record or all records
export async function GET(request: NextRequest) {
  try {
    const userId = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const field = searchParams.get("field");
    const subfield = searchParams.get("subfield");
    
    if (field && subfield) {
      // Get specific progress
      const progress = await PracticeProgress.findOne({
        userId,
        field,
        subField: subfield,
        isCompleted: false
      });
      return NextResponse.json(progress || null);
    } else {
      // Get all in-progress sessions
      const allProgress = await PracticeProgress.find({
        userId,
        isCompleted: false
      });
      return NextResponse.json(allProgress || []);
    }
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Save progress
export async function POST(request: NextRequest) {
  try {
    const userId = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    const body = await request.json();
    const { field, subField, questions, currentIndex, scores, totalTime, streakCount, isCompleted } = body;
    
    if (!field || !subField) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // Update or create progress document
    const progress = await PracticeProgress.findOneAndUpdate(
      { userId, field, subField },
      {
        $set: {
          questions: questions || [],
          currentIndex: currentIndex || 0,
          scores: scores || [],
          totalTime: totalTime || 0,
          streakCount: streakCount || 0,
          isCompleted: isCompleted || false,
          lastUpdatedAt: new Date()
        }
      },
      { upsert: true, new: true }
    );
    
    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error saving progress:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
} 