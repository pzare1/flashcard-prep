"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Edit2, Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Note {
  id: string;
  content: string;
  createdAt: Date;
}

interface Attempt {
  answer: string;
  score: number;
  timestamp: Date;
}

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: {
    _id: string;
    question: string;
    answer: string;
    userAnswer?: string;
    field: string;
    subField: string;
    difficulty: string;
    notes?: Note[];
    attempts?: Attempt[];
  };
  onSave: (questionId: string, data: { answer?: string; notes?: Note[] }) => void;
}

export function QuestionModal({ isOpen, onClose, question, onSave }: QuestionModalProps) {
  const [activeTab, setActiveTab] = useState("question");
  const [editedAnswer, setEditedAnswer] = useState(question.answer);
  const [notes, setNotes] = useState<Note[]>(question.notes || []);
  const [newNote, setNewNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const averageScore = question.attempts?.length 
    ? question.attempts.reduce((acc, curr) => acc + curr.score, 0) / question.attempts.length 
    : null;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(question._id, {
        answer: editedAnswer,
        notes: notes
      });
      setIsSaving(false);
      toast.success("Changes saved successfully!");
    } catch (error) {
      toast.error("Failed to save changes. Please try again.");
      console.error("Error saving changes:", error);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-purple-900/20"
      >
        <div className="p-6 border-b border-gray-800">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-200">{question.question}</h2>
              <div className="flex items-center gap-2 text-sm mt-1">
                <span className="text-purple-400">{question.field}</span>
                <span className="text-gray-500">/</span>
                <span className="text-gray-400">{question.subField}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-400"
            >
              ✕
            </button>
          </div>

          <Tabs defaultValue="question" className="w-full">
            <TabsList className="bg-gray-800/50">
              <TabsTrigger value="question">Question & Answer</TabsTrigger>
              <TabsTrigger value="attempts">Attempts History</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="question" className="mt-4">
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Answer</h3>
                  <textarea
                    value={editedAnswer}
                    onChange={(e) => setEditedAnswer(e.target.value)}
                    className="w-full bg-gray-700 text-gray-200 rounded-lg p-3 min-h-[100px]"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="attempts" className="mt-4">
              <div className="space-y-4">
                {averageScore !== null && (
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-purple-400 mb-2">
                      Average Score: {averageScore.toFixed(1)}/10
                    </h3>
                    <p className="text-gray-400">
                      Total Attempts: {question.attempts?.length || 0}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {question.attempts?.map((attempt, index) => (
                    <div
                      key={index}
                      className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-purple-400 font-semibold">
                          Score: {attempt.score}/10
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(attempt.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-gray-300">{attempt.answer}</p>
                    </div>
                  ))}

                  {(!question.attempts || question.attempts.length === 0) && (
                    <div className="text-center text-gray-500 py-4">
                      No attempts yet
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
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
            </TabsContent>
          </Tabs>
        </div>

        <div className="p-6 bg-gray-800/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}