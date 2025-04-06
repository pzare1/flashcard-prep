"use client"

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import VoiceInput from "@/components/VoiceInput";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BookOpen,
  Brain,
  Target,
  Trophy,
  ArrowRight,
  Book,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart,
  FileText,
  ThumbsUp,
  ChevronRight,
  Zap,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";

interface Question {
  _id: string;
  question: string;
  answer: string;
  difficulty: string;
  category: string;
  subcategory: string;
}

interface EvaluationResult {
  score: number;
  feedback: string;
  keyPoints: string[];
  improvement: string;
  confidence: number;
  strengthAreas: string[];
  weaknessAreas: string[];
  suggestedResources: string[];
  technicalAccuracy: number;
  practicalApplication: string;
  timeTaken?: number;
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        <p className="text-purple-300 animate-pulse">Loading Practice Session...</p>
      </div>
    </div>
  );
}

function PracticeContent() {
  const { userId } = useAuth();
  const searchParams = useSearchParams();
  const field = searchParams.get("field");
  const subfield = searchParams.get("subfield");
  const count = searchParams.get("count") || sessionStorage.getItem("expectedQuestionCount") || "10";
  const questionCount = parseInt(count, 10);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [scores, setScores] = useState<number[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [totalTime, setTotalTime] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(
          `/api/questions?field=${field}&subfield=${subfield}&count=${questionCount}`
        );
        const data = await response.json();
        
        if (data.length !== questionCount) {
          console.error(`Expected ${questionCount} questions but received ${data.length}`);
          return;
        }
        
        setQuestions(data);
        setIsLoading(false);
        setStartTime(new Date());
      } catch (error) {
        console.error("Error fetching questions:", error);
        setIsLoading(false);
      }
    };

    if (field && subfield) {
      fetchQuestions();
    }
  }, [field, subfield, questionCount]);

  useEffect(() => {
    const savedProgress = sessionStorage.getItem("currentProgress");
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        setCurrentIndex(progress.currentIndex);
        setScores(progress.scores);
        setTotalTime(progress.totalTime);
        setStreakCount(progress.streakCount);
        sessionStorage.removeItem("currentProgress");
      } catch (error) {
        console.error("Error restoring progress:", error);
      }
    }
  }, []);

  const handleAnswerSubmit = async (answer: string) => {
    try {
      setIsSubmitting(true);
      const endTime = new Date();
      const timeTaken = startTime ? (endTime.getTime() - startTime.getTime()) / 1000 : 0;

      if (!userId) {
        window.location.href = "/sign-in";
        return;
      }

      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAnswer: answer,
          correctAnswer: questions[currentIndex].answer,
          questionId: questions[currentIndex]._id,
          field,
          subfield,
          difficulty: questions[currentIndex].difficulty,
          timeTaken,
          userId
        }),
      });

      const data = await response.json();
      
      if (response.status === 401 || response.status === 403) {
        console.error("Authorization error:", data.error);
        sessionStorage.setItem("currentProgress", JSON.stringify({
          currentIndex,
          scores,
          totalTime,
          streakCount
        }));
        window.location.href = "/sign-in";
        return;
      }
      
      if (!response.ok) {
        console.error("Evaluation error:", data.error);
        return;
      }

      setEvaluationResult(data);
      setCurrentScore(data.score);
      setScores((prev) => [...prev, data.score]);
      setIsRevealed(true);
      setTotalTime((prev) => prev + timeTaken);

      if (data.score >= 7) {
        setStreakCount(prev => prev + 1);
      } else {
        setStreakCount(0);
      }

      if (currentIndex === questions.length - 1) {
        setIsComplete(true);
      }
    } catch (error) {
      console.error("Error evaluating answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsRevealed(false);
      setCurrentScore(null);
      setShowHint(false);
      setStartTime(new Date());
      setAnswer('');
    }
  };

  const renderProgressHeader = () => (
    <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm border border-purple-900/20">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-200">{field}</h1>
          <p className="text-gray-400">{subfield}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <p className="text-sm text-gray-400">Streak</p>
            <div className="flex items-center text-yellow-400">
              <Zap className="h-4 w-4 mr-1" />
              <span className="font-bold">{streakCount}</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Avg. Score</p>
            <p className="font-bold text-purple-400">
              {scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '-'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Time</p>
            <div className="flex items-center text-blue-400">
              <Clock className="h-4 w-4 mr-1" />
              <span className="font-bold">{Math.round(totalTime)}s</span>
            </div>
          </div>
        </div>
      </div>
      <Progress 
        value={(currentIndex / questions.length) * 100} 
        className="h-2 bg-gray-700"
      />
      <div className="flex justify-between mt-2 text-sm text-gray-400">
        <span>Question {currentIndex + 1} of {questionCount}</span>
        <span>{Math.round((currentIndex / questionCount) * 100)}% Complete</span>
      </div>
    </div>
  );

  const renderQuestion = () => (
    <Card className="mt-6 bg-gray-800/50 border-purple-900/20 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl text-gray-200">
            Question {currentIndex + 1}
          </CardTitle>
          <div className="flex items-center space-x-2 mt-2">
            <Badge className="bg-purple-500/20 text-purple-200">
              {questions[currentIndex].category}
            </Badge>
          </div>
        </div>
        {!isRevealed && (
          <button
            onClick={() => setShowHint(true)}
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            <BookOpen className="h-5 w-5" />
          </button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-200 text-lg">
            {questions[currentIndex].question}
          </p>
          {showHint && !isRevealed && (
            <Alert className="bg-purple-500/10 border-purple-500/20">
              <AlertDescription className="text-purple-200">
                Try to think about the key concepts and practical applications. 
                Break down the problem into smaller parts if needed.
              </AlertDescription>
            </Alert>
          )}
          <div className="relative">
            <textarea
              className="w-full h-32 bg-gray-900/50 border border-purple-900/20 rounded-lg p-4 
                       text-gray-200 focus:outline-none focus:border-purple-500/50 transition-colors"
              placeholder="Type your answer here..."
              disabled={isRevealed}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            {!isRevealed && (
              <div className="absolute bottom-3 right-3">
                <VoiceInput onTranscriptionComplete={(text) => setAnswer(prev => prev + " " + text)} />
              </div>
            )}
          </div>
          {!isRevealed && (
            <button
              onClick={() => handleAnswerSubmit(answer)}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 
                       hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl 
                       p-4 font-medium transition-all duration-200 disabled:opacity-50
                       disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                  Evaluating...
                </>
              ) : (
                'Submit Answer'
              )}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderFeedback = () => (
    evaluationResult && (
      <div className="space-y-6 mt-6">
        <Card className="bg-gray-800/50 border-purple-900/20 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-gray-200 flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-400" />
                <span>Evaluation Results</span>
              </CardTitle>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-sm text-gray-400">Score</p>
                  <p className="font-bold text-2xl bg-gradient-to-r from-purple-400 to-purple-600 
                               text-transparent bg-clip-text">
                    {evaluationResult.score.toFixed(1)}/10
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Time</p>
                  <p className="font-bold text-blue-400">
                    {Math.round(evaluationResult.timeTaken || 0)}s
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-gray-300 font-medium mb-2 flex items-center">
                  <Target className="h-4 w-4 mr-2 text-purple-400" />
                  Key Points
                </h4>
                <div className="flex flex-wrap gap-2">
                  {evaluationResult.keyPoints.map((point, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-purple-500/20 text-purple-200"
                    >
                      {point}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-gray-300 font-medium mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {evaluationResult.strengthAreas?.map((strength, index) => (
                      <li key={index} className="text-gray-400 flex items-start">
                        <div className="w-1 h-1 bg-green-400 rounded-full mr-2 mt-2" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-gray-300 font-medium mb-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-amber-400" />
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-2">
                    {evaluationResult.weaknessAreas?.map((weakness, index) => (
                      <li key={index} className="text-gray-400 flex items-start">
                        <div className="w-1 h-1 bg-amber-400 rounded-full mr-2 mt-2" />
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="text-gray-300 font-medium mb-2 flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-yellow-400" />
                  Practical Application
                </h4>
                <p className="text-gray-400">
                  {evaluationResult.practicalApplication}
                </p>
              </div>

              <div>
                <h4 className="text-gray-300 font-medium mb-2 flex items-center">
                  <Book className="h-4 w-4 mr-2 text-blue-400" />
                  Resources for Further Learning
                </h4>
                <ul className="space-y-2">
                  {evaluationResult.suggestedResources?.map((resource, index) => (
                    <li key={index} className="text-gray-400 flex items-center">
                      <BookOpen className="h-4 w-4 mr-2 text-blue-400" />
                      {resource}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {currentIndex < questions.length - 1 && (
          <button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 
                    hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl 
                    p-4 font-medium transition-all duration-200 flex items-center 
                    justify-center space-x-2"
          >
            <span>Next Question</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        )}
      </div>
    )
  );

  const renderCompletionScreen = () => {
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const averageTime = totalTime / questions.length;
    
    return (
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto bg-gray-800/50 rounded-lg backdrop-blur-sm border border-purple-900/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-200 flex items-center space-x-3">
                <Trophy className="h-6 w-6 text-yellow-400" />
                <span>Practice Complete!</span>
              </CardTitle>
            </ CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-purple-900/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <BarChart className="h-5 w-5 text-purple-400" />
                      <h3 className="text-gray-300">Average Score</h3>
                    </div>
                    <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text">
                      {averageScore.toFixed(1)}/10
                    </p>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-purple-900/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-5 w-5 text-blue-400" />
                      <h3 className="text-gray-300">Average Time</h3>
                    </div>
                    <p className="text-4xl font-bold text-blue-400">
                      {Math.round(averageTime)}s
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-gray-300 font-medium mb-3 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-purple-400" />
                    Question Breakdown
                  </h3>
                  <div className="space-y-3">
                    {scores.map((score, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <span className="text-gray-400 min-w-[100px]">Question {index + 1}:</span>
                        <Progress value={score * 10} className="flex-1" />
                        <span className="text-gray-300 min-w-[50px]">{score}/10</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <ThumbsUp className="h-5 w-5 text-purple-400" />
                      <span className="text-gray-300">Achievement Unlocked!</span>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-200">
                      Practice Master
                    </Badge>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={() => window.location.href = '/'}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 
                               hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl 
                               p-4 font-medium transition-all duration-200 flex items-center 
                               justify-center space-x-2"
                    >
                      <span>Practice Another Topic</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    
                    <button
                      onClick={() => window.location.reload()}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-xl 
                               p-4 font-medium transition-all duration-200 flex items-center 
                               justify-center space-x-2"
                    >
                      <RefreshCw className="h-5 w-5" />
                      <span>Retry This Topic</span>
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isComplete) {
    return renderCompletionScreen();
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {renderProgressHeader()}
        {questions[currentIndex] && (
          <div className="mt-8 space-y-6">
            {renderQuestion()}
            {evaluationResult && isRevealed && renderFeedback()}
          </div>
        )}
      </div>
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