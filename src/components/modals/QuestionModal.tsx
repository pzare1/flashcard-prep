"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Edit2, Save, Plus, Trash2, BookOpen, MessageSquare, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Note {
  id: string;
  content: string;
  createdAt: Date;
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
  };
  onSave: (questionId: string, data: { answer?: string; notes?: Note[] }) => void;
}

export function QuestionModal({ isOpen, onClose, question, onSave }: QuestionModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnswer, setEditedAnswer] = useState(question.answer);
  const [notes, setNotes] = useState<Note[]>(question.notes || []);
  const [newNote, setNewNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'answer' | 'notes'>('answer');
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
            
            {/* Tabs for switching between answer and notes */}
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
              ) : (
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