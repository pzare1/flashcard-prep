"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { ChevronRight, ChevronLeft, Star, Users, Award, Bookmark, AlertCircle } from "lucide-react";

import { AuthModal } from "@/components/auth/auth-modal";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { FieldSelection } from "@/components/FieldSelection";
import { SelectionPanel } from "@/components/SelectionPanel";
import { containerVariants } from "@/lib/animation-variants";

interface Question {
  _id: string;
  field: string;
  subField: string;
  question: string;
  answer: string;
}

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Full Stack Developer",
    company: "TechSolutions Inc.",
    text: "I was struggling with system design interviews until I found this platform. The AI-generated questions were incredibly relevant and helped me land my dream job!",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Data Scientist",
    company: "Analytics Co.",
    text: "The variety and depth of machine learning questions were impressive. I felt much more confident in my job interviews after practicing here.",
    rating: 5
  },
  {
    name: "Emily Rodriguez",
    role: "Project Manager",
    company: "Global Enterprises",
    text: "As someone transitioning into project management, I needed specific practice. This tool provided exactly what I needed - realistic questions tailored to my new field.",
    rating: 4
  },
  {
    name: "David Kim",
    role: "UX Designer",
    company: "Creative Design Studio",
    text: "The UI/UX design questions were spot-on. They covered everything from user research to prototyping, which perfectly prepared me for my interviews.",
    rating: 5
  }
];

