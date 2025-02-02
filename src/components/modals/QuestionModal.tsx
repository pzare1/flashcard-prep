"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Edit2, Save, Plus, Trash2 } from "lucide-react";
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
    }
  }, [newNote, notes, question._id, onSave]);

  const deleteNote = useCallback((noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);

    // Save immediately when deleting a note
    onSave(question._id, {
      notes: updatedNotes
    });
  }, [notes, question._id, onSave]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addNote();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-4xl bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 
                     border border-gray-700/50 overflow-y-auto max-h-[90vh]"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-6">
              {/* Question Header */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 text-sm rounded-full bg-purple-500/20 text-purple-300 
                                 border border-purple-500/30">
                    {question.field}
                  </span>
                  <span className="px-3 py-1 text-sm rounded-full bg-indigo-500/20 text-indigo-300 
                                 border border-indigo-500/30">
                    {question.subField}
                  </span>
                  <span className="px-3 py-1 text-sm rounded-full bg-blue-500/20 text-blue-300 
                                 border border-blue-500/30">
                    {question.difficulty}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-white mb-4">{question.question}</h2>
              </div>

              {/* Answer Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-200">Answer</h3>
                  <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    disabled={isSaving}
                    className={`flex items-center gap-2 transition-colors ${
                      isEditing 
                        ? 'text-green-400 hover:text-green-300' 
                        : 'text-purple-400 hover:text-purple-300'
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
                  <textarea
                    value={editedAnswer}
                    onChange={(e) => setEditedAnswer(e.target.value)}
                    className="w-full h-40 bg-gray-700/50 text-gray-200 rounded-lg p-3 
                             border border-gray-600 focus:border-purple-500 focus:ring-2 
                             focus:ring-purple-500"
                  />
                ) : (
                  <p className="text-gray-300">{editedAnswer}</p>
                )}
              </div>

              {/* Notes Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-200">Notes</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a note..."
                    className="flex-1 bg-gray-700/50 text-gray-200 rounded-lg px-3 py-2 
                             border border-gray-600 focus:border-purple-500 focus:ring-2 
                             focus:ring-purple-500"
                  />
                  <button
                    onClick={addNote}
                    className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 
                             rounded-lg text-purple-300 hover:bg-purple-500/30 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <AnimatePresence mode="popLayout">
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-gray-700/30 rounded-lg p-4 flex items-start justify-between"
                      >
                        <div>
                          <p className="text-gray-300">{note.content}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}