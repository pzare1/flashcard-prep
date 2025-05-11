import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import { connectToDatabase } from "@/lib/mongodb";
import Question from "../../../../models/question"
import { auth } from "@clerk/nextjs/server";
import User from "../../../../models/user";

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
    // 1. Authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    console.log("Received request body:", body); // Debug log

    const { field, subField, count = 5, jobTitle = "", jobDescription = "", linkedinUrl = "" } = body;

    // 3. Validate inputs
    if (!field || !subField) {
      return NextResponse.json(
        { error: "Field and subField are required" },
        { status: 400 }
      );
    }

    // 4. Connect to database
    try {
      await connectToDatabase();
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    // 5. Find or create user
    let user;
    try {
      user = await User.findOne({ userId });
      if (!user) {
        user = new User({
          userId,
          credits: 100,
          totalQuestionsGenerated: 0
        });
        await user.save();
      }
    } catch (userError) {
      console.error("User management error:", userError);
      return NextResponse.json(
        { error: "Failed to manage user credits" },
        { status: 500 }
      );
    }

    // 6. Check credits
    const validCount = Math.min(Math.max(1, Number(count)), 50);
    if (user.credits < validCount) {
      return NextResponse.json(
        { error: `Insufficient credits. You need ${validCount} credits but have ${user.credits}` },
        { status: 400 }
      );
    }

    // 7. Check API key
    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is missing");
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }

    // 8. Generate questions
    let completion;
    try {
      let jobContent = "";
      if (jobTitle || jobDescription) {
        jobContent = `Consider this context:
          Job Title: ${jobTitle}
          Job Description: ${jobDescription}`;
      }
      
      if (linkedinUrl) {
        jobContent += jobContent ? "\nLinkedIn Job URL: " + linkedinUrl : `Consider the job posting from this LinkedIn URL: ${linkedinUrl}`;
      }

      completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an expert interview question generator specializing in creating detailed questions with comprehensive answers for technical interviews. Your questions should closely match the skills and requirements mentioned in any job descriptions provided. Format your response as valid JSON."
          },
          {
            role: "user",
            content: `Generate EXACTLY ${validCount} interview questions for ${field} specifically focusing on ${subField}.
              ${jobContent ? `
              ===== JOB DETAILS =====
              ${jobContent}
              =====
              
              When generating questions, closely analyze the job details above and create questions that:
              1. Target the specific technical skills mentioned in the job description
              2. Cover the required experience levels and technologies
              3. Include scenario-based questions relevant to the role
              4. Match the seniority level indicated by the job title and description` : ''}
              
              Return in this exact JSON format:
              {
                "questions": [
                  {
                    "question": "Question text",
                    "answer": "Detailed answer",
                    "difficulty": "beginner"
                  }
                ]
              }
              Ensure:
              1. EXACTLY ${validCount} questions
              2. Valid JSON format
              3. All fields present
              4. Mix of difficulty levels (beginner/intermediate/advanced)
              5. Questions relevant to the job details (when provided)`
          }
        ],
        model: "llama3-70b-8192",
        temperature: 0.7,
        max_tokens: 8000,
      });
    } catch (aiError) {
      console.error("AI API error:", aiError);
      return NextResponse.json(
        { error: "Failed to generate questions from AI" },
        { status: 500 }
      );
    }

    // 9. Parse AI response
    let questions;
    try {
      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content received from AI");
      }

      const parsedResponse = safeJSONParse(content);
      if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
        throw new Error("Invalid response format from AI");
      }

      questions = parsedResponse.questions;
      
      if (questions.length !== validCount) {
        throw new Error(`AI generated ${questions.length} questions instead of ${validCount}`);
      }
    } catch (parseError) {
      console.error("Parse error:", parseError);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    // 10. Save questions
    try {
      const savedQuestions = await Promise.all(
        questions.map(async (q: any) => {
          const question = new Question({
            userId,
            field,
            subField,
            question: q.question,
            answer: q.answer,
            difficulty: q.difficulty.toLowerCase(),
            timesAnswered: 0,
            averageScore: 0,
            scores: [],
            attempts: [],
            jobTitle: jobTitle.trim(),
            jobDescription: jobDescription.trim(),
            linkedinUrl: linkedinUrl.trim()
          });
          return await question.save();
        })
      );

      // 11. Update user credits
      user.credits -= validCount;
      user.totalQuestionsGenerated += validCount;
      await user.save();

      return NextResponse.json({
        questions: savedQuestions,
        remainingCredits: user.credits,
        totalGenerated: user.totalQuestionsGenerated
      });
    } catch (saveError) {
      console.error("Save error:", saveError);
      return NextResponse.json(
        { error: "Failed to save questions" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("General error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to generate questions",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}