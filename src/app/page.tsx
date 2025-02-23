"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { 
  ChevronRight, 
  Code, 
  Stethoscope, 
  Wrench, 
  ChartBarBig, 
  Building, 
  Weight, 
  Book, 
  ArrowLeft,
  Palette,
  FlaskConical,
  DollarSign,
  TrendingUp,
  Home as HomeIcon 
} from "lucide-react";

import { AuthModal } from "@/components/auth/auth-modal";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";

const fields = {
  "Software Development": {
    icon: Code,
    color: "from-blue-400 to-indigo-600",
    subFields: [
      "Frontend Development",
      "Backend Development",
      "Mobile Development",
      "DevOps Engineering",
      "Cloud Architecture",
      "System Design",
      "Game Development",
      "Embedded Systems",
      "Security Engineering",
      "UI/UX Development",
      "Testing & QA",
      "Database Administration"
    ]
  },
  "Data Science": {
    icon: ChartBarBig,
    color: "from-purple-400 to-pink-600",
    subFields: [
      "Machine Learning",
      "Deep Learning",
      "Data Analysis",
      "Big Data Engineering",
      "AI Engineering",
      "Computer Vision",
      "Natural Language Processing",
      "Data Visualization",
      "Statistical Analysis",
      "Predictive Modeling",
      "Data Mining",
      "Business Intelligence"
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
      "Public Health",
      "Medical Research",
      "Mental Health",
      "Dental Care",
      "Emergency Medicine",
      "Health Informatics",
      "Occupational Therapy"
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
      "Industrial Engineering",
      "Robotics Engineering",
      "Biomedical Engineering",
      "Environmental Engineering",
      "Materials Engineering",
      "Nuclear Engineering",
      "Automotive Engineering"
    ]
  },
  "Business": {
    icon: Building,
    color: "from-emerald-400 to-teal-600",
    subFields: [
      "Marketing Strategy",
      "Financial Analysis",
      "Project Management",
      "Human Resources",
      "Operations Management",
      "Entrepreneurship",
      "Supply Chain Management",
      "Business Development",
      "Product Management",
      "Risk Management",
      "Digital Marketing",
      "Corporate Strategy"
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
      "Environmental Law",
      "Family Law",
      "Real Estate Law",
      "Tax Law",
      "Immigration Law",
      "Employment Law",
      "Intellectual Property"
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
      "Education Administration",
      "Early Childhood Education",
      "STEM Education",
      "Language Teaching",
      "Educational Psychology",
      "Online Learning",
      "Adult Education"
    ]
  },
  "Creative": {
    icon: Palette,
    color: "from-pink-400 to-rose-600",
    subFields: [
      "Graphic Design",
      "UI/UX Design",
      "Motion Graphics",
      "3D Modeling",
      "Animation",
      "Video Production",
      "Content Creation",
      "Art Direction",
      "Brand Design",
      "Web Design",
      "Digital Illustration",
      "Visual Development"
    ]
  },
  "Research & Science": {
    icon: FlaskConical,
    color: "from-indigo-400 to-blue-600",
    subFields: [
      "Physics Research",
      "Chemistry Research",
      "Biology Research",
      "Materials Science",
      "Neuroscience",
      "Environmental Science",
      "Quantum Computing",
      "Space Research",
      "Biotechnology",
      "Genetics",
      "Climate Science",
      "Research Methodology"
    ]
  },
  "Finance": {
    icon: DollarSign,
    color: "from-green-400 to-emerald-600",
    subFields: [
      "Investment Banking",
      "Financial Planning",
      "Corporate Finance",
      "Risk Management",
      "Trading",
      "Asset Management",
      "Insurance",
      "Real Estate Finance",
      "Cryptocurrency",
      "Venture Capital",
      "Private Equity",
      "Financial Analysis"
    ]
  },
  "Marketing": {
    icon: TrendingUp,
    color: "from-red-400 to-orange-600",
    subFields: [
      "Digital Marketing",
      "Content Marketing",
      "Social Media Marketing",
      "SEO/SEM",
      "Brand Management",
      "Marketing Analytics",
      "Public Relations",
      "Email Marketing",
      "Growth Marketing",
      "Product Marketing",
      "Market Research",
      "Influencer Marketing"
    ]
  },
  "Architecture": {
    icon: HomeIcon,
    color: "from-amber-400 to-yellow-600",
    subFields: [
      "Residential Architecture",
      "Commercial Architecture",
      "Landscape Architecture",
      "Urban Planning",
      "Interior Design",
      "Sustainable Design",
      "Architectural Technology",
      "Historic Preservation",
      "Industrial Architecture",
      "Transportation Architecture",
      "Healthcare Architecture",
      "Educational Architecture"
    ]
  }
};

