"use client";

import { motion } from "framer-motion";
import { Eye, MessageSquare, TrendingUp, Star } from "lucide-react";

interface Attempt {
  answer: string;
  score: number;
  timestamp: Date;
}

interface QuestionCardProps {
  question: {
    _id: string;
    question: string;
    answer: string;
    userAnswer?: string;
    score?: number;
    field: string;
    subField: string;
    difficulty: string;
    notes?: { id: string; content: string; createdAt: Date; }[];
    attempts?: Attempt[];
    averageScore?: number;
    bestScore?: number;
  };
  onOpen: (questionId: string) => void;
}

export function QuestionCard({ question, onOpen }: QuestionCardProps) {
  const latestScore = question.attempts && question.attempts.length > 0 
    ? question.attempts[question.attempts.length - 1].score 
    : question.score || 0;

  const averageScore = question.attempts && question.attempts.length > 0
    ? question.attempts.reduce((acc, curr) => acc + curr.score, 0) / question.attempts.length
    : question.score || 0;

  const bestScore = question.attempts && question.attempts.length > 0
    ? Math.max(...question.attempts.map(a => a.score))
    : question.score || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 
                hover:border-purple-500/30 transition-all duration-300"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-lg font-medium text-gray-200">{question.question}</h3>
          <div className="flex items-center gap-3">
            {question.notes && question.notes.length > 0 && (
              <div className="flex items-center gap-1 text-gray-400">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">{question.notes.length}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 text-sm rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {question.field}
          </span>
          <span className="px-2 py-1 text-sm rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {question.subField}
          </span>
          <span className="px-2 py-1 text-sm rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
            {question.difficulty}
          </span>
        </div>

        {/* Scores Section */}
        <div className="flex flex-wrap gap-2">
          {/* Latest Score */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            latestScore >= 8 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
            latestScore >= 5 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
            'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            <TrendingUp className="w-3 h-3" />
            <span>Latest: {latestScore.toFixed(1)}</span>
          </div>

          {/* Average Score - Only show if there are multiple attempts */}
          {question.attempts && question.attempts.length > 1 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium 
                          bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <span>Avg: {averageScore.toFixed(1)}</span>
            </div>
          )}

          {/* Best Score - Only show if it's different from latest */}
          {bestScore > latestScore && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium 
                          bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Star className="w-3 h-3" />
              <span>Best: {bestScore.toFixed(1)}</span>
            </div>
          )}

          {/* Attempts Count */}
          {question.attempts && question.attempts.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium 
                          bg-gray-700/50 text-gray-300 border border-gray-600">
              <span>{question.attempts.length} attempt{question.attempts.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        <button
          onClick={() => onOpen(question._id)}
          className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 
                   bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 
                   hover:bg-purple-500/30 transition-colors"
        >
          <Eye className="w-4 h-4" />
          View Details
        </button>
      </div>
    </motion.div>
  );
}