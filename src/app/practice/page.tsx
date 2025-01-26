"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import Flashcard from "../../components/Flashcard";

interface Question {
  _id: string;
  question: string;
  answer: string;
}

export default function PracticePage() {
  const searchParams = useSearchParams();
  const field = searchParams.get("field");
  const subfield = searchParams.get("subfield");
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [scores, setScores] = useState<number[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(
          `/api/questions?field=${field}&subfield=${subfield}`
        );
        const data = await response.json();
        setQuestions(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setIsLoading(false);
      }
    };

    if (field && subfield) {
      fetchQuestions();
    }
  }, [field, subfield]);

  const handleAnswerSubmit = async (answer: string) => {
    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAnswer: answer,
          correctAnswer: questions[currentIndex].answer,
        }),
      });

      const { score } = await response.json();
      
      setScores((prev) => [...prev, score]);
      setIsRevealed(true);

      // Check if this was the last question
      if (currentIndex === questions.length - 1) {
        setIsComplete(true);
      }
    } catch (error) {
      console.error("Error evaluating answer:", error);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsRevealed(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (isComplete) {
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    return (
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-gray-800/50 rounded-lg p-8 backdrop-blur-sm border border-purple-900/20">
            <h2 className="text-2xl font-bold text-gray-200 mb-6">Practice Complete!</h2>
            
            <div className="space-y-6">
              <div>
                <p className="text-gray-300 mb-2">Average Score:</p>
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text">
                  {averageScore.toFixed(1)}/10
                </div>
              </div>

              <div>
                <p className="text-gray-300 mb-2">Question Breakdown:</p>
                <div className="space-y-4">
                  {scores.map((score, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <span className="text-gray-400">Question {index + 1}:</span>
                      <Progress value={score * 10} className="flex-1" />
                      <span className="text-gray-300">{score}/10</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-3 transition-colors"
              >
                Practice Another Topic
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-300">
              Question {currentIndex + 1} of {questions.length}
            </div>
            <div className="text-gray-300">
              {field} - {subfield}
            </div>
          </div>
          <Progress value={(currentIndex / questions.length) * 100} />
        </div>

        {questions[currentIndex] && (
          <Flashcard
            question={questions[currentIndex].question}
            answer={questions[currentIndex].answer}
            onSubmit={handleAnswerSubmit}
            isRevealed={isRevealed}
            feedbackScore={isRevealed ? scores[currentIndex] : undefined}
            category={field || ''}
            subCategory={subfield || ''}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
          />
        )}

        {isRevealed && currentIndex < questions.length - 1 && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleNext}
              className="bg-purple-500/20 border-2 border-purple-500 text-white mb-10 rounded-lg px-6 py-3 transition-colors"
            >
              Next Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
}