const questionCounts = [5, 10] as const;
type QuestionCount = typeof questionCounts[number];

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
  const { isSignedIn } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedField, setSelectedField] = useState("");
  const [selectedSubField, setSelectedSubField] = useState("");
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleQuestionCountChange = useCallback((count: QuestionCount) => {
    if (questionCounts.includes(count)) {
      setQuestionCount(count);
      setError(null);
    }
  }, []);

  const validateSelections = useCallback(() => {
    if (!selectedField) {
      setError("Please select a field");
      return false;
    }
    if (!selectedSubField) {
      setError("Please select a sub-field");
      return false;
    }
    if (!questionCounts.includes(questionCount)) {
      setError("Please select a valid number of questions");
      return false;
    }
    return true;
  }, [selectedField, selectedSubField, questionCount]);

  const handleStart = useCallback(async () => {
    if (!validateSelections()) return;

    if (!isSignedIn) {
      setShowAuthModal(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          field: selectedField,
          subField: selectedSubField,
          count: questionCount,
          jobTitle: jobTitle.trim(),
          jobDescription: jobDescription.trim()
        }),
      });

      if (response.status === 401) {
        setShowAuthModal(true);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to generate questions (${response.status})`);
      }

      const questions = await response.json();
      
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("Invalid response format");
      }

      sessionStorage.setItem("questionSet", JSON.stringify(questions.map(q => q._id)));
      
      router.push(`/practice?field=${encodeURIComponent(selectedField)}&subfield=${encodeURIComponent(selectedSubField)}`);
    } catch (error) {
      console.error("Error generating questions:", error);
      setError(error instanceof Error ? error.message : "Failed to generate questions");
    } finally {
      setIsLoading(false);
    }
  }, [selectedField, selectedSubField, questionCount, isSignedIn, router, jobTitle, jobDescription]);

  const handleFieldSelect = useCallback((field: string) => {
    setSelectedField(field);
    setSelectedSubField("");
    setError(null);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedField("");
    setSelectedSubField("");
    setError(null);
  }, []);

  return (
    <>
      <div className="min-h-screen pt-20 bg-gray-900/90 bg-fixed">
        <motion.div className="container mx-auto px-4" initial={false}>
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 pt-12"
          >
            <div className="relative inline-block scale-150">
              <Logo />
            </div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-300 text-xl md:text-2xl max-w-2xl mx-auto mt-6"
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
                    onClick={() => handleFieldSelect(field)}
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
                    onClick={handleBack}
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
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {questionCounts.map((count) => (
                          <button
                            key={count}
                            onClick={() => handleQuestionCountChange(count)}
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

                  <div className="w-full space-y-4 mb-6">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Job Title</label>
                      <input
                        type="text"
                        placeholder="Enter job title..."
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="w-full bg-gray-700/50 text-gray-200 rounded-lg p-2 
                                 border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Job Description</label>
                      <textarea
                        placeholder="Paste job description..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="w-full h-32 bg-gray-700/50 text-gray-200 rounded-lg p-2 
                                 border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-400 text-sm mt-2"
                    >
                      {error}
                    </motion.div>
                  )}

                  {selectedSubField && (
                    <motion.button
                      onClick={handleStart}
                      disabled={isLoading || !questionCounts.includes(questionCount)}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 
                               hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl 
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
      <div className="min-h-[200px] bg-gray-900/90" />
      <Footer />
        {showAuthModal && <AuthModal />}
      </>
    );
  }