import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the request body
    const body = await request.json();
    const { linkedinUrl } = body;

    if (!linkedinUrl) {
      return NextResponse.json(
        { error: "LinkedIn URL is required" },
        { status: 400 }
      );
    }

    // Use LLM to extract content from the URL
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a LinkedIn job post extractor. Your task is to analyze a LinkedIn job URL and extract key information about the job including title, company, and full description. If the URL is not valid or doesn't contain sufficient information, explain the issue."
        },
        {
          role: "user",
          content: `Extract job information from this LinkedIn job posting: ${linkedinUrl}. Format your response as valid JSON with title, company, and description fields.`
        }
      ],
      model: "llama3-70b-8192",
      temperature: 0.2,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("Failed to extract job information");
    }

    // Try to parse the LLM response as JSON
    try {
      // Find JSON object in the response (might be surrounded by additional text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        return NextResponse.json({
          jobTitle: parsedData.title || "",
          jobDescription: parsedData.description || "",
          company: parsedData.company || "",
          success: true
        });
      } else {
        // If we can't parse JSON, return the raw content
        return NextResponse.json({
          jobDescription: content,
          success: true
        });
      }
    } catch (parseError) {
      console.error("Error parsing job data:", parseError);
      return NextResponse.json({
        jobDescription: content,
        success: true
      });
    }
  } catch (error) {
    console.error("Error scraping LinkedIn job:", error);
    return NextResponse.json(
      { error: "Failed to extract job information" },
      { status: 500 }
    );
  }
} 