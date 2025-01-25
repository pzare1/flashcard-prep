"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FlashcardProps {
  question: string;
  answer: string;
  onSubmit: (answer: string) => void;
  isRevealed: boolean;
  feedbackScore?: number;
}

export default function Flashcard({
  question,
  answer,
  onSubmit,
  isRevealed,
  feedbackScore
}: FlashcardProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);

  const handleSubmit = () => {
    if (userAnswer.trim()) {
      onSubmit(userAnswer);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative h-96">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={isFlipped ? "back" : "front"}
            initial={{ rotateY: isFlipped ? -180 : 0, opacity: 0 }}
            animate={{ rotateY: isFlipped ? 0 : 0, opacity: 1 }}
            exit={{ rotateY: isFlipped ? 0 : 180, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute w-full h-full"
          >
            <div className="w-full h-full bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-900/20">
              {!isFlipped ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-200 mb-4">Question:</h3>
                    <p className="text-gray-300">{question}</p>
                  </div>
                  
                  {!isRevealed && (
                    <div className="space-y-4">
                      <textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full h-32 bg-gray-700 text-gray-200 rounded-lg p-3 border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={handleSubmit}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-3 transition-colors"
                      >
                        Submit Answer
                      </button>
                    </div>
                  )}

                  {isRevealed && (
                    <div className="space-y-4">
                      <div className="bg-gray-700/50 rounded-lg p-4">
                        <h4 className="text-gray-300 font-semibold mb-2">Your Answer:</h4>
                        <p className="text-gray-400">{userAnswer}</p>
                      </div>
                      
                      {feedbackScore !== undefined && (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-300">Score:</span>
                          <span className={`font-semibold ${
                            feedbackScore >= 8 ? 'text-green-400' :
                            feedbackScore >= 5 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {feedbackScore}/10
                          </span>
                        </div>
                      )}
                      
                      <button
                        onClick={() => setIsFlipped(true)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-3 transition-colors"
                      >
                        Show Correct Answer
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-200 mb-4">Correct Answer:</h3>
                    <p className="text-gray-300">{answer}</p>
                  </div>
                  
                  <button
                    onClick={() => setIsFlipped(false)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-3 transition-colors"
                  >
                    Show Question
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}