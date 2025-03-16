// app/api/audio-debug/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function POST(request: NextRequest) {
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
    console.log(`Audio file name: ${audioFile.name}, type: ${audioFile.type}, size: ${audioFile.size} bytes`);

    // Save the file temporarily to verify it's valid
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `debug-recording-${Date.now()}.webm`);
    
    // Convert file to buffer and save it
    const audioArrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(audioArrayBuffer);
    fs.writeFileSync(tempFilePath, buffer);
    
    console.log(`Debug audio file saved to: ${tempFilePath}`);

    // Return information about the file for debugging
    return NextResponse.json({
      message: "Audio file received successfully",
      details: {
        fileName: audioFile.name,
        fileType: audioFile.type,
        fileSize: audioFile.size,
        tempPath: tempFilePath
      },
      // Return a mock transcription for testing
      text: "This is a test transcription. Your audio file was received correctly."
    });
    
  } catch (error) {
    console.error("Error processing audio file:", error);
    return NextResponse.json(
      { error: "Failed to process audio", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}