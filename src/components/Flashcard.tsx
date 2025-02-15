"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, ArrowRight } from "lucide-react";

interface FlashcardProps {
  question: string;
  answer: string;
  category: string;
  subCategory: string;
  questionNumber: number;
  totalQuestions: number;
  onSubmit: (answer: string) => void;
  isRevealed: boolean;
  score?: number;
  onNext?: () => void;
}

export default function Flashcard({
  question,
  answer,
  category,
  subCategory,
  questionNumber,
  totalQuestions,
  onSubmit,
  isRevealed,
  score,
  onNext
}: FlashcardProps) {
  const [userAnswer, setUserAnswer] = useState("");

  useEffect(() => {
    setUserAnswer("");
  }, [questionNumber]);

  const handleSubmit = () => {
    if (userAnswer.trim()) {
      onSubmit(userAnswer);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div 
        className="relative bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-purple-900/20"
        initial={false}
        animate={{ height: isRevealed ? 'auto' : '24rem' }}
      >
        <div className="space-y-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-200">Question {questionNumber}</h3>
              <div className="text-sm text-gray-400">
                <span className="text-purple-400">{category}</span> / {subCategory}
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <p className="text-gray-300 text-lg">{question}</p>
          </motion.div>

          {!isRevealed ? (
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full h-32 bg-gray-700 text-gray-200 rounded-lg p-4 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleSubmit}
                className="w-full bg-purple-500/20 border-2 border-purple-500 text-white rounded-lg p-4 font-medium transition-all flex items-center justify-center gap-2 group"
              >
                Submit Answer
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 space-y-4"
            >
              <div className="p-4 rounded-lg bg-gray-800/50 border border-purple-500/20">
                <h4 className="text-lg font-semibold text-purple-400 mb-2">Correct Answer:</h4>
                <p className="text-gray-300">{answer}</p>
              </div>
              
              <div className="flex justify-center mt-4">
                <div className="inline-block px-6 py-3 rounded-full bg-purple-500/20 border border-purple-500">
                  <span className="text-xl font-semibold text-purple-300">
                    Score: {score !== null ? score : '-'}/10
                  </span>
                </div>
              </div>

              {onNext && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={onNext}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition"
                  >
                    Next Question
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}