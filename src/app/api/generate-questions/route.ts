import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import { connectToDatabase } from "@/lib/mongodb";
import Question from "../..‍/../../../../models/question";
import { auth } from "@clerk/nextjs/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const mapDifficulty = (difficulty: string): "beginner" | "intermediate" | "advanced" => {
  const difficultyMap: { [key: string]: "beginner" | "intermediate" | "advanced" } = {
    "easy": "beginner",
    "basic": "beginner",
    "medium": "intermediate",
    "hard": "advanced",
    "expert": "advanced",
    "difficult": "advanced"
  };
  return difficultyMap[difficulty.toLowerCase()] || "intermediate";
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { field, subField, count = 10 } = await request.json();
    
    const prompt = `Generate ${count} interview questions for ${field} focusing on ${subField}.
      Each question should have a detailed answer and difficulty level (beginner/intermediate/advanced).
      Format as JSON: {
        "questions": [{
          "question": "text",
          "answer": "text",
          "difficulty": "beginner|intermediate|advanced"
        }]
      }
      Ensure a mix of difficulty levels and comprehensive answers.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert interview question generator. Use difficulty levels: beginner, intermediate, or advanced."
        },
        { role: "user", content: prompt }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = completion.choices[0]?.message?.content || "";
    const response = JSON.parse(content.trim());

    await connectToDatabase();
    
    const savedQuestions = await Promise.all(
      response.questions.slice(0, count).map(async (q: any) => {
        const question = new Question({
          userId,
          field,
          subField,
          question: q.question,
          answer: q.answer,
          difficulty: mapDifficulty(q.difficulty),
          timesAnswered: 0,
        });
        return await question.save();
      })
    );

    return NextResponse.json(savedQuestions);
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}