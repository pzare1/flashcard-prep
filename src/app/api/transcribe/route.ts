// app/api/transcribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import fs from 'fs';
import path from 'path';
import os from 'os';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  let tempFilePath = '';
  
  try {
    // Check if the request is multipart/form-data
    if (!request.headers.get("content-type")?.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Request must be multipart/form-data" },
        { status: 400 }
      );
    }

    // Get form data from the request
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file found in request" },
        { status: 400 }
      );
    }

    // Log information about the audio file
    console.log(`Audio file name: ${audioFile.name || 'unnamed'}, type: ${audioFile.type}, size: ${audioFile.size} bytes`);

    // For Groq API, we need to save the file temporarily
    const tempDir = os.tmpdir();
    tempFilePath = path.join(tempDir, `recording-${Date.now()}.webm`);
    
    // Convert file to buffer and save it
    const audioArrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(audioArrayBuffer);
    fs.writeFileSync(tempFilePath, buffer);
    
    console.log(`Temp file saved to: ${tempFilePath}`);

    try {
      // Check for API key
      if (!process.env.GROQ_API_KEY) {
        console.error("GROQ_API_KEY environment variable is not set");
        return NextResponse.json({ error: "API configuration error" }, { status: 500 });
      }

      console.log("Calling Groq API with Whisper model...");
      
      // Use the buffer directly instead of creating a file stream
      const response = await groq.audio.transcriptions.create({
        model: "whisper-large-v3",
        file: buffer, // Pass the buffer directly
      });

      // Clean up the temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        tempFilePath = '';
      }
      
      console.log("Transcription successful:", response.text?.substring(0, 50) + "...");
      
      return NextResponse.json({ text: response.text });
      
    } catch (groqError) {
      console.error("Error calling Groq API:", groqError);
      
      // Clean up temp file if it exists
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      
      // Extract the actual error message from Groq's error response
      let errorMessage = "Failed to transcribe audio";
      
      if (groqError instanceof Error) {
        errorMessage = groqError.message;
        
        // Try to parse JSON error messages
        try {
          if (errorMessage.includes('{')) {
            const jsonStr = errorMessage.substring(errorMessage.indexOf('{'));
            const jsonError = JSON.parse(jsonStr);
            if (jsonError.error && jsonError.error.message) {
              errorMessage = jsonError.error.message;
            }
          }
        } catch (e) {
          // If JSON parsing fails, use the original error
        }
      }
      
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
    
  } catch (error) {
    console.error("Error processing transcription request:", error);
    
    // Clean up temp file if it exists
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    
    return NextResponse.json(
      { error: "Failed to process audio", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}