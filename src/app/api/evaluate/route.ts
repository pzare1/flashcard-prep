import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import { connectToDatabase } from "@/lib/mongodb";
import Question from "../../../../models/question";

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

    // First, verify the API key is present
    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is not configured");
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an expert evaluator specializing in technical assessment. Your task is to:
            1. Evaluate answers on a scale of 0-10
            2. Provide a structured analysis of the response

            Scoring Criteria:
            - Accuracy (0-3 points): Correctness of technical information
            - Completeness (0-3 points): Coverage of all relevant aspects
            - Clarity (0-2 points): Clear and logical explanation
            - Technical Terminology (0-2 points): Proper use of domain-specific terms

            Response Format:
            {
              "score": <number 0-10>,
              "feedback": "<brief evaluation explanation>"
            }`
          },
          {
            role: "user",
            content: `Evaluate this answer:
              Correct Answer: ${correctAnswer}
              User Answer: ${userAnswer}
              
              Provide your evaluation in the specified JSON format.`
          }
        ],
        model: "mixtral-8x7b-32768",
        temperature: 0.1,
        max_tokens: 150,
      });

      if (!completion.choices[0]?.message?.content) {
        throw new Error("No evaluation response received");
      }

      try {
        const evaluation = JSON.parse(completion.choices[0].message.content.trim());
        const score = evaluation.score;
        const feedback = evaluation.feedback;

        if (isNaN(score) || score < 0 || score > 10) {
          throw new Error("Invalid score received");
        }

        // Update question with new score, attempt, and feedback
        await connectToDatabase();
        const question = await Question.findById(questionId);
        
        if (!question) {
          return NextResponse.json(
            { error: "Question not found" },
            { status: 404 }
          );
        }

        // Add new attempt with feedback
        const newAttempt = {
          answer: userAnswer,
          score: score,
          feedback: feedback,
          timestamp: new Date()
        };

        // Update question fields
        question.attempts = [...(question.attempts || []), newAttempt];
        question.scores = [...(question.scores || []), score];
        question.averageScore = question.scores.reduce((a: number, b: number) => a + b, 0) / question.scores.length;
        question.timesAnswered = question.scores.length;
        question.lastReviewedAt = new Date();

        await question.save();

        return NextResponse.json({
          success: true,
          score,
          feedback,
          averageScore: question.averageScore,
          timesAnswered: question.timesAnswered
        });

      } catch (parseError) {
        console.error("Error parsing evaluation response:", parseError);
        return NextResponse.json(
          { error: "Invalid evaluation format received" },
          { status: 500 }
        );
      }

    } catch (evalError) {
      console.error("Evaluation error:", evalError);
      return NextResponse.json(
        { error: "Error during answer evaluation" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Request error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}