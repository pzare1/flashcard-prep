// app/api/transcribe-direct/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import os from 'os';

// This is a simplified version that always returns a valid response
// without relying on external APIs
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

    // Save the file temporarily to verify it's valid
    const tempDir = os.tmpdir();
    tempFilePath = path.join(tempDir, `recording-${Date.now()}.webm`);
    
    // Convert file to buffer and save it
    const audioArrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(audioArrayBuffer);
    fs.writeFileSync(tempFilePath, buffer);
    
    console.log(`Temp file saved to: ${tempFilePath}`);
    
    // Verify the file exists and has content
    const stats = fs.statSync(tempFilePath);
    console.log(`File size on disk: ${stats.size} bytes`);
    
    if (stats.size < 1000) {
      return NextResponse.json(
        { error: "Audio file is too small or empty" },
        { status: 400 }
      );
    }
    
    // Clean up the temp file
    fs.unlinkSync(tempFilePath);
    
    // Instead of calling an external API, just return a success response
    // In a real application, you would call the Groq API here
    return NextResponse.json({ 
      text: "Your voice has been recorded successfully. This is a placeholder transcription since we're not using an external API.",
      success: true
    });
    
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