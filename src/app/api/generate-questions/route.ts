import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import { connectToDatabase } from "@/lib/mongodb";
import Question from "../../../../models/question";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const getPromptByField = (field: string, subField: string) => {
  const basePrompt = `Generate 10 interview questions and answers for ${field} focusing on ${subField}. 
    Each question should have a detailed answer and difficulty level.`;

  return `${basePrompt}
    The response should be a valid JSON object with this exact structure:
    {
      "questions": [
        {
          "question": "Question text here",
          "answer": "Answer text here",
          "difficulty": "intermediate"
        }
      ]
    }`;
};

export async function POST(request: NextRequest) {
  try {
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
          content: getPromptByField(field, subField)
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.5,
      max_tokens: 4000,
    });

    const content = completion.choices[0]?.message?.content || "";
    let response;
    
    try {
      response = JSON.parse(content.trim());
    } catch (e) {
      console.error("JSON parsing error:", e);
      return NextResponse.json({ error: "Invalid response format" }, { status: 500 });
    }

    if (!response.questions || !Array.isArray(response.questions)) {
      return NextResponse.json({ error: "Invalid question format" }, { status: 500 });
    }

    await connectToDatabase();
    
    const savedQuestions = await Promise.all(
      response.questions.map(async (q: any) => {
        const question = new Question({
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}