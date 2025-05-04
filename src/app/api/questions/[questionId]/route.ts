import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Question from "../../../../../models/question";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { questionId: string } }
) {
  try {
    const { userId } = await auth();
    
    // Allow non-authenticated users to fetch public questions only
    const { questionId } = params;
    
    await connectToDatabase();
    
    const query: any = { _id: questionId };
    
    // If user is not authenticated, only allow access to public questions
    if (!userId) {
      query.isPublic = true;
    }
    
    const question = await Question.findOne(query);
    
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }
    
    // Check if the user has permission to access this question
    if (!question.isPublic && question.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    return NextResponse.json(question);
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { questionId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { questionId } = params;
    const body = await req.json();
    
    await connectToDatabase();
    
    const question = await Question.findOne({
      _id: questionId,
      userId: userId
    });
    
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }
    
    // Update the question
    Object.keys(body).forEach(key => {
      if (key !== '_id' && key !== 'userId') {
        question[key] = body[key];
      }
    });
    
    await question.save();
    
    return NextResponse.json(question);
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}