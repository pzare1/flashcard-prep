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
import { toast, Toaster } from "sonner";

interface Question {
  _id: string;
  question: string;
  answer: string;
  difficulty: string;
  category: string;
  subcategory: string;
  userId?: string;
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

// Add a utility function for retrying failed requests
const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Server error');
      }
      
      return { data };
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      // Wait for 1 second before retrying (can be adjusted)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error('Max retries reached');
};

function PracticeContent() {
  const { userId, isLoaded } = useAuth();
  const searchParams = useSearchParams();
  const field = searchParams?.get("field");
  const subfield = searchParams?.get("subfield");
  const count = searchParams?.get("count") || sessionStorage.getItem("expectedQuestionCount") || "10";
  const questionCount = parseInt(count, 10);
  const groupId = searchParams?.get("groupId") || null;
  
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isFormValid, setIsFormValid] = useState(true);
  const [questionGroupId, setQuestionGroupId] = useState<string | null>(groupId);

  useEffect(() => {
    if (isLoaded) {
      setIsAuthenticated(!!userId);
    }
  }, [isLoaded, userId]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // If we have a groupId, fetch that specific question group
        if (groupId && userId) {
          const response = await fetch(`/api/questionGroups/${groupId}`);
          if (response.ok) {
            const groupData = await response.json();
            
            // Fetch all questions in this group
            const questionPromises = groupData.questions.map((qId: string) => 
              fetch(`/api/questions/${qId}`).then(res => res.json())
            );
            
            const fetchedQuestions = await Promise.all(questionPromises);
            setQuestions(fetchedQuestions);
            setCurrentIndex(groupData.currentIndex);
            setScores(groupData.scores);
            setIsLoading(false);
            setStartTime(new Date());
            return;
          }
        }
        
        // Otherwise fetch new questions
        const response = await fetch(
          `/api/questions?field=${field}&subfield=${subfield}&count=${questionCount}`
        );
        const data = await response.json();
        
        if (data.length !== questionCount) {
          console.error(`Expected ${questionCount} questions but received ${data.length}`);
          return;
        }
        
        setQuestions(data);
        
        // Create a new question group if user is authenticated
        if (userId && data.length > 0) {
          try {
            const groupResponse = await fetch('/api/questionGroups', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                name: `${field} - ${subfield}`,
                field,
                subField: subfield,
                questions: data.map((q: Question) => q._id)
              })
            });
            
            if (groupResponse.ok) {
              const newGroup = await groupResponse.json();
              setQuestionGroupId(newGroup._id);
            }
          } catch (error) {
            console.error('Error creating question group:', error);
          }
        }
        
        setIsLoading(false);
        setStartTime(new Date());
      } catch (error) {
        console.error("Error fetching questions:", error);
        setIsLoading(false);
      }
    };

    if ((field && subfield) || groupId) {
      fetchQuestions();
    }
  }, [field, subfield, questionCount, groupId, userId]);
  
  useEffect(() => {
    // Update question group progress
    const updateGroupProgress = async () => {
      if (!questionGroupId || !userId) return;
      
      try {
        await fetch(`/api/questionGroups/${questionGroupId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            currentIndex,
            scores,
            completed: isComplete
          })
        });
      } catch (error) {
        console.error('Error updating question group:', error);
      }
    };
    
    updateGroupProgress();
  }, [currentIndex, scores, isComplete, questionGroupId, userId]);

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
    if (!answer.trim()) {
      setIsFormValid(false);
      toast.error("Please enter your answer before submitting", {
        description: "The answer field cannot be empty",
      });
      return;
    }

    if (!isAuthenticated) {
      sessionStorage.setItem("currentProgress", JSON.stringify({
        currentIndex,
        scores,
        totalTime,
        streakCount
      }));
      sessionStorage.setItem("pendingAnswer", answer);
      sessionStorage.setItem("pendingQuestionId", questions[currentIndex]._id);
      sessionStorage.setItem("redirectPath", window.location.pathname + window.location.search);
      
      window.location.href = "/sign-in";
      return;
    }

    try {
      setIsSubmitting(true);
      const endTime = new Date();
      const timeTaken = startTime ? (endTime.getTime() - startTime.getTime()) / 1000 : 0;

      // Log the data being sent for evaluation
      console.log("Submitting answer for evaluation:", {
        questionId: questions[currentIndex]._id,
        questionUserId: questions[currentIndex].userId,
        currentUserId: userId
      });

      const requestBody = {
        userAnswer: answer,
        correctAnswer: questions[currentIndex].answer,
        questionId: questions[currentIndex]._id,
        field,
        subfield,
        difficulty: questions[currentIndex].difficulty,
        timeTaken,
        userId
      };

      // Use the retry mechanism
      const { data } = await fetchWithRetry("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // Validate that required fields exist in the response
      if (!data || typeof data.score !== 'number') {
        console.error("Invalid evaluation response:", data);
        throw new Error("Invalid evaluation format");
      }

      // If we get here, the request was successful
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

      // Show success toast
      toast.success("Answer submitted successfully!", {
        description: `Score: ${data.score}/10`,
      });

    } catch (error) {
      console.error("Error evaluating answer:", error);
      
      if (error instanceof Error) {
        console.error("Error details:", error.message);
        
        // More specific error handling
        if (error.message.includes("Question not found") || error.message.includes("unauthorized access")) {
          toast.error("Question access error", {
            description: "This question may no longer be available or you don't have permission to access it."
          });
          // Maybe skip to the next question
          if (currentIndex < questions.length - 1) {
            handleNext();
          }
        } else {
          toast.error("Failed to evaluate answer", {
            description: `Please try submitting again.`
          });
        }
      } else {
        toast.error("Unknown error occurred", {
          description: "Please try submitting again"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (userId && !isLoading) {
      const pendingAnswer = sessionStorage.getItem("pendingAnswer");
      const pendingQuestionId = sessionStorage.getItem("pendingQuestionId");
      
      if (pendingAnswer && pendingQuestionId) {
        sessionStorage.removeItem("pendingAnswer");
        sessionStorage.removeItem("pendingQuestionId");
        sessionStorage.removeItem("redirectPath");
        
        handleAnswerSubmit(pendingAnswer);
      }
    }
  }, [userId, isLoading]);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsRevealed(false);
      setCurrentScore(null);
      setShowHint(false);
      setStartTime(new Date());
      setAnswer('');
    } else {
      setIsComplete(true);
      // Mark the question group as completed
      if (questionGroupId && userId) {
        fetch(`/api/questionGroups/${questionGroupId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            completed: true
          })
        }).catch(error => {
          console.error('Error completing question group:', error);
        });
      }
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
              className={`w-full h-32 bg-gray-900/50 border rounded-lg p-4 
                       text-gray-200 focus:outline-none transition-colors
                       ${!isFormValid 
                         ? 'border-red-500/50 focus:border-red-500/75' 
                         : 'border-purple-900/20 focus:border-purple-500/50'}`}
              placeholder="Type your answer here..."
              disabled={isRevealed}
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                if (!isFormValid && e.target.value.trim()) {
                  setIsFormValid(true);
                }
              }}
            />
            {!isFormValid && (
              <p className="text-red-400 text-sm mt-1">
                Please enter your answer before submitting
              </p>
            )}
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
              className={`w-full bg-gradient-to-r from-purple-600 to-indigo-600 
                       hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl 
                       p-4 font-medium transition-all duration-200 
                       ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                       flex items-center justify-center`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Evaluating...</span>
                </div>
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
    
    // Calculate some additional stats
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const masteredCount = scores.filter(score => score >= 8).length;
    const needsWorkCount = scores.filter(score => score < 5).length;
    
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto bg-gray-800/50 rounded-lg backdrop-blur-sm border border-purple-900/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-200 flex items-center space-x-3">
                <Trophy className="h-6 w-6 text-yellow-400" />
                <span>Practice Complete!</span>
              </CardTitle>
              <p className="text-gray-400 mt-2">
                You've completed {questionCount} questions in {field} - {subfield}. Here's how you did:
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Performance Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-purple-900/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <BarChart className="h-5 w-5 text-purple-400" />
                      <h3 className="text-gray-300">Average Score</h3>
                    </div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text">
                      {averageScore.toFixed(1)}/10
                    </p>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-purple-900/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-5 w-5 text-blue-400" />
                      <h3 className="text-gray-300">Average Time</h3>
                    </div>
                    <p className="text-3xl font-bold text-blue-400">
                      {Math.round(averageTime)}s
                    </p>
                  </div>

                  <div className="bg-gray-900/50 rounded-lg p-4 border border-purple-900/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <h3 className="text-gray-300">Mastered</h3>
                    </div>
                    <p className="text-3xl font-bold text-green-400">
                      {masteredCount}/{questionCount}
                    </p>
                  </div>

                  <div className="bg-gray-900/50 rounded-lg p-4 border border-purple-900/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="h-5 w-5 text-yellow-400" />
                      <h3 className="text-gray-300">Highest Score</h3>
                    </div>
                    <p className="text-3xl font-bold text-yellow-400">
                      {highestScore}/10
                    </p>
                  </div>
                </div>

                {/* Progress Insights */}
                <div className="bg-gray-900/30 rounded-lg p-6 border border-purple-900/20">
                  <h3 className="text-xl font-semibold text-gray-200 mb-4">Your Progress Insights</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Questions Completed:</span>
                      <span className="text-purple-300 font-medium">{questionCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Total Study Time:</span>
                      <span className="text-purple-300 font-medium">{Math.round(totalTime)}s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Topics Mastered:</span>
                      <span className="text-green-400 font-medium">{masteredCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Topics Needing Improvement:</span>
                      <span className="text-amber-400 font-medium">{needsWorkCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Streak Count:</span>
                      <span className="text-yellow-400 font-medium">{streakCount}</span>
                    </div>
                  </div>
                </div>

                {/* Question Breakdown */}
                <div>
                  <h3 className="text-gray-300 font-medium mb-3 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-purple-400" />
                    Question Breakdown
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {scores.map((score, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <span className="text-gray-400 min-w-[100px]">Question {index + 1}:</span>
                        <Progress 
                          value={score * 10} 
                          className="flex-1" 
                          // Add conditional styling based on score
                          style={{
                            background: score < 5 ? 'rgba(239, 68, 68, 0.2)' : 
                                     score < 8 ? 'rgba(234, 179, 8, 0.2)' : 
                                     'rgba(34, 197, 94, 0.2)'
                          }}
                        />
                        <span className={`font-medium min-w-[50px] ${
                          score < 5 ? 'text-red-400' : 
                          score < 8 ? 'text-yellow-400' : 
                          'text-green-400'
                        }`}>{score}/10</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Achievements */}
                <div className="bg-gray-900/30 rounded-lg p-6 border border-purple-900/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-5 w-5 text-yellow-400" />
                      <span className="text-xl font-semibold text-gray-200">Achievements Unlocked!</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mb-4">
                    <Badge className="bg-purple-500/20 text-purple-200 py-1 px-3">
                      Practice Master
                    </Badge>
                    {averageScore > 7 && (
                      <Badge className="bg-green-500/20 text-green-200 py-1 px-3">
                        Expert Level
                      </Badge>
                    )}
                    {streakCount > 3 && (
                      <Badge className="bg-yellow-500/20 text-yellow-200 py-1 px-3">
                        Streak Champion
                      </Badge>
                    )}
                    {averageTime < 60 && (
                      <Badge className="bg-blue-500/20 text-blue-200 py-1 px-3">
                        Speed Demon
                      </Badge>
                    )}
                    <Badge className="bg-indigo-500/20 text-indigo-200 py-1 px-3">
                      {field} Explorer
                    </Badge>
                  </div>

                  <p className="text-gray-400 mb-6">
                    Congratulations on completing this practice session! Your progress has been saved to your profile dashboard where you can track your improvement over time.
                  </p>
                  
                  {/* Navigation Buttons */}
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <button
                      onClick={() => window.location.href = '/dashboard'}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 
                                hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl 
                                p-4 font-medium transition-all duration-200 flex items-center 
                                justify-center space-x-2"
                    >
                      <span>View Your Dashboard</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    
                    <button
                      onClick={() => window.location.href = '/'}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-xl 
                                p-4 font-medium transition-all duration-200 flex items-center 
                                justify-center space-x-2"
                    >
                      <span>Practice New Topic</span>
                      <BookOpen className="h-5 w-5 ml-2" />
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

  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      // Verify question data
      const currentQuestion = questions[currentIndex];
      if (!currentQuestion._id) {
        console.error("Invalid question data:", currentQuestion);
        toast.error("Invalid question data", {
          description: "Missing question ID. Please refresh the page."
        });
      }
    }
  }, [questions, currentIndex]);

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