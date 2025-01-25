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
  feedbackScore?: number;
  onNext?: () => void;
}

export default function Flashcard({
  question,
  answer,
  questionNumber,
  onSubmit,
  isRevealed,
  feedbackScore,
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

  const renderScore = () => {
    if (feedbackScore === undefined) return null;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2"
      >
        {feedbackScore >= 8 ? (
          <Check className="w-6 h-6 text-green-400" />
        ) : feedbackScore >= 5 ? (
          <Check className="w-6 h-6 text-yellow-400" />
        ) : (
          <X className="w-6 h-6 text-red-400" />
        )}
        <span className={`text-lg font-medium ${
          feedbackScore >= 8 ? 'text-green-400' :
          feedbackScore >= 5 ? 'text-yellow-400' :
          'text-red-400'
        }`}>
          {feedbackScore}/10
        </span>
      </motion.div>
    );
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
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold text-gray-200">Question {questionNumber}</h3>
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
                className="w-full h-32 bg-gray-700 text-gray-200 rounded-lg p-4 border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleSubmit}
                className="w-full bg-purple-600 hover:bg-purple-700 text-gray-200 rounded-lg p-4 font-medium transition-all flex items-center justify-center gap-2 group"
              >
                Submit Answer
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="text-gray-300 font-semibold mb-2">Your Answer</h4>
                <p className="text-gray-400">{userAnswer}</p>
              </div>

              <div className="flex items-center gap-4">
                {renderScore()}
              </div>

              <div className="mt-6 border-t border-gray-700 pt-6">
                <h4 className="text-gray-300 font-semibold mb-2">Correct Answer</h4>
                <p className="text-gray-400">{answer}</p>
              </div>

              {onNext && (
                <button
                  onClick={onNext}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-gray-200 rounded-lg p-4 font-medium transition-all flex items-center justify-center gap-2 group"
                >
                  Next Question
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}