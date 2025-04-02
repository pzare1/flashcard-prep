import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import { connectToDatabase } from "@/lib/mongodb";
import Question from "../../../../models/question";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { userAnswer, correctAnswer, questionId, field, subfield, difficulty, timeTaken } = await request.json();

    // Input validation
    if (!userAnswer || !correctAnswer || !questionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is not configured");
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }

    try {
      // Connect to database first to validate question exists
      await connectToDatabase();
      const question = await Question.findById(questionId);
      
      if (!question) {
        return NextResponse.json(
          { error: "Question not found" },
          { status: 404 }
        );
      }

      // Get AI evaluation
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an advanced academic evaluator with expertise in ${field || 'various fields'}${subfield ? `, particularly in ${subfield}` : ''}. Your role is to provide comprehensive, constructive, and educational feedback.

Key Evaluation Criteria:
1. Content Accuracy (40%):
   - Correctness of core concepts
   - Depth of understanding
   - Proper use of terminology
   - Relevance to the question

2. Analytical Skills (30%):
   - Critical thinking demonstration
   - Problem-solving approach
   - Connection between concepts
   - Application of knowledge

3. Structure & Clarity (20%):
   - Logical organization
   - Clear expression of ideas
   - Professional communication
   - Proper examples/illustrations

4. Technical Proficiency (10%):
   - Proper technical terminology
   - Accuracy in technical details
   - Understanding of practical applications

Additional Evaluation Parameters:
- Consider the difficulty level: ${difficulty || 'standard'}
- Detect and flag potential AI-generated responses
- Identify knowledge gaps for targeted improvement
- Provide specific examples for improvement
- Include relevant real-world applications

Response Format (JSON):
{
  "score": number (0-10, precise to 1 decimal),
  "feedback": string (detailed evaluation),
  "keyPoints": string[] (main points covered/missed),
  "improvement": string (specific action items),
  "confidence": number (0-1),
  "strengthAreas": string[] (strong aspects),
  "weaknessAreas": string[] (areas needing improvement),
  "suggestedResources": string[] (learning materials),
  "technicalAccuracy": number (0-1),
  "practicalApplication": string (real-world context)
}`
          },
          {
            role: "user",
            content: `Evaluate this answer for ${field || 'the subject'}${subfield ? ` (${subfield})` : ''}:

Question: "${question.question}"
Correct Answer: "${correctAnswer}"
User Answer: "${userAnswer}"

Provide a comprehensive evaluation following all specified criteria. Format your response as valid JSON only. Do not include any markdown formatting, just the raw JSON object.`
          }
        ],
        model: "llama3-70b-8192",
        temperature: 0.1,
        max_tokens: 1000
      });

      if (!completion.choices[0]?.message?.content) {
        throw new Error("No evaluation response received");
      }

      // Parse evaluation response
      let evaluation;
      try {
        const content = completion.choices[0].message.content.trim();
        
        // Try multiple approaches to extract valid JSON
        let jsonStr = content;
        
        // 1. First try to extract JSON if it's inside markdown code blocks
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          jsonStr = jsonMatch[1].trim();
        } else {
          // 2. If no code blocks, try to strip any markdown formatting
          jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
        }
        
        // 3. Try direct parsing first
        try {
          evaluation = JSON.parse(jsonStr);
        } catch (firstParseError) {
          // 4. If that fails, try to find the JSON object boundaries
          const objectStart = jsonStr.indexOf('{');
          const objectEnd = jsonStr.lastIndexOf('}');
          
          if (objectStart !== -1 && objectEnd !== -1 && objectEnd > objectStart) {
            const potentialJson = jsonStr.substring(objectStart, objectEnd + 1);
            evaluation = JSON.parse(potentialJson);
          } else {
            throw firstParseError; // Re-throw if we can't find valid JSON
          }
        }
      } catch (parseError) {
        console.error("Parse error:", parseError);
        console.error("Raw content:", completion.choices[0].message.content);
        throw new Error("Failed to parse evaluation response");
      }

      // Validate evaluation data and provide defaults for missing fields
      const score = Number(evaluation.score);
      if (isNaN(score) || score < 0 || score > 10) {
        throw new Error(`Invalid score received: ${score}`);
      }

      // Create new attempt record
      const newAttempt = {
        answer: userAnswer,
        score: score,
        feedback: evaluation.feedback || "No feedback provided",
        timeTaken: timeTaken || null,
        keyPoints: Array.isArray(evaluation.keyPoints) ? evaluation.keyPoints : [],
        strengthAreas: Array.isArray(evaluation.strengthAreas) ? evaluation.strengthAreas : [],
        weaknessAreas: Array.isArray(evaluation.weaknessAreas) ? evaluation.weaknessAreas : [],
        technicalAccuracy: evaluation.technicalAccuracy || 0,
        timestamp: new Date()
      };

      // Update question statistics
      question.attempts = [...(question.attempts || []), newAttempt];
      question.scores = [...(question.scores || []), score];
      question.averageScore = question.scores.reduce((a:number, b:number) => a + b, 0) / question.scores.length;
      question.timesAnswered = question.scores.length;
      question.lastReviewedAt = new Date();

      // Calculate additional metrics
      const averageTimeTaken = question.attempts
        .filter((attempt: { timeTaken: number }) => attempt.timeTaken) 
        .reduce((sum: number, attempt: { timeTaken: number }) => sum + attempt.timeTaken, 0) / 
        (question.attempts.filter((attempt: { timeTaken: number }) => attempt.timeTaken).length || 1);

      // Save updated question
      await question.save();

      // Return comprehensive response
      return NextResponse.json({
        success: true,
        score,
        feedback: evaluation.feedback || "No feedback provided",
        keyPoints: Array.isArray(evaluation.keyPoints) ? evaluation.keyPoints : [],
        improvement: evaluation.improvement || "",
        confidence: evaluation.confidence || 1,
        strengthAreas: Array.isArray(evaluation.strengthAreas) ? evaluation.strengthAreas : [],
        weaknessAreas: Array.isArray(evaluation.weaknessAreas) ? evaluation.weaknessAreas : [],
        suggestedResources: Array.isArray(evaluation.suggestedResources) ? evaluation.suggestedResources : [],
        technicalAccuracy: evaluation.technicalAccuracy || 0,
        practicalApplication: evaluation.practicalApplication || "",
        averageScore: question.averageScore,
        timesAnswered: question.timesAnswered,
        averageTimeTaken,
        difficultyLevel: difficulty || 'standard',
        fieldSpecificFeedback: true,
        timestamp: newAttempt.timestamp
      });

    } catch (evalError) {
      console.error("Evaluation error:", evalError);
      return NextResponse.json(
        { 
          error: (evalError as Error).message || "Error during answer evaluation",
          details: process.env.NODE_ENV === 'development' ? evalError : undefined
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Request error:", error);
    return NextResponse.json(
      { 
        error: "Failed to process request",
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}