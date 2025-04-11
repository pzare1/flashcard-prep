import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Question from "../../../../../models/question";

export async function POST(request: NextRequest) {
  try {
    const { ids } = await request.json();
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Valid question IDs are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find questions by their IDs, maintaining the original order
    const questions = await Question.find({
      _id: { $in: ids }
    });
    
    // Sort the results to match the original order of IDs
    const orderedQuestions = ids.map(id => 
      questions.find(q => q._id.toString() === id)
    ).filter(Boolean);

    return NextResponse.json(orderedQuestions);
  } catch (error) {
    console.error("Error fetching questions by IDs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 