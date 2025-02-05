import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Question from "../../../../../../models/question";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }  // Changed to Promise
) {
  try {
    const params = await context.params;  // Await the params
    const { userId: authenticatedUserId } = await auth();
    
    if (!authenticatedUserId || authenticatedUserId !== params.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    const questions = await Question.find({ userId: authenticatedUserId })
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