export default function Home() {
  const { isSignedIn } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedField, setSelectedField] = useState("");
  const [selectedSubField, setSelectedSubField] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [groupName, setGroupName] = useState("");
  const router = useRouter();

  const handleQuestionCountChange = useCallback((count: number) => {
    setQuestionCount(count);
    setError(null);
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
    return true;
  }, [selectedField, selectedSubField]);

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
          jobDescription: jobDescription.trim(),
          groupName: groupName.trim() || `${selectedField} - ${selectedSubField} Questions`
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        if (response.status === 401) {
          setShowAuthModal(true);
          return;
        }
  
        throw new Error(data.error || `Server error: ${response.status}`);
      }
  
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error("Invalid response format");
      }
  
      sessionStorage.setItem("questionSet", JSON.stringify(data.questions.map((q: Question) => q._id)));
      sessionStorage.setItem("expectedQuestionCount", questionCount.toString());
      
      router.push(`/practice?field=${encodeURIComponent(selectedField)}&subfield=${encodeURIComponent(selectedSubField)}&count=${questionCount}`);
    } catch (error) {
      console.error("Error generating questions:", error);
      setError(error instanceof Error ? error.message : "Failed to generate questions");
    } finally {
      setIsLoading(false);
    }
  }, [selectedField, selectedSubField, questionCount, jobTitle, jobDescription, groupName, isSignedIn, router, validateSelections]);

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

  const nextTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prevTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  // Automatically advance testimonials
  useEffect(() => {
    const timer = setInterval(nextTestimonial, 10000);
    return () => clearInterval(timer);
  }, [nextTestimonial]);

  return (
    <>
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center pt-24 pb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 mt-10">
              Interview Preparation Platform
            </h1>
            <p className="text-lg text-gray-300 opacity-60 max-w-2xl mx-auto mb-8">
              Master your next interview with AI-powered practice questions tailored to your field, specialization, and specific job requirements.
            </p>
            <div className="flex justify-center gap-4 mb-8">
              <div className="flex items-center bg-purple-900/30 px-4 py-2 rounded-lg border border-purple-700/50">
                <span className="text-purple-400 font-medium">12+ Professional Fields</span>
              </div>
              <div className="flex items-center bg-blue-900/30 px-4 py-2 rounded-lg border border-blue-700/50">
                <span className="text-blue-400 font-medium">140+ Specializations</span>
              </div>
              <div className="flex items-center bg-green-900/30 px-4 py-2 rounded-lg border border-green-700/50">
                <span className="text-green-400 font-medium">Personalized Questions</span>
              </div>
            </div>
          </div>

          {/* Main Selection Area */}
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
                <FieldSelection onFieldSelect={handleFieldSelect} />
              </motion.div>
            ) : (
              <motion.div
                key="selection-panel"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="max-w-4xl mx-auto bg-gray-800/70 backdrop-blur-lg rounded-2xl p-8 border border-gray-700"
              >
                <SelectionPanel 
                  selectedField={selectedField}
                  selectedSubField={selectedSubField}
                  setSelectedSubField={setSelectedSubField}
                  questionCount={questionCount}
                  handleStart={handleStart}
                  handleQuestionCountChange={handleQuestionCountChange}
                  jobTitle={jobTitle}
                  setJobTitle={setJobTitle}
                  jobDescription={jobDescription}
                  setJobDescription={setJobDescription}
                  groupName={groupName}
                  setGroupName={setGroupName}
                  error={error}
                  isLoading={isLoading}
                  handleBack={handleBack}
                >
                  <div className="mb-4">
                    <label htmlFor="groupName" className="block text-gray-300 mb-2">Group Name (optional)</label>
                    <input
                      id="groupName"
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Enter a name for this group of questions"
                      className="w-full px-4 py-2 rounded-lg bg-gray-800/50 text-white border border-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    />
                  </div>
                </SelectionPanel>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Testimonials Carousel */}
          <div className="max-w-4xl mx-auto mt-24 mb-20">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Success Stories from Our Users
            </h2>
            
            <div className="relative bg-gray-800/50 rounded-xl p-8 border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {testimonials[currentTestimonial].name.charAt(0)}
                </div>
                <div className="ml-4">
                  <h3 className="text-white font-semibold">{testimonials[currentTestimonial].name}</h3>
                  <p className="text-gray-400 text-sm">{testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}</p>
                </div>
                <div className="ml-auto flex">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
              
              <p className="text-gray-300 italic mb-6">"{testimonials[currentTestimonial].text}"</p>
              
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  {testimonials.map((_, index) => (
                    <button 
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-2 h-2 rounded-full ${currentTestimonial === index ? 'bg-purple-500' : 'bg-gray-600'}`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={prevTestimonial}
                    className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft size={18} className="text-white" />
                  </button>
                  <button 
                    onClick={nextTestimonial}
                    className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight size={18} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Features Section */}
          <div className="max-w-6xl mx-auto mt-20 mb-24">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Key Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Award className="text-indigo-400 w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Expert-Level Questions</h3>
                <p className="text-gray-400">
                  Our AI generates questions that match real-world interview scenarios, from entry-level to senior positions, ensuring you're prepared for any challenge.
                </p>
              </div>
              
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="text-emerald-400 w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Specialized Content</h3>
                <p className="text-gray-400">
                  Questions are tailored to your specific field and sub-specialization, focusing on the knowledge areas most relevant to your career path.
                </p>
              </div>
              
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <div className="w-12 h-12 bg-rose-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Bookmark className="text-rose-400 w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Job Description Analysis</h3>
                <p className="text-gray-400">
                  Upload your target job description to receive questions specifically designed to prepare you for that particular role and company.
                </p>
              </div>
            </div>
          </div>
          
          {/* How It Works Section */}
          <div className="max-w-5xl mx-auto mt-20 mb-24">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              How It Works
            </h2>
            
            <div className="relative">
              {/* Process steps */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-700 transform -translate-x-1/2"></div>
              
              <div className="space-y-16">
                <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
                  <div className="md:w-1/2 flex justify-end">
                    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 md:max-w-sm">
                      <h3 className="text-xl font-semibold text-white mb-3">1. Select Your Domain</h3>
                      <p className="text-gray-400">
                        Choose from over 12 professional fields including Software Development, Data Science, Healthcare, Engineering, Business, Legal, and more.
                      </p>
                    </div>
                  </div>
                  <div className="md:hidden w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold z-10">
                    1
                  </div>
                  <div className="hidden md:flex absolute left-1/2 w-8 h-8 bg-purple-600 rounded-full items-center justify-center text-white font-bold transform -translate-x-1/2 z-10">
                    1
                  </div>
                  <div className="md:w-1/2"></div>
                </div>
                
                <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
                  <div className="md:w-1/2"></div>
                  <div className="md:hidden w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold z-10">
                    2
                  </div>
                  <div className="hidden md:flex absolute left-1/2 w-8 h-8 bg-purple-600 rounded-full items-center justify-center text-white font-bold transform -translate-x-1/2 z-10">
                    2
                  </div>
                  <div className="md:w-1/2">
                    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 md:max-w-sm">
                      <h3 className="text-xl font-semibold text-white mb-3">2. Specify Your Focus</h3>
                      <p className="text-gray-400">
                        Narrow down to your specific specialization, such as Frontend Development, Machine Learning, Healthcare Administration, or Financial Analysis.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
                  <div className="md:w-1/2 flex justify-end">
                    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 md:max-w-sm">
                      <h3 className="text-xl font-semibold text-white mb-3">3. Customize Your Questions</h3>
                      <p className="text-gray-400">
                        Input your target job title and paste the job description to receive questions specifically tailored to the role you're applying for.
                      </p>
                    </div>
                  </div>
                  <div className="md:hidden w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold z-10">
                    3
                  </div>
                  <div className="hidden md:flex absolute left-1/2 w-8 h-8 bg-purple-600 rounded-full items-center justify-center text-white font-bold transform -translate-x-1/2 z-10">
                    3
                  </div>
                  <div className="md:w-1/2"></div>
                </div>
                
                <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
                  <div className="md:w-1/2"></div>
                  <div className="md:hidden w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold z-10">
                    4
                  </div>
                  <div className="hidden md:flex absolute left-1/2 w-8 h-8 bg-purple-600 rounded-full items-center justify-center text-white font-bold transform -translate-x-1/2 z-10">
                    4
                  </div>
                  <div className="md:w-1/2">
                    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 md:max-w-sm">
                      <h3 className="text-xl font-semibold text-white mb-3">4. Practice and Master</h3>
                      <p className="text-gray-400">
                        Receive a set of challenging questions crafted for your field and position. Practice answering them to build confidence and improve your interview skills.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="max-w-4xl mx-auto text-center py-16 mb-16">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Start preparing now with questions tailored specifically to your field and career goals.
            </p>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
      <Footer />
      {showAuthModal && <AuthModal />}
      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </p>
        </div>
      )}
    </>
  );
}