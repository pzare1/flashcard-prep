"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Edit2,
  Save,
  Plus,
  Trash2,
  BookOpen,
  MessageSquare,
  Calendar,
  CheckCircle,
  AlertCircle,
  Target,
  BarChart2,
  Zap,
  Book,
  ThumbsUp,
  Eye,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface Note {
  id: string;
  content: string;
  createdAt: Date;
}

interface EvaluationResults {
  score: number;
  time?: number;
  keyPoints: string[];
  strengths: string[];
  improvementAreas: string[];
  practicalApplication?: string;
  resources?: string[];
}

interface Attempt {
  userId: string;
  answer: string;
  score: number;
  feedback?: string;
  keyPoints?: string[];
  strengthAreas?: string[];
  weaknessAreas?: string[];
  technicalAccuracy?: number;
  suggestedResources?: string[];
  practicalApplication?: string;
  timeTaken?: number;
  timestamp: Date;
  evaluationResults?: EvaluationResults;
}

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: {
    _id: string;
    question: string;
    answer: string;
    userAnswer?: string;
    score?: number;
    field: string;
    subField: string;
    difficulty: string;
    notes?: Note[];
    attempts?: Attempt[];
    averageScore?: number;
  };
  onSave: (questionId: string, data: { answer?: string; notes?: Note[] }) => void;
}

