import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectToDatabase();
    
    // List all registered models in mongoose
    const modelNames = mongoose.modelNames();
    
    return NextResponse.json({
      models: modelNames,
      hasPracticeProgress: modelNames.includes('PracticeProgress')
    });
  } catch (error) {
    console.error("Error testing mongoose models:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 