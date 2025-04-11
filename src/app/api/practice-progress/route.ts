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

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const field = searchParams.get("field");
    const subfield = searchParams.get("subfield");

    if (!field || !subfield) {
      return NextResponse.json({ error: "Field and subfield are required" }, { status: 400 });
    }

    await connectToDatabase();

    const progress = await PracticeProgress.findOne({
      userId,
      field,
      subField: subfield,
      isCompleted: false
    });

    return NextResponse.json(progress || null);
  } catch (error) {
    console.error("Error fetching practice progress:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Simple query to find all in-progress sessions for this user
    const sessions = await PracticeProgress.find({
      userId,
      isCompleted: false
    }).sort({ lastUpdatedAt: -1 });
    
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching in-progress sessions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 