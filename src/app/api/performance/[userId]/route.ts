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

    const questions = (await Question.find({ userId })
      .select('scores field subField createdAt lastReviewedAt')
      .sort('createdAt')
      .lean()) as unknown as QuestionFromDB[];

    interface Score {
      score: number;
    }

    interface QuestionFromDB {
      _id: string;
      field: string;
      subField: string;
      scores: Score[];
      createdAt: Date;
      lastReviewedAt: Date;
    }

    interface PerformanceData {
      _id: string;
      field: string;
      subField: string;
      averageScore: number;
      scores: Score[];
      createdAt: Date;
      lastReviewedAt: Date;
    }

    const performanceData: PerformanceData[] = questions.map((question: QuestionFromDB) => ({
      _id: question._id,
      field: question.field,
      subField: question.subField,
      averageScore: question.scores.length > 0 
        ? question.scores.reduce((acc, curr) => acc + curr.score, 0) / question.scores.length 
        : 0,
      scores: question.scores,
      createdAt: question.createdAt,
      lastReviewedAt: question.lastReviewedAt
    }));

    return NextResponse.json(performanceData);
  } catch (error) {
    console.error("Error fetching performance data:", error);
    return NextResponse.json(
      { error: "Failed to fetch performance data" },
      { status: 500 }
    );
  }
}