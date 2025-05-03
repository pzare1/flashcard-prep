import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Question from "../../../../models/question";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    // Get the current user ID from auth
    const { userId } = await auth();
    
    const { searchParams } = new URL(request.url);
    const field = searchParams.get("field");
    const subfield = searchParams.get("subfield");
    const count = Number(searchParams.get("count")) || 10;
    
    // Allow public questions param for questions that don't need to be user-specific
    const publicQuestions = searchParams.get("public") === "true";

    if (!field || !subfield) {
      return NextResponse.json(
        { error: "Field and subfield are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Build match criteria - either filter by userId or get all questions if public
    const matchCriteria: any = { 
      field: field,
      subField: subfield
    };
    
    // Only filter by userId if not requesting public questions and user is authenticated
    if (!publicQuestions && userId) {
      matchCriteria.userId = userId;
    }

    const questions = await Question.aggregate([
      { $match: matchCriteria },
      { $sample: { size: count } }
    ]);

    // If we don't have enough questions and user is authenticated, 
    // try to get shared/public questions to fill the gap
    if (questions.length < count && userId && !publicQuestions) {
      const additionalCount = count - questions.length;
      
      const publicMatchCriteria = {
        field: field,
        subField: subfield,
        isPublic: true,  // Assuming you have an isPublic field
        userId: { $ne: userId }  // Not created by this user
      };
      
      const additionalQuestions = await Question.aggregate([
        { $match: publicMatchCriteria },
        { $sample: { size: additionalCount } }
      ]);
      
      questions.push(...additionalQuestions);
    }

    if (questions.length === 0) {
      return NextResponse.json(
        { error: "No questions found for these criteria" },
        { status: 404 }
      );
    }

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the current user ID from auth
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { field, subField, question, answer, difficulty, tags, isPublic = false } = body;

    if (!field || !subField || !question || !answer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const newQuestion = new Question({
      userId,  // Add the user ID here
      field,
      subField,
      question,
      answer,
      difficulty,
      tags,
      isPublic,  // Allow questions to be shared
      createdAt: new Date()
    });

    await newQuestion.save();

    return NextResponse.json(newQuestion);
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}