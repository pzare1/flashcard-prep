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
  RefreshCw
} from "lucide-react";
import { Footer } from "@/components/Footer";
import PerformanceChart from "../../components/ModernPerformanceChart";

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
    userId: string;
    answer: string;
    score: number;
    timestamp: Date;
    _id: string;
    feedback?: string;
    timeTaken?: number; // Changed from number | null to just number
    keyPoints?: string[];
    strengthAreas?: string[];
    weaknessAreas?: string[];
    improvement?: string;
    practicalApplication?: string;
    suggestedResources?: string[];
  }>;
  notes?: Array<{
    id: string;
    content: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  lastReviewedAt?: Date;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [questionGroups, setQuestionGroups] = useState<any[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const itemsPerPage = 10; // Number of questions to show per page

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
    const fetchQuestionGroups = async () => {
      if (!userId) return;
      try {
        const response = await fetch('/api/questionGroups');
        if (response.ok) {
          const data = await response.json();
          setQuestionGroups(data);
        }
      } catch (error) {
        console.error('Error fetching question groups:', error);
      } finally {
        setLoadingGroups(false);
      }
    };
    
    fetchQuestionGroups();
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

  const getLatestScore = (question: Question): number | null => {
    if (question.score !== undefined && question.score !== null) {
      return question.score;
    }
    
    // If no direct score, try to get it from the most recent attempt
    if (question.attempts && question.attempts.length > 0) {
      // Sort attempts by timestamp (newest first) and get the first one's score
      const sortedAttempts = [...question.attempts].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      return sortedAttempts[0].score;
    }
    
    return null;
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
          const scoreA = getLatestScore(a) || 0;
          const scoreB = getLatestScore(b) || 0;
          return scoreB - scoreA;
        case "difficulty":
          return a.difficulty.localeCompare(b.difficulty);
        case "date":
        default:
          // Get the latest date between lastReviewedAt and the most recent attempt
          const getLatestDate = (q: Question): number => {
            const dates = [];
            
            // Add last review date if exists
            if (q.lastReviewedAt) {
              dates.push(new Date(q.lastReviewedAt).getTime());
            }
            
            // Add latest attempt date if exists
            if (q.attempts && q.attempts.length > 0) {
              const latestAttempt = [...q.attempts].sort(
                (x, y) => new Date(y.timestamp).getTime() - new Date(x.timestamp).getTime()
              )[0];
              dates.push(new Date(latestAttempt.timestamp).getTime());
            }
            
            // If no dates found, use creation date
            if (dates.length === 0) {
              return new Date(q.createdAt).getTime();
            }
            
            // Return the most recent date
            return Math.max(...dates);
          };
          
          return getLatestDate(b) - getLatestDate(a);
      }
    });

  const paginatedQuestions = filteredAndSortedQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAndSortedQuestions.length / itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

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

  useEffect(() => {
    // Reset to page 1 when filters or search changes
    setCurrentPage(1);
  }, [selectedField, selectedDifficulty, searchTerm, sortBy]);

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
        
        {/* Resume Session Section */}
        {questionGroups.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-8"
          >
            <h3 className="text-xl font-bold text-white flex items-center mb-4">
              <RefreshCw className="w-6 h-6 mr-2 text-purple-400" />
              Resume Sessions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {questionGroups.map((group) => (
                <div 
                  key={group._id}
                  className="bg-gray-700/30 rounded-lg p-4 border border-purple-900/20 hover:border-purple-500/50 transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/practice?groupId=${group._id}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-gray-200 font-medium">{group.name}</h4>
                      <p className="text-gray-400 text-sm">
                        {group.currentIndex} of {group.questions.length} completed
                      </p>
                    </div>
                    <div className="bg-purple-500/30 text-purple-300 px-3 py-1 rounded-full text-xs flex items-center">
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Resume
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="bg-gray-800/50 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full"
                        style={{ width: `${(group.currentIndex / group.questions.length) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {Math.round((group.currentIndex / group.questions.length) * 100)}% Complete
                      </span>
                      {group.lastAccessedAt && (
                        <span className="text-xs text-gray-500">
                          Last used: {new Date(group.lastAccessedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <PerformanceChart questions={questions} className="mb-8" />

        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h3 className="text-xl font-bold text-white flex items-center">
              <Clock className="w-6 h-6 mr-2 text-purple-400" />
              Question History
            </h3>
            
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors
                          ${showFilters 
                            ? 'bg-purple-500/20 border-purple-500 text-purple-200' 
                            : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-purple-500'}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-gray-700/30 rounded-lg border border-gray-700/50">
                    <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Field</label>
                      <select
                        value={selectedField}
                        onChange={(e) => setSelectedField(e.target.value)}
                        className="w-full bg-gray-700/50 text-gray-200 rounded-lg p-2 
                                 border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                      >
                        {fields.map(field => (
                          <option key={field} value={field} className="capitalize">
                          {field === 'all' ? 'All Fields' : field}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                    <div className="flex gap-2">
                      {difficulties.map(difficulty => (
                        <button 
                          key={difficulty}
                          onClick={() => setSelectedDifficulty(difficulty)}
                          className={`px-3 py-1.5 text-sm rounded-lg flex-1 capitalize
                                    transition-colors duration-200 ${
                            selectedDifficulty === difficulty
                              ? difficulty === 'beginner' 
                                ? 'bg-green-500/20 text-green-200 border border-green-500/40'
                                : difficulty === 'intermediate'
                                  ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/40'
                                  : difficulty === 'advanced'
                                    ? 'bg-red-500/20 text-red-200 border border-red-500/40'
                                    : 'bg-purple-500/20 text-purple-200 border border-purple-500/40'
                              : 'bg-gray-700/50 text-gray-300 border border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          {difficulty === 'all' ? 'All' : difficulty}
                        </button>
                      ))}
                    </div>
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSortBy('date')}
                        className={`px-3 py-1.5 text-sm rounded-lg flex-1 flex items-center justify-center
                                  transition-colors duration-200 ${
                          sortBy === 'date'
                            ? 'bg-blue-500/20 text-blue-200 border border-blue-500/40'
                            : 'bg-gray-700/50 text-gray-300 border border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                        Date
                      </button>
                      <button
                        onClick={() => setSortBy('score')}
                        className={`px-3 py-1.5 text-sm rounded-lg flex-1 flex items-center justify-center
                                  transition-colors duration-200 ${
                          sortBy === 'score'
                            ? 'bg-green-500/20 text-green-200 border border-green-500/40'
                            : 'bg-gray-700/50 text-gray-300 border border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <Award className="w-3.5 h-3.5 mr-1.5" />
                        Score
                      </button>
                      <button
                        onClick={() => setSortBy('difficulty')}
                        className={`px-3 py-1.5 text-sm rounded-lg flex-1 flex items-center justify-center
                                  transition-colors duration-200 ${
                          sortBy === 'difficulty'
                            ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/40'
                            : 'bg-gray-700/50 text-gray-300 border border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
                        Difficulty
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-3">
                  <button
                    onClick={() => {
                      setSelectedField('all');
                      setSelectedDifficulty('all');
                      setSearchTerm('');
                      setSortBy('date');
                      setCurrentPage(1); // Reset to first page
                    }}
                    className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg border border-gray-600 hover:border-purple-500 transition-colors"
                  >
                    Clear Filters
                  </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          {filteredAndSortedQuestions.length > 0 && (
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4 text-sm text-gray-400 bg-gray-800/40 rounded-lg px-4 py-2 border border-gray-700/30">
              <div className="flex flex-col md:flex-row gap-1 md:items-center">
                <span>
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredAndSortedQuestions.length)} - {Math.min(currentPage * itemsPerPage, filteredAndSortedQuestions.length)} of {filteredAndSortedQuestions.length} filtered questions
                </span>
                {(selectedField !== 'all' || selectedDifficulty !== 'all' || searchTerm) && (
                  <span className="text-gray-500 text-xs md:ml-2">
                    ({filteredAndSortedQuestions.length} of {questions.length} total questions match your filters)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-400">
                  {sortBy === 'date' ? 'Sorted by newest' : sortBy === 'score' ? 'Sorted by highest score' : 'Sorted by difficulty'}
                </span>
                {(selectedField !== 'all' || selectedDifficulty !== 'all' || searchTerm) && (
                  <button
                    onClick={() => {
                      setSelectedField('all');
                      setSelectedDifficulty('all');
                      setSearchTerm('');
                      setCurrentPage(1); // Reset to first page when clearing filters
                    }}
                    className="px-2 py-1 bg-gray-700/50 text-xs text-purple-300 rounded hover:bg-gray-700/70 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {filteredAndSortedQuestions.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-gray-700/50">
              <table className="min-w-full divide-y divide-gray-700/50">
                <thead className="bg-gray-800/60">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/2">
                      Question
                    </th>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Field
                    </th>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Score
                    </th>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Last Review
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800/20 divide-y divide-gray-700/30">
                  {paginatedQuestions.map((question, idx) => (
                    <motion.tr 
                    key={question._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => openQuestionModal(question._id)}
                      className="hover:bg-gray-700/30 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-4 text-sm">
                        <div className="text-gray-200 font-medium line-clamp-2">{question.question}</div>
                        <div className="text-gray-500 text-xs mt-1 line-clamp-1">
                          {getReviewStatus(question)}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-center whitespace-nowrap">
                        <div className="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 rounded-full text-xs inline-block">
                          {question.field}/{question.subField}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs inline-block capitalize ${
                          question.difficulty === 'beginner' 
                            ? 'bg-green-500/10 text-green-300 border border-green-500/30' 
                            : question.difficulty === 'intermediate' 
                              ? 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/30'
                              : 'bg-red-500/10 text-red-300 border border-red-500/30'
                        }`}>
                          {question.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-center">
                        {(() => {
                          const score = getLatestScore(question);
                          if (score !== null) {
                            return (
                              <div className="flex items-center justify-center">
                                <span className={`text-base font-semibold ${
                                  score >= 8 ? 'text-green-400' : 
                                  score >= 5 ? 'text-yellow-400' : 
                                  'text-red-400'
                                }`}>
                                  {score.toFixed(1)}
                                </span>
                                <span className="text-xs text-gray-500 ml-1">/10</span>
                              </div>
                            );
                          } else {
                            return <span className="text-gray-500 text-xs">Not scored</span>;
                          }
                        })()}
                      </td>
                      <td className="px-4 py-4 text-sm text-center text-gray-400">
                        {question.lastReviewedAt ? (
                          new Date(question.lastReviewedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        ) : (
                          <span className="text-gray-500">Never</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center rounded-lg border border-dashed border-gray-700">
              {questions.length === 0 ? (
                <>
                  <Book className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 mb-2">No questions available</p>
                  <p className="text-sm text-gray-500">Start practicing to build your question history</p>
                </>
              ) : (
                <>
                  <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 mb-2">No questions match your filters</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedField('all');
                      setSelectedDifficulty('all');
                      setCurrentPage(1); // Reset to first page
                    }}
                    className="text-purple-400 text-sm hover:text-purple-300 mt-2 underline"
                  >
                    Clear all filters
                  </button>
                </>
              )}
          </div>
          )}
        </div>

        {filteredAndSortedQuestions.length > itemsPerPage && (
          <div className="flex justify-center items-center mt-6 flex-wrap gap-2">
            <button 
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md transition-colors ${
                currentPage === 1 
                  ? 'bg-gray-700/20 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Previous
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button 
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === pageNum 
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 transition-colors'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button 
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md transition-colors ${
                currentPage === totalPages 
                  ? 'bg-gray-700/20 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Next
            </button>
          </div>
        )}
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