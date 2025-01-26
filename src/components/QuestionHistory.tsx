"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card } from "./ui/card";

interface Question {
  _id: string;
  question: string;
  answer: string;
  field: string;
  subField: string;
  averageScore: number;
  difficulty: string;
  timesAnswered: number;
}

interface QuestionCardProps extends Question {}

const QuestionCard = ({ question, answer, field, subField, averageScore, difficulty, timesAnswered }: QuestionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full p-6 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
        <div className="space-y-4">
          <div className="flex justify-between items-start gap-4">
            <h3 className="text-lg font-medium text-gray-100">
              {question}
            </h3>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                averageScore >= 7 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                averageScore >= 5 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {averageScore.toFixed(1)}/10
              </span>
              <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/30">
                {difficulty}
              </span>
            </div>
          </div>

          <p className="text-gray-300 text-sm leading-relaxed">
            {answer}
          </p>

          <div className="flex justify-between items-center pt-2 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-md bg-gray-700/50">
                {field}
              </span>
              <span className="text-gray-500">→</span>
              <span className="px-2 py-1 rounded-md bg-gray-700/50">
                {subField}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg 
                className="w-4 h-4 text-gray-500" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>{timesAnswered} practices</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

interface QuestionHistoryProps {
  questions: Question[];
  selectedField: string;
  onFieldChange: (field: string) => void;
}

export const QuestionHistory = ({ questions, selectedField, onFieldChange }: QuestionHistoryProps) => {
  const fields = ["All", ...Array.from(new Set(questions.map(q => q.field)))];
  
  const filteredQuestions = selectedField === "All" 
    ? questions 
    : questions.filter(q => q.field === selectedField);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 p-1 bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700/50 w-fit">
        {fields.map((field) => (
          <button
            key={field}
            onClick={() => onFieldChange(field)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
              field === selectedField
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {field}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <QuestionCard
              key={question._id}
              {...question}
            />
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
};