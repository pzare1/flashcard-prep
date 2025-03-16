// components/VoiceInput.tsx
"use client"

import React, { useState, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceInputProps {
  onTranscriptionComplete: (text: string) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscriptionComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');

  // Simple function to start recording
  const startRecording = () => {
    setError(null);
    transcriptRef.current = '';
    
    try {
      // Check if speech recognition is supported
      const SpeechRecognition = (window as any).SpeechRecognition || 
                               (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        throw new Error("Speech recognition not supported in this browser. Try Chrome or Edge.");
      }
      
      // Create a new recognition instance
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      // Handle the results
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join(' ');
        
        transcriptRef.current = transcript;
        console.log("Current transcript:", transcript);
      };
      
      // Handle errors
      recognition.onerror = (event: any) => {
        console.error("Recognition error:", event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
        setIsProcessing(false);
      };
      
      // When recognition ends
      recognition.onend = () => {
        console.log("Recognition ended, final transcript:", transcriptRef.current);
        
        if (transcriptRef.current) {
          onTranscriptionComplete(transcriptRef.current);
        } else {
          setError("No speech detected. Please try again and speak clearly.");
        }
        
        setIsRecording(false);
        setIsProcessing(false);
      };
      
      // Start the recognition
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
      
    } catch (err) {
      console.error("Error starting recognition:", err);
      setError(err instanceof Error ? err.message : "Failed to start speech recognition");
      setIsRecording(false);
    }
  };

  // Simple function to stop recording
  const stopRecording = () => {
    setIsProcessing(true);
    
    if (recognitionRef.current) {
      try {
        // This will trigger the onend event which processes the transcript
        recognitionRef.current.stop();
      } catch (err) {
        console.error("Error stopping recognition:", err);
        setError("Error stopping speech recognition");
        setIsRecording(false);
        setIsProcessing(false);
      }
    } else {
      setIsRecording(false);
      setIsProcessing(false);
      setError("No active recording to stop");
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`p-3 rounded-full transition-colors ${
          isRecording 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-purple-600 hover:bg-purple-700'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isRecording ? "Stop recording" : "Start recording"}
      >
        {isProcessing ? (
          <Loader2 className="h-5 w-5 text-white animate-spin" />
        ) : isRecording ? (
          <MicOff className="h-5 w-5 text-white" />
        ) : (
          <Mic className="h-5 w-5 text-white" />
        )}
      </button>
      
      {isRecording && (
        <span className="absolute -top-2 -right-2 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      )}
      
      {error && (
        <div className="absolute bottom-full right-0 mb-2 p-2 bg-black/80 text-white text-xs rounded w-48 z-10">
          {error}
        </div>
      )}
      
      {isRecording && (
        <div className="absolute top-full right-0 mt-2 p-2 bg-red-500/20 text-white text-xs rounded w-48">
          Recording... Speak clearly
        </div>
      )}
    </div>
  );
};

export default VoiceInput;