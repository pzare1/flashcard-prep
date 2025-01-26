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
    
    // Get all questions with their scores
    const questions = await Question.find({ 
      userId,
      timesAnswered: { $gt: 0 } 
    })
    .sort({ createdAt: 1 })
    .lean();

    // Transform the data for the chart
    const scoreData = questions.flatMap(q => {
      // If question has individual scores, create a data point for each
      if (q.scores && q.scores.length > 0) {
        interface Score {
            timestamp: number;
            averageScore: number;
            field: string;
        }

        interface QuestionWithScores {
            scores: number[];
            createdAt: Date | string;
            field: string;
        }

                        return q.scores.map((score: number, index: number): Score => ({
                            timestamp: new Date(q.createdAt).getTime() + (index * 1000 * 60), // Add minutes to spread out multiple scores
                            averageScore: score,
                            field: q.field
                        }));
      }
      // Fallback to using averageScore if individual scores aren't available
      return [{
        timestamp: new Date(q.createdAt).getTime(),
        averageScore: q.averageScore,
        field: q.field
      }];
    });

    // Sort by timestamp
    scoreData.sort((a, b) => a.timestamp - b.timestamp);

    return NextResponse.json(scoreData);
  } catch (error) {
    console.error("Error fetching user scores:", error);
    return NextResponse.json(
      { error: "Failed to fetch scores" },
      { status: 500 }
    );
  }
}