import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Question from "../../../../../../models/question";
import { auth } from "@clerk/nextjs/server";

// Define types for the question and attempt structure
interface Attempt {
  userId: string;
  answer: string;
  score: number;
  timestamp: Date;
  feedback?: string;
  timeTaken?: number | null;
  keyPoints?: string[];
  strengthAreas?: string[];
  weaknessAreas?: string[];
  improvement?: string;
  practicalApplication?: string;
  suggestedResources?: string[];
}

interface QuestionDocument {
  _id: string;
  userId: string;
  question: string;
  answer: string;
  isPublic: boolean;
  attempts?: Attempt[];
  [key: string]: any; // Allow for additional properties
}

export async function GET(
  request: NextRequest
) {
  const params = { questionId: request.nextUrl.pathname.split('/').pop() || '' };
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Find the question with full projection to ensure we get all fields
    const question = await Question.findOne({
      _id: params.questionId,
      $or: [
        { userId: userId },
        { isPublic: true }
      ]
    }).lean() as QuestionDocument | null;
    
    if (!question) {
      return NextResponse.json(
        { error: "Question not found or unauthorized access" },
        { status: 404 }
      );
    }
    
    // Check if attempts exist and are an array
    let processedAttempts: Attempt[] = [];
    // Safely handle the attempts property which might not exist
    const attempts = question.attempts || [];
    
    if (Array.isArray(attempts)) {
      // Process the attempts to ensure data integrity
      processedAttempts = attempts.map((attempt: any) => {
        // Ensure all expected fields exist with defaults if missing
        const processedAttempt: Attempt = {
          userId: attempt.userId || userId,
          answer: attempt.answer || "",
          score: attempt.score || 0,
          timestamp: attempt.timestamp || new Date(),
          feedback: attempt.feedback || "",
          timeTaken: attempt.timeTaken || null,
          keyPoints: Array.isArray(attempt.keyPoints) ? attempt.keyPoints : [],
          strengthAreas: Array.isArray(attempt.strengthAreas) ? attempt.strengthAreas : [],
          weaknessAreas: Array.isArray(attempt.weaknessAreas) ? attempt.weaknessAreas : [],
          improvement: attempt.improvement || "",
          practicalApplication: attempt.practicalApplication || "",
          suggestedResources: Array.isArray(attempt.suggestedResources) ? attempt.suggestedResources : []
        };
        
        // Generate comprehensive feedback if it's missing
        if (!processedAttempt.feedback || processedAttempt.feedback.trim() === '') {
          console.warn(`Missing feedback detected for attempt in question ${params.questionId}`);
          // Create detailed feedback based on other fields
          let feedback = `This attempt received a score of ${processedAttempt.score.toFixed(1)}/10. `;
          
          // Build comprehensive feedback from available data
          if (processedAttempt.strengthAreas && processedAttempt.strengthAreas.length > 0) {
            feedback += `\n\nStrengths: ${processedAttempt.strengthAreas.join(', ')}. `;
          }
          
          if (processedAttempt.weaknessAreas && processedAttempt.weaknessAreas.length > 0) {
            feedback += `\n\nAreas for improvement: ${processedAttempt.weaknessAreas.join(', ')}. `;
          }
          
          if (processedAttempt.keyPoints && processedAttempt.keyPoints.length > 0) {
            feedback += `\n\nKey points: ${processedAttempt.keyPoints.join(', ')}. `;
          }
          
          if (processedAttempt.improvement) {
            feedback += `\n\nSuggested improvements: ${processedAttempt.improvement}. `;
          }
          
          if (processedAttempt.practicalApplication) {
            feedback += `\n\nPractical application: ${processedAttempt.practicalApplication}. `;
          }
          
          if (processedAttempt.suggestedResources && processedAttempt.suggestedResources.length > 0) {
            feedback += `\n\nRecommended resources: ${processedAttempt.suggestedResources.join(', ')}.`;
          }
          
          // Add information about missing feedback
          feedback += `\n\nNote: This feedback was reconstructed from evaluation metrics as the original detailed feedback was not available.`;
          
          processedAttempt.feedback = feedback;
        }
        
        return processedAttempt;
      });

      // Log the number of attempts and first feedback to verify
      console.log(`Returning ${processedAttempts.length} attempts for question ${params.questionId}`);
      if (processedAttempts.length > 0) {
        console.log(`First attempt feedback sample: "${processedAttempts[0].feedback?.substring(0, 100)}..."`);
      }
    }

    return NextResponse.json({
      attempts: processedAttempts
    });
  } catch (error) {
    console.error("Error retrieving question evaluations:", error);
    return NextResponse.json(
      { error: "Failed to retrieve question evaluations" },
      { status: 500 }
    );
  }
} 