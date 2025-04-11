"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { QuestionCard } from "@/components/QuestionCard";
import { QuestionModal } from "@/components/modals/QuestionModal";
import { 
  Search, 
  Book, 
  Award, 
  Clock, 
  BrainCircuit,
  SlidersHorizontal,
  ChevronRight
} from "lucide-react";
import { Footer } from "@/components/Footer";
import PerformanceChart from "../../components/ModernPerformanceChart";
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Question {
  _id: string;
  field: string;
  subField: string;
  question: string;
  answer: string;
  userAnswer?: string;
  difficulty: string;
  score?: number;
  attempts?: Array<{
    answer: string;
    score: number;
    timestamp: Date;
    _id: string;
  }>;
  notes?: Array<{
    id: string;
    content: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  lastReviewedAt?: Date;
}

interface PracticeProgress {
  _id: string;
  field: string;
  subField: string;
  questions: string[];
  currentIndex: number;
  scores: number[];
  totalTime: number;
  lastUpdatedAt: Date;
}

export default function Dashboard() {
  const { userId } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedField, setSelectedField] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [inProgressSessions, setInProgressSessions] = useState<PracticeProgress[]>([]);
  const [loadingInProgress, setLoadingInProgress] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`/api/questions/user/${userId}`);
        const data = await response.json();
        setQuestions(data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [userId]);

  useEffect(() => {
    const fetchInProgressSessions = async () => {
      if (!userId) {
        setLoadingInProgress(false);
        return;
      }
      
      try {
        const response = await fetch('/api/practice-progress', {
          method: 'POST'
        });
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setInProgressSessions(data);
        } else {
          console.error("Unexpected response format:", data);
          setInProgressSessions([]);
        }
      } catch (error) {
        console.error("Error fetching in-progress sessions:", error);
        setInProgressSessions([]);
      } finally {
        setLoadingInProgress(false);
      }
    };

    fetchInProgressSessions();
  }, [userId]);

  const handleSaveQuestion = async (questionId: string, data: any) => {
    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          lastReviewedAt: new Date()
        }),
      });

      if (response.ok) {
        const updatedQuestion = await response.json();
        setQuestions(questions.map(q => 
          q._id === questionId ? { ...q, ...updatedQuestion } : q
        ));
      }
    } catch (error) {
      console.error("Error updating question:", error);
    }
  };

  const openQuestionModal = (questionId: string) => {
    const question = questions.find(q => q._id === questionId);
    if (question) {
      setSelectedQuestion(question);
      setIsModalOpen(true);
    }
  };

  const fields = ["all", ...new Set(questions.map(q => q.field))];
  const difficulties = ["all", "beginner", "intermediate", "advanced"];

  const getReviewStatus = (question: Question) => {
    if (!question.lastReviewedAt) return "Not reviewed";
    const daysSinceReview = Math.floor(
      (new Date().getTime() - new Date(question.lastReviewedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceReview < 1) return "Reviewed today";
    if (daysSinceReview === 1) return "Reviewed yesterday";
    return `Reviewed ${daysSinceReview} days ago`;
  };

  const filteredAndSortedQuestions = questions
    .filter(q => {
      const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          q.answer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesField = selectedField === "all" || q.field === selectedField;
      const matchesDifficulty = selectedDifficulty === "all" || q.difficulty === selectedDifficulty;
      return matchesSearch && matchesField && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "score":
          return (b.score || 0) - (a.score || 0);
        case "difficulty":
          return a.difficulty.localeCompare(b.difficulty);
        case "date":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const averageScore = questions.length 
    ? questions
        .flatMap(q => q.attempts || [])
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 20)
        .reduce((acc, attempt) => acc + (attempt.score || 0), 0) / 
        Math.min(
          questions.flatMap(q => q.attempts || []).length,
          20
        ) 
    : 0;

  const totalReviewed = questions.filter(q => q.lastReviewedAt).length;
  const totalNotes = questions.reduce((acc, q) => acc + (q.notes?.length || 0), 0);

  const renderInProgressSessions = () => {
    if (loadingInProgress) {
      return (
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 flex justify-center">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-6 py-1">
              <div className="h-2 bg-gray-700 rounded"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-2 bg-gray-700 rounded col-span-2"></div>
                  <div className="h-2 bg-gray-700 rounded col-span-1"></div>
                </div>
                <div className="h-2 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    console.log("In progress sessions to render:", inProgressSessions);

    if (!inProgressSessions || inProgressSessions.length === 0) {
      return null;
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-10"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Resume Practice Sessions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.isArray(inProgressSessions) && inProgressSessions.map((session) => {
            if (!session || !session.questions || !session.questions.length) {
              return null;
            }
            
            const progressPercentage = (session.currentIndex / session.questions.length) * 100;
            const avgScore = session.scores && session.scores.length > 0 
              ? session.scores.reduce((a, b) => a + b, 0) / session.scores.length
              : 0;
            
            return (
              <motion.div
                key={session._id}
                whileHover={{ y: -5 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{session.field}</h3>
                    <p className="text-sm text-gray-400">{session.subField}</p>
                  </div>
                  <Badge className="bg-yellow-600/20 text-yellow-300 border-yellow-500/30">
                    In Progress
                  </Badge>
                </div>
                
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <div className="text-gray-400">
                      <span className="text-white font-medium">
                        {session.currentIndex} / {session.questions.length}
                      </span> questions
                    </div>
                    {session.scores && session.scores.length > 0 && (
                      <div className="text-gray-400">
                        Avg Score: <span className="text-purple-400 font-medium">{avgScore.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Last updated: {new Date(session.lastUpdatedAt).toLocaleString()}
                  </p>
                  
                  <Link
                    href={`/practice?field=${encodeURIComponent(session.field)}&subfield=${encodeURIComponent(session.subField)}&count=${session.questions.length}&resume=true`}
                    className="w-full mt-2 bg-purple-600/80 hover:bg-purple-500/80 text-white py-2 px-4 rounded-lg flex items-center justify-center text-sm font-medium transition-colors"
                  >
                    Resume Session
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b bg-gray-900/90">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <BrainCircuit className="w-8 h-8 text-purple-400" />
              <span className="text-xs text-gray-400">Average Score</span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-white">{averageScore.toFixed(1)}</span>
              <span className="text-gray-400">/10</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <Book className="w-8 h-8 text-indigo-400" />
              <span className="text-xs text-gray-400">Total Questions</span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-white">{questions.length}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <Clock className="w-8 h-8 text-blue-400" />
              <span className="text-xs text-gray-400">Questions Reviewed</span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-white">{totalReviewed}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <Award className="w-8 h-8 text-green-400" />
              <span className="text-xs text-gray-400">Total Notes</span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-white">{totalNotes}</span>
            </div>
          </motion.div>
        </div>

        <PerformanceChart questions={questions} className="mb-8" />

        {renderInProgressSessions()}

        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h3 className="text-lg font-medium text-white">Question History</h3>
            
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64 bg-gray-700/50 text-gray-200 rounded-lg pl-10 pr-4 py-2 
                           border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 rounded-lg border border-gray-600
                         hover:border-purple-500 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">Filters</span>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-700/30 rounded-lg">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Field</label>
                    <select
                      value={selectedField}
                      onChange={(e) => setSelectedField(e.target.value)}
                      className="w-full bg-gray-700/50 text-gray-200 rounded-lg p-2 
                               border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                    >
                      {fields.map(field => (
                        <option key={field} value={field} className="capitalize">
                          {field}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Difficulty</label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="w-full bg-gray-700/50 text-gray-200 rounded-lg p-2 
                               border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                    >
                      {difficulties.map(difficulty => (
                        <option key={difficulty} value={difficulty} className="capitalize">
                          {difficulty}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-gray-700/50 text-gray-200 rounded-lg p-2 
                               border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="date">Date</option>
                      <option value="score">Score</option>
                      <option value="difficulty">Difficulty</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedQuestions.map((question) => (
              <QuestionCard
                key={question._id}
                question={question}
                onOpen={openQuestionModal}
              />
            ))}
          </div>
        </div>
      </div>
      {selectedQuestion && (
        <QuestionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedQuestion(null);
          }}
          question={selectedQuestion}
          onSave={handleSaveQuestion}
        />
      )}

      {questions.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Book className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">No Questions Yet</h3>
          <p className="text-gray-400">
            Start practicing to build your question history!
          </p>
        </motion.div>
      )}

      {filteredAndSortedQuestions.length === 0 && questions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">No Results Found</h3>
          <p className="text-gray-400">
            Try adjusting your search or filters
          </p>
        </motion.div>
      )}
      <Footer />
    </div>
  );
}