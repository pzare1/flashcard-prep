"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useInView, animate } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { 
  ChevronRight, 
  ChevronLeft, 
  Star, 
  Users, 
  Award, 
  Bookmark, 
  AlertCircle,
  BrainCircuit,
  Database,
  Target,
  Zap
} from "lucide-react";

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

// Helper component for animated numbers
function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView && ref.current) {
      const controls = animate(0, value, {
        duration: 2,
        ease: "easeOut",
        onUpdate(latest) {
          setDisplayValue(Math.floor(latest));
        }
      });
      return () => controls.stop();
    }
  }, [isInView, value]);

  return <span ref={ref}>{displayValue.toLocaleString()}</span>;
}

export default function Home() {
  const { isSignedIn } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedField, setSelectedField] = useState("");
  const [selectedSubField, setSelectedSubField] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [groupName, setGroupName] = useState("");
  const router = useRouter();
  const selectionAreaRef = useRef<HTMLDivElement>(null);

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
          groupName: groupName.trim() || `${selectedField} - ${selectedSubField} Questions`,
          linkedinUrl: linkedinUrl.trim()
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
  }, [selectedField, selectedSubField, questionCount, jobTitle, jobDescription, linkedinUrl, groupName, isSignedIn, router, validateSelections]);

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

  const scrollToSelection = useCallback(() => {
    selectionAreaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const nextTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  }, []);

  // Automatically advance testimonials
  useEffect(() => {
    const timer = setInterval(nextTestimonial, 10000);
    return () => clearInterval(timer);
  }, [nextTestimonial]);

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center pt-28 pb-20 md:pt-36 md:pb-24">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-2xl md:text-5xl font-bold mb-6"
            >
              Ace Your Interviews with <span className="text-purple-400">AI-Powered Practice</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-md text-gray-300 opacity-80 max-w-3xl mx-auto mb-10"
            >
              Generate hyper-realistic interview questions tailored to your specific field, specialization, and target job description.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12"
            >
              <button 
                onClick={scrollToSelection}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/30"
              >
                Start Practicing Now
              </button>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <div className="flex items-center bg-purple-900/30 px-4 py-2 rounded-lg border border-purple-700/50 backdrop-blur-sm">
                <Zap size={16} className="text-purple-400 mr-2" /> 
                <span className="text-purple-400 font-medium">Instant AI Generation</span>
              </div>
              <div className="flex items-center bg-blue-900/30 px-4 py-2 rounded-lg border border-blue-700/50 backdrop-blur-sm">
                <Database size={16} className="text-blue-400 mr-2" />
                <span className="text-blue-400 font-medium">140+ Specializations</span>
              </div>
              <div className="flex items-center bg-green-900/30 px-4 py-2 rounded-lg border border-green-700/50 backdrop-blur-sm">
                <Target size={16} className="text-green-400 mr-2" />
                <span className="text-green-400 font-medium">Job-Specific Questions</span>
              </div>
            </motion.div>
          </div>

          {/* Main Selection Area */}
          <div ref={selectionAreaRef} id="selection-area" className="py-16">
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
                  className="max-w-4xl mx-auto bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-gray-700 shadow-xl"
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
                    linkedinUrl={linkedinUrl}
                    setLinkedinUrl={setLinkedinUrl}
                    error={error}
                    isLoading={isLoading}
                    handleBack={handleBack}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Interactive Stats Section */}
          <div className="max-w-5xl mx-auto py-20 md:py-28 text-center">
             <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">
              Preparation at Scale
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
                className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
              >
                <Database className="w-10 h-10 text-blue-400 mx-auto mb-4" />
                <div className="text-4xl font-bold text-blue-400 mb-2">
                   <AnimatedNumber value={12} />+
                </div>
                <p className="text-gray-400">Professional Fields Covered</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
              >
                <BrainCircuit className="w-10 h-10 text-purple-400 mx-auto mb-4" />
                 <div className="text-4xl font-bold text-purple-400 mb-2">
                  <AnimatedNumber value={10000} />+
                </div>
                <p className="text-gray-400">Unique Questions Generated Daily</p>
              </motion.div>
               <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
              >
                <Star className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
                 <div className="text-4xl font-bold text-yellow-400 mb-2">
                   <AnimatedNumber value={4.8} />/5
                 </div>
                 <p className="text-gray-400">Average User Satisfaction</p>
              </motion.div>
            </div>
          </div>

          {/* Testimonials Carousel */}
          <div className="max-w-4xl mx-auto py-16 md:py-24">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
              Success Stories from Our Users
            </h2>
            
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative bg-gray-800/50 rounded-xl p-8 border border-gray-700 shadow-lg"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                >
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
                  
                  <p className="text-gray-300 italic mb-6 text-lg leading-relaxed">"{testimonials[currentTestimonial].text}"</p>
                </motion.div>
              </AnimatePresence>
              
              <div className="flex justify-between items-center mt-6">
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
                    onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                    className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft size={18} className="text-white" />
                  </button>
                  <button 
                    onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                    className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight size={18} className="text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Features Section */}
          <div className="max-w-6xl mx-auto py-20 md:py-28">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
              Why PrepFlashcard Stands Out
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
                className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-5">
                  <Award className="text-indigo-400 w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Realistic Scenarios</h3>
                <p className="text-gray-400 text-sm">
                  AI generates questions mirroring real-world interview challenges for all experience levels.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-5">
                  <Users className="text-emerald-400 w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Deep Specialization</h3>
                <p className="text-gray-400 text-sm">
                  Focus on hyper-specific knowledge areas relevant to your exact career path and sub-field.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 bg-rose-500/20 rounded-lg flex items-center justify-center mb-5">
                  <Bookmark className="text-rose-400 w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Job-Targeted Prep</h3>
                <p className="text-gray-400 text-sm">
                  Analyze target job descriptions for questions precisely aligned with role requirements.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 bg-purple-500/20 rounded-lg flex items-center justify-center mb-5">
                  <BrainCircuit className="text-purple-400 w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Intelligent AI</h3>
                <p className="text-gray-400 text-sm">
                  Leverages advanced AI models to understand context and generate insightful questions.
                </p>
              </motion.div>
            </div>
          </div>
          
          {/* How It Works Section */}
          <div className="max-w-5xl mx-auto py-20 md:py-28">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
              Simple Steps to Interview Success
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
          <div className="max-w-4xl mx-auto text-center py-20 md:py-28 mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-white mb-6"
            >
              Ready to Ace Your Next Interview?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
            >
              Start preparing now with questions tailored specifically to your field and career goals.
            </motion.p>
            <motion.button 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 100 }}
              onClick={scrollToSelection}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/30"
            >
              Get Started Now
            </motion.button>
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