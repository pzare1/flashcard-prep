import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Question from "../../../../../models/question";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId || userId !== params.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const questions = await Question.find({ userId });
    
    const performance = questions.map(q => ({
      id: q._id,
      question: q.question,
      field: q.field,
      subField: q.subField,
      attempts: q.attempts || [],
      averageScore: q.attempts?.length 
        ? q.attempts.reduce((acc: number, curr: { score: number }) => acc + curr.score, 0) / q.attempts.length 
        : 0
    }));

    return NextResponse.json(performance);
  } catch (error) {
    console.error("Error fetching performance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
