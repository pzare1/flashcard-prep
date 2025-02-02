import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import { connectToDatabase } from "@/lib/mongodb";
import Question from "../../../../../models/question";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { userAnswer, correctAnswer, questionId } = await request.json();

    if (!userAnswer || !correctAnswer || !questionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert evaluator. Score answers from 0-10."
        },
        {
          role: "user",
          content: `Score this answer from 0-10:
            Correct Answer: ${correctAnswer}
            User Answer: ${userAnswer}
            Return only the numerical score.`
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.3,
      max_tokens: 10,
    });

    const score = parseFloat(completion.choices[0]?.message?.content || "0");

    // Update question with new score
    await connectToDatabase();
    const question = await Question.findById(questionId);
    
    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Add new score to scores array
    question.scores = [...(question.scores || []), score];
    
    // Update average score
    interface Question {
        scores: number[];
        averageScore: number;
        timesAnswered: number;
        save: () => Promise<void>;
    }

    // The actual calculation line remains the same
    question.averageScore = question.scores.reduce((a: number, b: number) => a + b, 0) / question.scores.length;
    
    // Increment times answered
    question.timesAnswered = question.scores.length;
    
    await question.save();

    return NextResponse.json({ score, averageScore: question.averageScore });
  } catch (error) {
    console.error("Error evaluating answer:", error);
    return NextResponse.json(
      { error: "Failed to evaluate answer" },
      { status: 500 }
    );
  }
}