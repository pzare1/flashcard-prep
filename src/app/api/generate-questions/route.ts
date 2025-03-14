import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import { connectToDatabase } from "@/lib/mongodb";
import Question from "../../../../models/question"
import { auth } from "@clerk/nextjs/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const mapDifficulty = (difficulty: string): "beginner" | "intermediate" | "advanced" => {
  const difficultyMap: { [key: string]: "beginner" | "intermediate" | "advanced" } = {
    "easy": "beginner",
    "basic": "beginner",
    "beginner": "beginner",
    "medium": "intermediate",
    "intermediate": "intermediate", 
    "hard": "advanced",
    "expert": "advanced",
    "difficult": "advanced",
    "advanced": "advanced"
  };
  return difficultyMap[difficulty.toLowerCase()] || "intermediate";
};

// Helper function to safely parse JSON
const safeJSONParse = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    // Try to extract JSON if it's embedded in other text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e2) {
        console.error("Failed to parse even extracted JSON", e2);
        throw new Error("Invalid JSON response from question generator");
      }
    }
    console.error("Failed to parse JSON response", e);
    throw new Error("Invalid JSON response from question generator");
  }
};

// Function to ensure proper structure of the questions
const validateQuestionFormat = (question: any) => {
  if (!question.question || typeof question.question !== 'string') {
    return false;
  }
  if (!question.answer || typeof question.answer !== 'string') {
    return false;
  }
  if (!question.difficulty || typeof question.difficulty !== 'string') {
    return false;
  }
  return true;
};

// This function generates an array of questions with the exact requested length
const generateDefaultQuestions = (field: string, subField: string, count: number) => {
  // Create pre-defined questions as a fallback
  const defaultQuestions = [];
  
  for (let i = 0; i < count; i++) {
    defaultQuestions.push({
      question: `Default question ${i+1} for ${subField} in ${field}`,
      answer: `This is a standard answer for question ${i+1}. In a real implementation, you would have detailed knowledge about ${subField} in the ${field} field.`,
      difficulty: i % 3 === 0 ? "beginner" : (i % 3 === 1 ? "intermediate" : "advanced")
    });
  }
  
  return defaultQuestions;
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { field, subField, count = 10, jobTitle, jobDescription } = await request.json();
    
    // Ensure count is one of the valid options
    const validCount = [5, 10].includes(Number(count)) ? Number(count) : 10;
    
    const jobContext = jobTitle || jobDescription 
      ? `Consider this job context:
         Job Title: ${jobTitle}
         Job Description: ${jobDescription}
         Generate questions that are particularly relevant to this role.`
      : '';

    const prompt = `Generate EXACTLY ${validCount} interview questions for ${field} specifically focusing on ${subField}.
      ${jobContext}
      Each question MUST have a detailed answer and difficulty level (beginner/intermediate/advanced).
      Format as JSON: {
        "questions": [
          {
            "question": "Full question text",
            "answer": "Detailed answer text",
            "difficulty": "beginner|intermediate|advanced"
          },
          ...more questions...
        ]
      }
      Ensure:
      1. A mix of difficulty levels
      2. Comprehensive answers
      3. Questions align with the job requirements when provided
      4. EXACTLY ${validCount} questions, no more and no less
      5. Valid JSON format with all required fields`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert interview question generator for technical and non-technical fields. Generate structured, detailed questions with comprehensive answers. Always use valid JSON format with the structure provided. Include specific difficulty levels: beginner, intermediate, or advanced. YOU MUST GENERATE EXACTLY THE NUMBER OF QUESTIONS REQUESTED.`
        },
        { role: "user", content: prompt }
      ],
      model: "llama-3.2-90b-vision-preview",
      temperature: 0.7,
      max_tokens: 8000,
    });

    const content = completion.choices[0]?.message?.content || "";
    let questions = [];
    
    try {
      const response = safeJSONParse(content.trim());
      // Validate response structure
      if (response.questions && Array.isArray(response.questions)) {
        // Validate all questions have required fields
        questions = response.questions.filter(validateQuestionFormat);
      }
    } catch (error) {
      console.error("Error parsing AI response:", error);
      // If parsing fails, we'll use default questions (handled below)
    }
    
    // If we don't have enough valid questions from the AI, generate default ones to fill the gap
    if (questions.length < validCount) {
      console.warn(`Only ${questions.length} valid questions found from AI, adding default questions to meet the count`);
      
      // Generate default questions for the remaining count
      const defaultQuestions = generateDefaultQuestions(field, subField, validCount - questions.length);
      questions = [...questions, ...defaultQuestions];
    }
    
    // Ensure we have exactly the right number
    questions = questions.slice(0, validCount);

    await connectToDatabase();
    
    // Save exactly validCount questions
    const savedQuestions = await Promise.all(
      questions.map(async (q: any) => {
        const question = new Question({
          userId,
          field,
          subField,
          question: q.question,
          answer: q.answer,
          difficulty: mapDifficulty(q.difficulty),
          timesAnswered: 0,
          averageScore: 0,
          scores: []
        });
        return await question.save();
      })
    );
    
    // Perform a final check before returning
    if (savedQuestions.length !== validCount) {
      console.error(`Critical error: Saved ${savedQuestions.length} questions but expected ${validCount}`);
    }

    return NextResponse.json(savedQuestions);
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate questions" },
      { status: 500 }
    );
  }
}