"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, Code, Stethoscope, Wrench, ChartBarBig, Building, Weight, Book, ArrowLeft } from "lucide-react";

const fields = {
  "Software Development": {
    icon: Code,
    subFields: ["Frontend Development", "Backend Development", "Mobile Development", "DevOps", "Cloud Computing", "System Design"]
  },
  "Data Science": {
    icon: ChartBarBig,
    subFields: ["Machine Learning", "Data Analysis", "Big Data", "AI Engineering", "Computer Vision", "NLP"]
  },
  "Healthcare": {
    icon: Stethoscope,
    subFields: ["Nursing", "Pharmacy", "Physical Therapy", "Medical Technology", "Healthcare Administration", "Public Health"]
  },
  "Engineering": {
    icon: Wrench,
    subFields: ["Mechanical Engineering", "Electrical Engineering", "Civil Engineering", "Chemical Engineering", "Aerospace Engineering", "Industrial Engineering"]
  },
  "Business": {
    icon: Building,
    subFields: ["Marketing", "Finance", "Management", "Human Resources", "Operations", "Entrepreneurship"]
  },
  "Legal": {
    icon: Weight,
    subFields: ["Corporate Law", "Criminal Law", "Civil Law", "International Law", "Patent Law", "Environmental Law"]
  },
  "Education": {
    icon: Book,
    subFields: ["K-12 Education", "Higher Education", "Special Education", "Educational Technology", "Curriculum Development", "Education Administration"]
  }
};

export default function Home() {
  const [selectedField, setSelectedField] = useState("");
  const [selectedSubField, setSelectedSubField] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStart = async () => {
    if (selectedField && selectedSubField) {
      setIsLoading(true);
      try {
        const response = await fetch("/api/generate-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            field: selectedField,
            subField: selectedSubField,
          }),
        });

        if (!response.ok) throw new Error("Failed to generate questions");

        const questions = await response.json();
        sessionStorage.setItem("questionSet", JSON.stringify(questions.map((q: any) => q._id)));
        router.push(`/practice?field=${selectedField}&subfield=${selectedSubField}`);
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to generate questions. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-4">
        <div className="mb-16 pt-12 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block"
          >
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text mb-4">
              PrepFlashcard
            </h1>
            <p className="text-gray-300 text-lg md:text-xl">
              Master your next interview with AI-powered preparation
            </p>
          </motion.div>
        </div>

        {!selectedField ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {Object.entries(fields).map(([field, { icon: Icon }]) => (
              <motion.button
                key={field}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedField(field)}
                className="group relative bg-gray-800/50 backdrop-blur-sm border border-purple-900/20 
                         rounded-xl transition-all duration-300 hover:border-purple-500/50
                         hover:bg-gray-800/80"
              >
                <div className="p-6 space-y-4">
                  <div className="w-14 h-14 bg-purple-500/10 rounded-xl p-3 mb-4 mx-auto
                               group-hover:bg-purple-500/20 transition-colors">
                    <Icon className="w-full h-full text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white text-center">{field}</h3>
                  <p className="text-gray-400 text-sm text-center">
                    {fields[field as keyof typeof fields].subFields.length} specializations
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-purple-900/20">
            <div className="flex items-center space-x-4 mb-8">
              <button 
                onClick={() => {
                  setSelectedField("");
                  setSelectedSubField("");
                }}
                className="flex items-center text-purple-400 hover:text-purple-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
              <h2 className="text-2xl font-semibold text-white">{selectedField}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields[selectedField as keyof typeof fields].subFields.map((subField) => (
                <button
                  key={subField}
                  onClick={() => setSelectedSubField(subField)}
                  className={`p-4 rounded-lg text-left transition-all duration-300
                    ${selectedSubField === subField 
                      ? 'bg-purple-500/20 border-2 border-purple-500 text-white' 
                      : 'bg-gray-800/30 border border-purple-900/20 hover:border-purple-500/50 text-white'}`}
                >
                  {subField}
                </button>
              ))}
            </div>

            {selectedSubField && (
              <div className="mt-8">
                <button
                  onClick={handleStart}
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-4 
                           flex items-center justify-center space-x-2 transition-colors
                           disabled:bg-purple-600/50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Preparing Questions...</span>
                    </div>
                  ) : (
                    <>
                      <span>Start Practice</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}