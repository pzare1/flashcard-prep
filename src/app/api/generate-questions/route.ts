import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import { connectToDatabase } from "@/lib/mongodb";
import Question from "../..‍/../../../../models/question";
import { auth } from "@clerk/nextjs/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { field, subField } = await request.json();
    if (!field || !subField) {
      return NextResponse.json({ error: "Field and subField are required" }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a specialized interview question generator. Always respond with valid JSON."
        },
        {
          role: "user",
          content: `Generate 10 interview questions and answers for ${field} focusing on ${subField}. 
            Format as JSON: { "questions": [{ "question": "text", "answer": "text", "difficulty": "intermediate" }] }`
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.5,
      max_tokens: 4000,
    });

    const content = completion.choices[0]?.message?.content || "";
    const response = JSON.parse(content.trim());

    if (!response.questions || !Array.isArray(response.questions)) {
      throw new Error("Invalid question format");
    }

    await connectToDatabase();
    
    const savedQuestions = await Promise.all(
      response.questions.map(async (q: any) => {
        const question = new Question({
          userId,
          field,
          subField,
          question: q.question,
          answer: q.answer,
          difficulty: q.difficulty || "intermediate",
        });
        return await question.save();
      })
    );

    return NextResponse.json(savedQuestions);
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate questions" }, 
      { status: 500 }
    );
  }
}