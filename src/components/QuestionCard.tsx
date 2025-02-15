"use client";

import { motion } from "framer-motion";
import { Card } from "./ui/card";
import { formatDistanceToNow } from "date-fns";

interface Attempt {
  score: number;
  createdAt: Date;
}

interface QuestionCardProps {
  question: {
    _id: string;
    question: string;
    answer: string;
    userAnswer?: string;
    field: string;
    subField: string;
    difficulty: string;
    notes?: { id: string; content: string; createdAt: Date }[];
    attempts?: Attempt[];
    lastReviewedAt?: Date;
  };
  onOpen: (questionId: string) => void;
}

export default function QuestionCard({ question, onOpen }: QuestionCardProps) {
  // Get the latest attempt
  const latestAttempt = question.attempts && question.attempts.length > 0 
    ? question.attempts[question.attempts.length - 1] 
    : null;

  // Calculate average score (matching Dashboard calculation)
  const averageScore = question.attempts && question.attempts.length > 0
    ? question.attempts.reduce((sum, attempt) => sum + attempt.score, 0) / question.attempts.length
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="bg-gray-800/50 backdrop-blur-sm border border-purple-900/20 p-6 cursor-pointer hover:bg-gray-800/70 transition"
        onClick={() => onOpen(question._id)}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-gray-200 line-clamp-2">
                {question.question}
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-purple-400">{question.field}</span>
                <span className="text-gray-500">/</span>
                <span className="text-gray-400">{question.subField}</span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              question.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
              question.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {question.difficulty}
            </span>
          </div>

          {question.attempts && question.attempts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Latest Score:</span>
                <span className="text-purple-400 font-semibold">
                  {latestAttempt ? `${latestAttempt.score}/10` : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Average Score:</span>
                <span className="text-purple-400 font-semibold">
                  {averageScore ? `${averageScore.toFixed(1)}/10` : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Attempts:</span>
                <span className="text-purple-400 font-semibold">
                  {question.attempts.length}
                </span>
              </div>
              {latestAttempt && (
                <div className="text-xs text-gray-500">
                  Last attempt: {formatDistanceToNow(new Date(latestAttempt.createdAt), { addSuffix: true })}
                </div>
              )}
            </div>
          )}

          {(!question.attempts || question.attempts.length === 0) && (
            <div className="text-sm text-gray-500">
              No attempts yet
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}