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
    
    const questions = await Question.find({ 
      userId,
      timesAnswered: { $gt: 0 } 
    })
    .sort({ createdAt: 1 })
    .lean();

    const scoreData = questions.map(q => ({
      date: new Date(q.createdAt).toLocaleDateString(),
      score: q.averageScore,
      field: q.field
    }));

    return NextResponse.json(scoreData);
  } catch (error) {
    console.error("Error fetching user scores:", error);
    return NextResponse.json(
      { error: "Failed to fetch scores" },
      { status: 500 }
    );
  }
}