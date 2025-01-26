"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Code, Stethoscope, Wrench, ChartBarBig, Building, Weight, Book, ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";

const fields = {
  "Software Development": {
    icon: Code,
    color: "from-blue-400 to-indigo-600",
    subFields: [
      "Frontend Development",
      "Backend Development",
      "Mobile Development",
      "DevOps",
      "Cloud Computing",
      "System Design",
    ]
  },
  "Data Science": {
    icon: ChartBarBig,
    color: "from-purple-400 to-pink-600",
    subFields: [
      "Machine Learning",
      "Data Analysis",
      "Big Data",
      "AI Engineering",
      "Computer Vision",
      "NLP"
    ]
  },
  "Healthcare": {
    icon: Stethoscope,
    color: "from-red-400 to-rose-600",
    subFields: [
      "Nursing",
      "Pharmacy",
      "Physical Therapy",
      "Medical Technology",
      "Healthcare Administration",
      "Public Health"
    ]
  },
  "Engineering": {
    icon: Wrench,
    color: "from-orange-400 to-amber-600",
    subFields: [
      "Mechanical Engineering",
      "Electrical Engineering",
      "Civil Engineering",
      "Chemical Engineering",
      "Aerospace Engineering",
      "Industrial Engineering"
    ]
  },
  "Business": {
    icon: Building,
    color: "from-emerald-400 to-teal-600",
    subFields: [
      "Marketing",
      "Finance",
      "Management",
      "Human Resources",
      "Operations",
      "Entrepreneurship"
    ]
  },
  "Legal": {
    icon: Weight,
    color: "from-cyan-400 to-sky-600",
    subFields: [
      "Corporate Law",
      "Criminal Law",
      "Civil Law",
      "International Law",
      "Patent Law",
      "Environmental Law"
    ]
  },
  "Education": {
    icon: Book,
    color: "from-violet-400 to-purple-600",
    subFields: [
      "K-12 Education",
      "Higher Education",
      "Special Education",
      "Educational Technology",
      "Curriculum Development",
      "Education Administration"
    ]
  }
};

const questionCounts = [5, 10, 20, 40];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

export default function Home() {
  const [selectedField, setSelectedField] = useState("");
  const [selectedSubField, setSelectedSubField] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
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
            count: questionCount
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
    <>
    <div className="min-h-screen pt-20 bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] bg-gray-900/90">
      <motion.div className="container mx-auto px-4" initial={false}>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 pt-12"
        >
          <div className="relative inline-block">
            <motion.div
              transition={{ 
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-100 to-indigo-400 text-transparent bg-clip-text mb-6"
            >
              PrepFlashcard
            </motion.div>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-300 text-xl md:text-2xl max-w-2xl mx-auto"
          >
            Master your next interview with AI-powered questions
          </motion.p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!selectedField ? (
            <motion.div
              key="field-selection"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
            >
              {Object.entries(fields).map(([field, { icon: Icon, color }]) => (
                <motion.button
                  key={field}
                  variants={cardVariants}
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedField(field)}
                  className={`relative group p-8 rounded-2xl bg-gray-800/30 backdrop-blur-lg 
                            border border-gray-700 hover:border-gray-500 transition-all duration-300
                            overflow-hidden`}
                >
                  <div className="relative z-10">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${color} 
                                  p-3 mb-6 shadow-lg transform group-hover:scale-110 transition-transform`}>
                      <Icon className="w-full h-full text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{field}</h3>
                    <p className="text-gray-400 text-sm">
                      {fields[field as keyof typeof fields].subFields.length} specializations
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-transparent 
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="selection-panel"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-w-4xl mx-auto bg-gray-800/30 backdrop-blur-lg rounded-2xl p-8 border border-gray-700"
            >
              <div className="flex items-center space-x-4 mb-8">
                <button 
                  onClick={() => {
                    setSelectedField("");
                    setSelectedSubField("");
                  }}
                  className="flex items-center text-purple-400 hover:text-purple-300 transition"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </button>
                <h2 className="text-2xl font-semibold text-white">{selectedField}</h2>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fields[selectedField as keyof typeof fields].subFields.map((subField) => (
                    <motion.button
                      key={subField}
                      variants={cardVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedSubField(subField)}
                      className={`p-4 rounded-xl transition-all duration-300 text-left ${
                        selectedSubField === subField
                          ? 'bg-purple-500/20 border-2 border-purple-500 text-white'
                          : 'border border-gray-700 hover:border-purple-400 text-gray-400 hover:text-white'
                      }`}
                    >
                      {subField}
                    </motion.button>
                  ))}
                </div>

                {selectedSubField && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <label className="block text-gray-300">Number of Questions</label>
                    <div className="grid grid-cols-4 gap-4">
                      {questionCounts.map((count) => (
                        <button
                          key={count}
                          onClick={() => setQuestionCount(count)}
                          className={`p-4 rounded-xl transition-all duration-300 ${
                            questionCount === count
                              ? 'bg-purple-500/20 border-2 border-purple-500 text-white'
                              : 'border border-gray-700 hover:border-purple-400 text-gray-400 hover:text-white'
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {selectedSubField && (
                  <motion.button
                    onClick={handleStart}
                    disabled={isLoading}
                    className="w-full bg-purple-500/20 border-2 border-purple-500 text-white rounded-xl 
                             p-4 flex items-center justify-center space-x-2 transition-all 
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transform hover:translate-y-[-2px] active:translate-y-[0px]"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Generating {questionCount} Questions...</span>
                      </div>
                    ) : (
                      <>
                        <span>Start Practice</span>
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
    <Footer />
    </>
  );
}