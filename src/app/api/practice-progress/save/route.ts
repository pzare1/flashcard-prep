import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";
import mongoose from 'mongoose';

// Create a simple schema directly in this file to avoid import issues
const PracticeProgressSchema = new mongoose.Schema({
  userId: String,
  field: String,
  subField: String,
  questions: [String],
  currentIndex: { type: Number, default: 0 },
  scores: { type: [Number], default: [] },
  totalTime: { type: Number, default: 0 },
  streakCount: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  startedAt: { type: Date, default: Date.now },
  lastUpdatedAt: { type: Date, default: Date.now }
});

// Get the model safely without causing "Cannot overwrite model" errors
const PracticeProgress = mongoose.models.PracticeProgress || 
  mongoose.model('PracticeProgress', PracticeProgressSchema);

export async function POST(request: NextRequest) {
  try {
    const userId = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      field, 
      subField, 
      questions, 
      currentIndex, 
      scores, 
      totalTime, 
      streakCount,
      isCompleted
    } = body;

    if (!field || !subField || !questions) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    // Find and update (or create) the progress document
    const progress = await PracticeProgress.findOneAndUpdate(
      { userId, field, subField },
      {
        questions,
        currentIndex,
        scores,
        totalTime,
        streakCount,
        isCompleted,
        lastUpdatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error saving practice progress:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 