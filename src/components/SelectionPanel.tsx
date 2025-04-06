"use client";

import { Dispatch, SetStateAction } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Sparkles, Info, BookOpen, Clock } from "lucide-react";
import { fields } from "../lib/constants";
import { cardVariants } from "../lib/animation-variants";

const questionCounts = [5, 10, 15, 20];

interface SelectionPanelProps {
  selectedField: string;
  selectedSubField: string;
  setSelectedSubField: Dispatch<SetStateAction<string>>;
  questionCount: number;
  handleQuestionCountChange: (count: number) => void;
  jobTitle: string;
  setJobTitle: Dispatch<SetStateAction<string>>;
  jobDescription: string;
  setJobDescription: Dispatch<SetStateAction<string>>;
  error: string | null;
  isLoading: boolean;
  handleBack: () => void;
  handleStart: () => void;
}

export const SelectionPanel = ({
  selectedField,
  selectedSubField,
  setSelectedSubField,
  questionCount,
  handleQuestionCountChange,
  jobTitle,
  setJobTitle,
  jobDescription,
  setJobDescription,
  error,
  isLoading,
  handleBack,
  handleStart
}: SelectionPanelProps) => {
  return (
    <div>
      {/* Header with progress indicator */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={handleBack}
          className="flex items-center text-purple-400 hover:text-purple-300 transition group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>
        
      </div>

      {/* Current field selection header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{selectedField}</h2>
        <p className="text-gray-400 text-sm">
          Select a specialization to continue your interview preparation journey
        </p>
      </div>

      {/* Subfield selection grid */}
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields[selectedField as keyof typeof fields].subFields.map((subField) => (
            <motion.button
              key={subField}
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedSubField(subField)}
              className={`p-4 rounded-xl transition-all duration-200 text-left relative overflow-hidden group ${
                selectedSubField === subField
                  ? 'bg-gradient-to-br from-purple-600/30 to-indigo-600/30 border-2 border-purple-500 text-white'
                  : 'bg-gray-800/50 border border-gray-700 hover:border-purple-400 text-gray-300 hover:text-white'
              }`}
            >
              <div className="flex flex-col">
                <span className="font-medium">{subField}</span>
              </div>
              {selectedSubField === subField && (
                <div className="absolute right-3 bottom-3">
                  <div className="h-6 w-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </motion.button>
          ))}
        </div>
        
        {/* Question count selection */}
        {selectedSubField && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/30 p-6 rounded-xl border border-gray-700"
          >
            <label className="text-gray-300 font-medium mb-4 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-purple-400" />
              How many questions do you want to practice?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {questionCounts.map((count) => (
                <button
                  key={count}
                  onClick={() => handleQuestionCountChange(count)}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    questionCount === count
                      ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border-2 border-purple-500 text-white font-medium'
                      : 'bg-gray-800/50 border border-gray-700 hover:border-purple-400 text-gray-300 hover:text-white'
                  }`}
                >
                  {count} Questions
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3 flex items-center">
              <Info className="w-3 h-3 mr-1 text-gray-500" />
              Choose based on the time you have available
            </p>
          </motion.div>
        )}

        {/* Job details inputs */}
        {selectedSubField && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/30 p-6 rounded-xl border border-gray-700 space-y-6"
          >
            <div className="flex items-center space-x-2 mb-2">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <h3 className="text-gray-300 font-medium">Customize Your Questions</h3>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Job Title (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Senior Frontend Developer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full bg-gray-900/50 text-gray-200 rounded-lg p-3
                       border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1 flex items-start">
                <Sparkles className="w-3 h-3 mr-1 mt-0.5 text-purple-500" />
                Adding a specific job title helps generate more relevant questions
              </p>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Job Description (Optional)</label>
              <textarea
                placeholder="Paste job description here for more tailored questions..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full h-32 bg-gray-900/50 text-gray-200 rounded-lg p-3 
                       border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1 flex items-start">
                <Sparkles className="w-3 h-3 mr-1 mt-0.5 text-purple-500" />
                Pasting the job description allows for highly customized interview questions
              </p>
            </div>
          </motion.div>
        )}

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </motion.div>
        )}

        {/* Start button */}
        {selectedSubField && (
          <motion.button
            onClick={handleStart}
            disabled={isLoading}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 
                     hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl 
                     p-4 flex items-center justify-center space-x-2 transition-all 
                     disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-lg shadow-purple-600/20
                     transform hover:translate-y-[-2px] active:translate-y-[0px]"
          >
            {isLoading ? (
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Generating {questionCount} Questions...</span>
              </div>
            ) : (
              <>
                <span className="font-medium">Start Practice</span>
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
};