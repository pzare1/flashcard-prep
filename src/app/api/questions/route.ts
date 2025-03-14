import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Question from "../../../../models/question";


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const field = searchParams.get("field");
    const subfield = searchParams.get("subfield");
    const count = Number(searchParams.get("count")) || 10;

    if (!field || !subfield) {
      return NextResponse.json(
        { error: "Field and subfield are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const questions = await Question.aggregate([
      { 
        $match: { 
          field: field,
          subField: subfield
        }
      },
      { $sample: { size: count } }
    ]);

    if (questions.length !== count) {
      return NextResponse.json(
        { error: `Not enough questions available (requested: ${count}, available: ${questions.length})` },
        { status: 400 }
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
    const body = await request.json();
    const { field, subField, question, answer, difficulty, tags } = body;

    if (!field || !subField || !question || !answer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const newQuestion = new Question({
      field,
      subField,
      question,
      answer,
      difficulty,
      tags,
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