export function QuestionModal({ isOpen, onClose, question, onSave }: QuestionModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnswer, setEditedAnswer] = useState(question.answer);
  const [notes, setNotes] = useState<Note[]>(question.notes || []);
  const [newNote, setNewNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'answer' | 'notes' | 'feedback'>('answer');
  const [selectedAttempt, setSelectedAttempt] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const noteInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current && isEditing) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editedAnswer, isEditing]);

  // Focus the note input when tab changes to notes
  useEffect(() => {
    if (activeTab === 'notes' && noteInputRef.current) {
      noteInputRef.current.focus();
    }
  }, [activeTab]);

  // Select the most recent attempt by default when the feedback tab is selected
  useEffect(() => {
    if (activeTab === 'feedback' && question.attempts && question.attempts.length > 0 && selectedAttempt === null) {
      setSelectedAttempt(question.attempts.length - 1);
    }
  }, [activeTab, question.attempts, selectedAttempt]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(question._id, {
        answer: editedAnswer,
        notes: notes
      });
      setIsEditing(false);
      toast.success("Changes saved successfully!");
    } catch (error) {
      toast.error("Failed to save changes. Please try again.");
      console.error("Error saving changes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const addNote = useCallback(() => {
    if (newNote.trim()) {
      const note = {
        id: Date.now().toString(),
        content: newNote,
        createdAt: new Date()
      };
      setNotes(prevNotes => [...prevNotes, note]);
      setNewNote("");

      // Save immediately when adding a note
      onSave(question._id, {
        notes: [...notes, note]
      });
      
      // Show success toast
      toast.success("Note added successfully");
    }
  }, [newNote, notes, question._id, onSave]);

  const deleteNote = useCallback((noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);

    // Save immediately when deleting a note
    onSave(question._id, {
      notes: updatedNotes
    });
    
    // Show success toast
    toast.success("Note deleted");
  }, [notes, question._id, onSave]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addNote();
    }
  };

  // Format date to be more readable
  const formatDate = (date: Date) => {
    const now = new Date();
    const noteDate = new Date(date);
    
    // If today, show time
    if (noteDate.toDateString() === now.toDateString()) {
      return `Today at ${noteDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // If yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (noteDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${noteDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise show date and time
    return noteDate.toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-400";
    if (score >= 5) return "text-yellow-400";
    return "text-red-400";
  };

  // Get progress bar color based on score
  const getProgressColor = (score: number) => {
    if (score >= 8) return "bg-gradient-to-r from-green-500 to-green-600";
    if (score >= 5) return "bg-gradient-to-r from-yellow-500 to-yellow-600";
    return "bg-gradient-to-r from-red-500 to-red-600";
  };

  // Function to determine if we should use evaluationResults or the older fields
  const getAttemptDetails = (attempt: Attempt) => {
    if (attempt.evaluationResults) {
      return {
        score: attempt.evaluationResults.score,
        timeTaken: attempt.evaluationResults.time,
        keyPoints: attempt.evaluationResults.keyPoints,
        strengths: attempt.evaluationResults.strengths,
        weaknessAreas: attempt.evaluationResults.improvementAreas,
        practicalApplication: attempt.evaluationResults.practicalApplication,
        suggestedResources: attempt.evaluationResults.resources,
      };
    }
    
    // Fallback to older fields
    return {
      score: attempt.score,
      timeTaken: attempt.timeTaken,
      keyPoints: attempt.keyPoints || [],
      strengths: attempt.strengthAreas || [],
      weaknessAreas: attempt.weaknessAreas || [],
      practicalApplication: attempt.practicalApplication,
      suggestedResources: attempt.suggestedResources || [],
    };
  };

  const renderFeedbackSection = () => {
    if (!question.attempts || question.attempts.length === 0 || selectedAttempt === null) {
      return (
        <div className="text-center py-10">
          <Eye className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h4 className="text-xl text-gray-400 mb-2">No Attempts Yet</h4>
          <p className="text-gray-500 max-w-md mx-auto">
            You haven't attempted to answer this question yet. Practice this question to receive feedback on your performance.
          </p>
        </div>
      );
    }
    
    const attempt = question.attempts[selectedAttempt];
    const details = getAttemptDetails(attempt);
    
    return (
      <div className="space-y-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 shadow-md">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-purple-400" />
              Evaluation Results
            </h2>
            
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col items-center bg-gray-800/80 rounded-lg px-4 py-2 border border-gray-700/70">
                <span className="text-sm text-gray-400">Score</span>
                <span className={`text-xl font-bold ${getScoreColor(details.score)}`}>
                  {details.score.toFixed(1)}/10
                </span>
              </div>
              
              {details.timeTaken && (
                <div className="flex flex-col items-center bg-gray-800/80 rounded-lg px-4 py-2 border border-gray-700/70">
                  <span className="text-sm text-gray-400">Time</span>
                  <span className="text-xl font-bold text-blue-400">
                    {Math.round(details.timeTaken)}s
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 mb-6">
            <h3 className="text-gray-300 font-medium mb-2">Your Answer</h3>
            <p className="text-gray-400 whitespace-pre-wrap">{attempt.answer}</p>
          </div>
          
          {/* Key Points */}
          <div className="space-y-1 mb-6">
            <h3 className="text-gray-200 font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              Key Points
            </h3>
            
            {details.keyPoints && details.keyPoints.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {details.keyPoints.map((point, idx) => (
                  <span key={idx} className="px-3 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/30 rounded-full text-sm">
                    {point}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No key points available</p>
            )}
          </div>
          
          {/* Strengths & Areas for Improvement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-gray-200 font-medium flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Strengths
              </h3>
              
              {details.strengths && details.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {details.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-300">
                      <div className="min-w-4 h-4 mt-1">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      </div>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No strengths specified</p>
              )}
            </div>
            
            <div>
              <h3 className="text-gray-200 font-medium flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Areas for Improvement
              </h3>
              
              {details.weaknessAreas && details.weaknessAreas.length > 0 ? (
                <ul className="space-y-2">
                  {details.weaknessAreas.map((weakness, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-300">
                      <div className="min-w-4 h-4 mt-1">
                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                      </div>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No areas for improvement specified</p>
              )}
            </div>
          </div>
          
          {/* Practical Application */}
          {details.practicalApplication && (
            <div className="mb-6">
              <h3 className="text-gray-200 font-medium flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-yellow-400" />
                Practical Application
              </h3>
              <p className="text-gray-300 bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                {details.practicalApplication}
              </p>
            </div>
          )}
          
          {/* Resources for Further Learning */}
          {details.suggestedResources && details.suggestedResources.length > 0 && (
            <div>
              <h3 className="text-gray-200 font-medium flex items-center gap-2 mb-3">
                <Book className="w-4 h-4 text-blue-400" />
                Resources for Further Learning
              </h3>
              <ul className="space-y-2">
                {details.suggestedResources.map((resource, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-300">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span>{resource}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-4xl bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl 
                      overflow-hidden shadow-xl"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>
            
            {/* Header section with question */}
            <div className="p-6 border-b border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-gradient-to-r from-purple-500/20 to-purple-500/10 text-purple-300 
                                border border-purple-500/30">
                  {question.field}
                </span>
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-gradient-to-r from-indigo-500/20 to-indigo-500/10 text-indigo-300 
                                border border-indigo-500/30">
                  {question.subField}
                </span>
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-gradient-to-r from-blue-500/20 to-blue-500/10 text-blue-300 
                                border border-blue-500/30">
                  {question.difficulty}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-white">{question.question}</h2>
            </div>
            
            {/* Tabs for switching between answer, notes, and feedback */}
            <div className="flex border-b border-gray-700/50">
              <button
                onClick={() => setActiveTab('answer')}
                className={`flex items-center gap-2 px-6 py-3 transition-colors ${
                  activeTab === 'answer' 
                    ? 'text-purple-300 border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Answer
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex items-center gap-2 px-6 py-3 transition-colors ${
                  activeTab === 'notes' 
                    ? 'text-purple-300 border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Notes {notes.length > 0 && `(${notes.length})`}
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`flex items-center gap-2 px-6 py-3 transition-colors ${
                  activeTab === 'feedback' 
                    ? 'text-purple-300 border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <BarChart2 className="w-4 h-4" />
                Feedback {question.attempts && question.attempts.length > 0 && `(${question.attempts.length})`}
              </button>
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="ml-auto mr-4 text-gray-400 hover:text-white transition-colors my-auto"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 max-h-[calc(90vh-165px)] overflow-y-auto">
              {activeTab === 'answer' ? (
                /* Answer section */
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-200 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-purple-400" />
                      Answer
                    </h3>
                    <button
                      onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                      disabled={isSaving}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        isEditing 
                          ? 'bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30'
                          : 'bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30'
                      }`}
                    >
                      {isEditing ? (
                        <>
                          <Save className="w-4 h-4" />
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </>
                      ) : (
                        <>
                          <Edit2 className="w-4 h-4" />
                          Edit Answer
                        </>
                      )}
                    </button>
                  </div>
                  
                  {isEditing ? (
                    <div className="relative">
                      <textarea
                        ref={textareaRef}
                        value={editedAnswer}
                        onChange={(e) => setEditedAnswer(e.target.value)}
                        className="w-full min-h-[200px] bg-gray-700/50 text-gray-200 rounded-lg p-4
                                  border border-gray-600 focus:border-purple-500 focus:ring-2 
                                  focus:ring-purple-500 resize-none transition-all"
                        placeholder="Enter your answer..."
                      />
                      <div className="absolute right-3 bottom-3 flex items-center gap-2 text-xs text-gray-400">
                        <span>{editedAnswer.length} characters</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                      <p className="text-gray-300 whitespace-pre-wrap">{editedAnswer}</p>
                    </div>
                  )}
                </div>
              ) : activeTab === 'notes' ? (
                /* Notes section */
                <div className="space-y-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-200 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-purple-400" />
                      Notes
                    </h3>
                  </div>
                  
                  <div className="relative">
                    <input
                      ref={noteInputRef}
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a note... (Press Enter to save)"
                      className="w-full bg-gray-700/50 text-gray-200 rounded-lg px-4 py-3
                                border border-gray-600 focus:border-purple-500 focus:ring-2 
                                focus:ring-purple-500 pr-12"
                    />
                    <button
                      onClick={addNote}
                      disabled={!newNote.trim()}
                      className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md transition-colors ${
                        newNote.trim() 
                          ? 'text-purple-300 hover:bg-purple-500/20' 
                          : 'text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <AnimatePresence mode="popLayout">
                    {notes.length > 0 ? (
                      <div className="space-y-3 mt-6">
                        {notes.map((note, index) => (
                          <motion.div
                            key={note.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className={`bg-gradient-to-r rounded-lg p-5 
                                      border border-gray-700/50 relative group
                                      ${index % 2 === 0 
                                        ? 'from-gray-800/80 to-gray-800/40' 
                                        : 'from-gray-700/40 to-gray-800/80'}`}
                          >
                            <p className="text-gray-300 whitespace-pre-wrap">{note.content}</p>
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700/30">
                              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(new Date(note.createdAt))}
                              </p>
                              <button
                                onClick={() => deleteNote(note.id)}
                                className="text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-500/10"
                                aria-label="Delete note"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <MessageSquare className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                        <h4 className="text-gray-400 mb-1">No notes yet</h4>
                        <p className="text-gray-600 text-sm">Add your first note above</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Feedback section */
                <div>
                  {renderFeedbackSection()}
                </div>
              )}
            </div>
            
            {/* Footer actions */}
            <div className="p-4 border-t border-gray-700/50 bg-gray-800/50 flex justify-between items-center">
              <div className="text-xs text-gray-500">
                Question ID: {question._id.substring(0, 8)}...
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-300 rounded-lg border border-gray-600 
                          hover:bg-gray-700/50 transition-colors"
                >
                  Close
                </button>
                {activeTab === 'answer' && isEditing && (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500/50 to-purple-600/50
                            border border-purple-500/50 rounded-lg text-white
                            hover:from-purple-500/60 hover:to-purple-600/60 transition-all
                            flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white/90 rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Save Answer
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}