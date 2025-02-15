"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import Flashcard from "../../components/Flashcard";
import { QuestionProgress } from "@/components/QuestionProgress";

interface Question {
  _id: string;
  question: string;
  answer: string;
  field: string;
  subField: string;
}

function PracticeContent() {
  const searchParams = useSearchParams();
  const field = searchParams.get("field");
  const subfield = searchParams.get("subfield");
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentScore, setCurrentScore] = useState<number | null>(null);

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
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error('Failed to evaluate answer');
      }

      const score = data.score;
      setCurrentScore(score);

      // Save the attempt with score
      await fetch(`/api/questions/${questions[currentIndex]._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attempts: [{
            answer,
            score,
            timestamp: new Date()
          }]
        }),
      });
      
      setIsRevealed(true);

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
      setCurrentScore(null);
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
    return (
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-gray-800/50 rounded-lg p-8 backdrop-blur-sm border border-purple-900/20">
            <h2 className="text-2xl font-bold text-gray-200 mb-6">Practice Complete!</h2>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4">
        <QuestionProgress
          currentQuestion={currentIndex + 1}
          totalQuestions={questions.length}
          field={field || ''}
          subfield={subfield || ''}
        />

        {currentQuestion && (
          <div className="mt-8">
            <Flashcard
              question={currentQuestion.question}
              answer={currentQuestion.answer}
              category={currentQuestion.field}
              subCategory={currentQuestion.subField}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              onSubmit={handleAnswerSubmit}
              isRevealed={isRevealed}
              score={currentScore ?? undefined}
              onNext={handleNext}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PracticeContent />
    </Suspense>
  );
}