"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { 
  CreditCard, 
  Gift, 
  Zap, 
  Check, 
  RefreshCw,
  Star
} from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";

export default function BillingPage() {
  const { user, isLoaded } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [isPro, setIsPro] = useState(false);
  
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await fetch('/api/user/credits');
        const data = await response.json();
        
        if (response.ok) {
          setCredits(data.credits);
        }
      } catch (error) {
        console.error('Error fetching credits:', error);
      }
    };

    fetchCredits();
  }, []);
  
  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  const handlePurchase = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Successfully subscribed to Pro plan!");
      setIsPro(true);
        // Simulate updating credits
      setCredits(prev => (prev || 0) + 100);
    } catch (error) {
      toast.error("Transaction failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b bg-gray-900/90">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-2xl font-bold text-white mb-6 flex items-center">
            <CreditCard className="w-6 h-6 mr-2 text-purple-400" />
            Billing & Subscription
          </h1>
          
          {/* Current Credits Card */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Gift className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                  <h3 className="text-xl font-bold text-white">Available Credits</h3>
                  <p className="text-gray-400">For generating flashcards</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-purple-400">{credits === null ? "..." : credits}</div>
            </div>
            
            <div className="bg-gray-900/40 rounded-lg p-4 border border-gray-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="text-white font-medium mb-1">Subscription Status</p>
                      <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${isPro ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  <span className="text-gray-400">{isPro ? 'Pro Plan - Active' : 'Free Plan'}</span>
                </div>
              </div>
              {isPro && (
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 bg-purple-500/20 rounded-full text-purple-300 text-sm">
                    Next Billing: June 15, 2023
                  </div>
                  <div className="px-3 py-1.5 bg-purple-500/20 rounded-full text-purple-300 text-sm">
                    €10.00/month
                  </div>
                      </div>
              )}
            </div>
          </motion.div>
          
          {/* Subscription Plan */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.1 } }}
            className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 mb-8 overflow-hidden"
          >
            <div className="border-b border-gray-700/50 p-6">
              <h3 className="text-xl font-bold text-white">Pro Plan</h3>
              <p className="text-gray-400">Upgrade to access premium features</p>
            </div>
            
            <div className="p-6">
              <div className="flex items-baseline mb-4">
                <span className="text-3xl font-bold text-white">€10</span>
                <span className="text-gray-400 ml-1">/month</span>
                      </div>
              
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-purple-400" />
                  <span className="text-purple-300 font-medium">Pro Plan Benefits</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Upgrade now and get 100 credits every month for just €10. Perfect for creating flashcards and boosting your learning experience.
                </p>
                  </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-gray-300">100 credits monthly</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-gray-300">Priority support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-gray-300">Advanced flashcard templates</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-gray-300">Performance analytics</span>
                </li>
              </ul>
              
              <button 
                onClick={handlePurchase}
                disabled={isProcessing || isPro}
                className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors
                          ${isPro 
                            ? 'bg-green-500/20 text-green-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'}`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Processing...</span>
                  </>
                ) : isPro ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Currently Subscribed</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Upgrade to Pro</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
          
          {/* Payment Info */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.2 } }}
            className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <h3 className="text-xl font-bold text-white mb-4">Payment Information</h3>
            
            <div className="bg-gray-900/40 rounded-lg p-4 border border-gray-700/50">
              <p className="text-gray-300 mb-2">
                Secure payment processing is handled by Stripe. Your payment information is encrypted and secure.
              </p>
              <p className="text-gray-400 text-sm">
                By subscribing, you agree to our Terms of Service and automatically renew your subscription monthly until canceled.
              </p>
                </div>
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
} 