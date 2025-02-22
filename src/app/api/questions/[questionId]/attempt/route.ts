import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Question from "../../../../../../models/question";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { questionId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { answer, score, timestamp } = body;

    await connectToDatabase();

    const question = await Question.findById(params.questionId);
    
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Initialize attempts array if it doesn't exist
    if (!question.attempts) {
      question.attempts = [];
    }

    // Add new attempt to the beginning of the array
    question.attempts.unshift({
      answer,
      score,
      timestamp
    });

    await question.save();

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error saving attempt:", error);
    return NextResponse.json(
      { error: "Failed to save attempt" },
      { status: 500 }
    );
  }
}