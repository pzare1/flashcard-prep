"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, MessageSquare, TrendingUp, Star, BarChart2, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface Attempt {
  answer: string;
  score: number;
  timestamp: Date;
  feedback?: string;
  keyPoints?: string[];
  strengthAreas?: string[];
  weaknessAreas?: string[];
  suggestedResources?: string[];
  practicalApplication?: string;
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
  const [isHovered, setIsHovered] = useState(false);
  
  const latestScore = question.attempts && question.attempts.length > 0 
    ? question.attempts[question.attempts.length - 1].score 
    : question.score || 0;

  const averageScore = question.attempts && question.attempts.length > 0
    ? question.attempts.reduce((acc, curr) => acc + curr.score, 0) / question.attempts.length
    : question.score || 0;

  const bestScore = question.attempts && question.attempts.length > 0
    ? Math.max(...question.attempts.map(a => a.score))
    : question.score || 0;
    
  const getScoreColor = (score: number) => {
    if (score >= 8) return "from-green-500/30 to-green-500/10";
    if (score >= 5) return "from-yellow-500/30 to-yellow-500/10";
    return "from-red-500/30 to-red-500/10";
  };
  
  const getScoreTextColor = (score: number) => {
    if (score >= 8) return "text-green-300";
    if (score >= 5) return "text-yellow-300";
    return "text-red-300";
  };

  // Check if the question has feedback data
  const hasFeedbackData = question.attempts && question.attempts.length > 0 && (
    question.attempts.some(attempt => 
      attempt.feedback || 
      (attempt.keyPoints && attempt.keyPoints.length > 0) ||
      (attempt.strengthAreas && attempt.strengthAreas.length > 0) ||
      (attempt.weaknessAreas && attempt.weaknessAreas.length > 0) ||
      (attempt.suggestedResources && attempt.suggestedResources.length > 0) ||
      attempt.practicalApplication
    )
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-xl 
                border border-gray-700/50 shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -ml-16 -mb-16"></div>
      
      <div className="relative p-6 space-y-5">
        {/* Header with question text */}
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-lg font-medium text-gray-100 leading-tight">{question.question}</h3>
          <div className="flex items-center gap-1.5">
            {question.notes && question.notes.length > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-700/40 rounded-full">
                <MessageSquare className="w-3.5 h-3.5 text-purple-300" />
                <span className="text-xs font-medium text-gray-300">{question.notes.length}</span>
              </div>
            )}
            
            {hasFeedbackData && (
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-700/40 rounded-full">
                <CheckCircle className="w-3.5 h-3.5 text-green-300" />
                <span className="text-xs font-medium text-gray-300">Feedback</span>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-purple-500/20 to-purple-500/10 text-purple-300 border border-purple-500/30">
            {question.field}
          </span>
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-indigo-500/20 to-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            {question.subField}
          </span>
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-blue-500/20 to-blue-500/10 text-blue-300 border border-blue-500/30">
            {question.difficulty}
          </span>
        </div>

        {/* Score visualization */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* Latest Score */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-400">Latest Score</span>
              </div>
              <span className={`text-sm font-semibold ${getScoreTextColor(latestScore)}`}>
                {latestScore.toFixed(1)}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(latestScore / 10) * 100}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(latestScore)}`}
              />
            </div>
          </div>
          
          {/* Best Score */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-400">Best Score</span>
              </div>
              <span className={`text-sm font-semibold ${getScoreTextColor(bestScore)}`}>
                {bestScore.toFixed(1)}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(bestScore / 10) * 100}%` }}
                transition={{ duration: 1, delay: 0.4 }}
                className={`h-full rounded-full bg-gradient-to-r from-blue-500/30 to-blue-500/10`}
              />
            </div>
          </div>
        </div>
        
        {/* Additional stats */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Average Score */}
          {question.attempts && question.attempts.length > 1 && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-800/50 rounded-full">
              <BarChart2 className="w-3.5 h-3.5 text-purple-300" />
              <span className="text-xs font-medium text-gray-300">Avg: {averageScore.toFixed(1)}</span>
            </div>
          )}
          
          {/* Attempts Count */}
          {question.attempts && question.attempts.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-800/50 rounded-full">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-300">
                {question.attempts.length} attempt{question.attempts.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* View Details Button */}
        <button
          onClick={() => onOpen(question._id)}
          className="group w-full flex items-center justify-center gap-2 px-4 py-3 
                   bg-gradient-to-r from-purple-500/20 to-purple-600/20 
                   hover:from-purple-500/30 hover:to-purple-600/30
                   border border-purple-500/30 rounded-lg text-purple-300 
                   shadow-sm hover:shadow-purple-500/20
                   transition-all duration-300"
        >
          <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="font-medium">View Details</span>
        </button>
      </div>
      
      {/* Highlight border effect on hover */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        className="absolute inset-0 border border-purple-500/50 rounded-xl pointer-events-none"
      />
    </motion.div>
  );
}