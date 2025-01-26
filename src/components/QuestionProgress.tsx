"use client";

import { Progress } from "@/components/ui/progress";

interface QuestionProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  field: string;
  subfield: string;
}

export const QuestionProgress = ({
  currentQuestion,
  totalQuestions,
  field,
  subfield
}: QuestionProgressProps) => {
  return (
    <div className="max-w-2xl mx-auto bg-gray-800/30 backdrop-blur-lg rounded-xl p-4 border border-gray-700/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold bg-gradient-to-r from-purple-100 to-indigo-400 text-transparent bg-clip-text">
            {currentQuestion}
          </span>
          <span className="text-gray-400 font-medium">of {totalQuestions}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">{field}</span>
          <span className="text-gray-600">→</span>
          <span className="px-3 py-1 rounded-full text-sm bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {subfield}
          </span>
        </div>
      </div>
      <Progress 
        value={(currentQuestion / totalQuestions) * 100} 
        className="h-2 bg-gray-700/50"
      />
    </div>
  );
};