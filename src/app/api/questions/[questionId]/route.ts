import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Question from "../../../../../models/question";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    await connectToDatabase();

    const { questionId } = await params;  // await the params

    // Find the question and verify ownership
    const question = await Question.findOne({
      _id: questionId,
      userId: userId
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Update fields
    if (data.answer !== undefined) {
      question.answer = data.answer;
    }

    if (data.notes !== undefined) {
      question.notes = data.notes;
    }

    question.lastReviewedAt = new Date();

    await question.save();

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    );
  }
}