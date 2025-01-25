import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAnswer, correctAnswer } = body;

    if (!userAnswer || !correctAnswer) {
      return NextResponse.json(
        { error: "User answer and correct answer are required" },
        { status: 400 }
      );
    }

    const prompt = `
      You are an expert evaluator for technical interview answers. 
      Compare the following answer given by a candidate with the correct answer and rate it on a scale of 0-10.
      Consider technical accuracy, completeness, and clarity in your evaluation.
      
      Correct Answer:
      ${correctAnswer}
      
      Candidate's Answer:
      ${userAnswer}
      
      Please provide only a numerical score between 0 and 10, where:
      0-3: Poor answer, missing key concepts or incorrect
      4-6: Partial understanding but significant gaps
      7-8: Good understanding with minor omissions
      9-10: Excellent answer, complete and accurate
      
      Return only the numerical score, no explanation.
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "mixtral-8x7b-32768",
      temperature: 0.3,
      max_tokens: 10,
    });

    const score = parseFloat(completion.choices[0]?.message?.content || "0");

    return NextResponse.json({ score });
  } catch (error) {
    console.error("Error evaluating answer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}