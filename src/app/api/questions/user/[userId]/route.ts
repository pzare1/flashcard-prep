import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Question from "../../../../../../models/question";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }  // Correct type definition
) {
  try {
    const { userId } = await auth();
    if (!userId || userId !== params.userId) {  // Updated to use params directly
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    const questions = await Question.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching user questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}