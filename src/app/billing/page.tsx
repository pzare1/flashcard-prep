"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  Gift, 
  Zap, 
  Check, 
  Star, 
  Calendar, 
  Download,
  Sparkles,
  Badge,
  AlertCircle,
  ChevronRight,
  History
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function BillingPage() {
  const { user, isLoaded } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedPlan, setProcessedPlan] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [activePlan, setActivePlan] = useState("premium");
  
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
  
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-3 border-purple-500 rounded-full animate-spin border-t-transparent mb-4"></div>
          <p className="text-purple-400 text-sm">Loading billing information...</p>
        </div>
      </div>
    );
  }
  
  const handlePurchase = async (planId: string) => {
    setIsProcessing(true);
    setProcessedPlan(planId);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message based on plan type
      if (planId.includes('pack')) {
        toast.success(`Successfully purchased credit pack!`);
        // Simulate updating credits
        setCredits(prev => (prev || 0) + (planId === 'mega-pack' ? 1500 : 500));
      } else {
        toast.success(`Successfully subscribed to ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan!`);
        setActivePlan(planId);
      }
    } catch (error) {
      toast.error("Transaction failed. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessedPlan(null);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Billing & Subscription</h1>
              <p className="text-gray-400">Manage your subscription plan and purchase credits</p>
            </div>
            
            <Link href="/account" className="mt-4 md:mt-0 flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors">
              <span>View account settings</span>
              <ChevronRight size={16} />
            </Link>
          </div>
          
          {/* Current Plan & Credits Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Current Credits */}
            <Card className="bg-gray-900/70 border-gray-800/60 shadow-lg overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-500 to-yellow-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-400">
                      <Gift size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">Available Credits</h3>
                      <p className="text-gray-400 text-sm">For generating flashcards</p>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-yellow-400">{credits === null ? "..." : credits}</div>
                </div>
                
                <div className="mt-6 flex gap-2">
                  <Button 
                    onClick={() => handlePurchase('credit-pack')} 
                    className="bg-gray-800 hover:bg-gray-700 text-white text-sm"
                    size="sm"
                  >
                    <Gift size={14} className="mr-1.5" />
                    Buy Credits
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 text-sm"
                    size="sm"
                  >
                    <History size={14} className="mr-1.5" />
                    Usage History
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Current Plan */}
            <Card className="bg-gray-900/70 border-gray-800/60 shadow-lg overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-purple-500/10 text-purple-400">
                      <Badge size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">Current Plan</h3>
                      <p className="text-gray-400 text-sm">
                        {activePlan === 'premium' ? 'Premium' : activePlan === 'pro' ? 'Pro' : 'Basic'} Subscription
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400 font-medium text-sm">
                    Active
                  </div>
                </div>
                
                <div className="mt-4 p-3 rounded-lg bg-gray-800/60 border border-gray-800/80">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Next billing date</span>
                    <span className="text-sm text-white">June 15, 2023</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Monthly charge</span>
                    <span className="text-sm text-white">${activePlan === 'premium' ? '19.99' : activePlan === 'pro' ? '29.99' : '9.99'}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    className="border-gray-700 text-white hover:bg-gray-800 text-sm"
                    size="sm"
                  >
                    <Download size={14} className="mr-1.5" />
                    Invoices
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="border-red-700/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-sm"
                    size="sm"
                  >
                    Cancel Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Subscription Plans */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Subscription Plans</h2>
              <div className="px-3 py-1.5 bg-gray-800 rounded-full text-xs text-gray-400 flex items-center gap-2">
                <AlertCircle size={12} />
                <span>Billed monthly, cancel anytime</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Basic Plan */}
              <Card className={`bg-gray-900/70 border-gray-800/60 shadow-lg overflow-hidden transition-all duration-300 ${activePlan === 'basic' ? 'ring-2 ring-blue-500/50' : 'hover:translate-y-[-4px]'}`}>
                <div className="h-1.5 bg-gradient-to-r from-blue-600 to-blue-400"></div>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white">Basic</CardTitle>
                    {activePlan === 'basic' && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">Current</span>
                    )}
                  </div>
                  <CardDescription className="text-gray-400">For casual learners</CardDescription>
                  <div className="mt-3 flex items-baseline">
                    <span className="text-3xl font-bold text-white">$9.99</span>
                    <span className="text-gray-400 text-sm ml-1">/month</span>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-3">
                  <ul className="space-y-3">
                    {[
                      'Up to 500 credits per month',
                      'Basic question templates',
                      'Standard support (24h response)',
                      'Store up to 50 decks',
                      'Web access'
                    ].map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check size={16} className="mt-0.5 text-blue-500 shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter className="pt-3">
                  <Button 
                    onClick={() => handlePurchase('basic')} 
                    disabled={isProcessing && processedPlan === 'basic' || activePlan === 'basic'}
                    className={`w-full ${activePlan === 'basic' 
                      ? 'bg-blue-500/20 text-blue-400 cursor-default hover:bg-blue-500/20' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                  >
                    {isProcessing && processedPlan === 'basic' ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-300 rounded-full animate-spin border-t-transparent"></div>
                        <span>Processing...</span>
                      </div>
                    ) : activePlan === 'basic' ? 'Current Plan' : 'Choose Basic'}
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Premium Plan */}
              <Card className={`bg-gray-900/70 border-gray-800/60 shadow-lg overflow-hidden relative transition-all duration-300 ${activePlan === 'premium' ? 'ring-2 ring-purple-500/50' : 'hover:translate-y-[-4px]'}`}>
                <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] px-3 py-1 rounded-bl-lg font-medium">
                  MOST POPULAR
                </div>
                <div className="h-1.5 bg-gradient-to-r from-purple-600 to-purple-400"></div>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white">Premium</CardTitle>
                    {activePlan === 'premium' && (
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">Current</span>
                    )}
                  </div>
                  <CardDescription className="text-gray-400">For serious students</CardDescription>
                  <div className="mt-3 flex items-baseline">
                    <span className="text-3xl font-bold text-white">$19.99</span>
                    <span className="text-gray-400 text-sm ml-1">/month</span>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-3">
                  <ul className="space-y-3">
                    {[
                      'Up to 1,500 credits per month',
                      'All question templates',
                      'Priority support (12h response)',
                      'Advanced performance analytics',
                      'Store unlimited decks',
                      'Web & mobile access'
                    ].map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check size={16} className="mt-0.5 text-purple-500 shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter className="pt-3">
                  <Button 
                    onClick={() => handlePurchase('premium')} 
                    disabled={isProcessing && processedPlan === 'premium' || activePlan === 'premium'}
                    className={`w-full ${activePlan === 'premium' 
                      ? 'bg-purple-500/20 text-purple-400 cursor-default hover:bg-purple-500/20' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
                  >
                    {isProcessing && processedPlan === 'premium' ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-purple-300 rounded-full animate-spin border-t-transparent"></div>
                        <span>Processing...</span>
                      </div>
                    ) : activePlan === 'premium' ? 'Current Plan' : 'Choose Premium'}
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Pro Plan */}
              <Card className={`bg-gray-900/70 border-gray-800/60 shadow-lg overflow-hidden transition-all duration-300 ${activePlan === 'pro' ? 'ring-2 ring-amber-500/50' : 'hover:translate-y-[-4px]'}`}>
                <div className="h-1.5 bg-gradient-to-r from-amber-600 to-amber-400"></div>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white">Pro</CardTitle>
                    {activePlan === 'pro' && (
                      <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium">Current</span>
                    )}
                  </div>
                  <CardDescription className="text-gray-400">For power users</CardDescription>
                  <div className="mt-3 flex items-baseline">
                    <span className="text-3xl font-bold text-white">$29.99</span>
                    <span className="text-gray-400 text-sm ml-1">/month</span>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-3">
                  <ul className="space-y-3">
                    {[
                      'Unlimited credits',
                      'All question templates',
                      'Premium support (4h response)',
                      'Advanced analytics & insights',
                      'Custom integrations',
                      'AI tutor assistance',
                      'Team sharing capabilities'
                    ].map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check size={16} className="mt-0.5 text-amber-500 shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter className="pt-3">
                  <Button 
                    onClick={() => handlePurchase('pro')} 
                    disabled={isProcessing && processedPlan === 'pro' || activePlan === 'pro'}
                    className={`w-full ${activePlan === 'pro' 
                      ? 'bg-amber-500/20 text-amber-400 cursor-default hover:bg-amber-500/20' 
                      : 'bg-amber-600 hover:bg-amber-700 text-white'}`}
                  >
                    {isProcessing && processedPlan === 'pro' ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-amber-300 rounded-full animate-spin border-t-transparent"></div>
                        <span>Processing...</span>
                      </div>
                    ) : activePlan === 'pro' ? 'Current Plan' : 'Choose Pro'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
          
          {/* Credit Packs */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">One-time Credit Packs</h2>
              <div className="px-3 py-1.5 bg-gray-800 rounded-full text-xs text-gray-400 flex items-center gap-2">
                <Star size={12} className="text-yellow-400" />
                <span>Credits never expire</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Small Pack */}
              <Card className="bg-gray-900/70 border-gray-800/60 shadow-lg overflow-hidden hover:translate-y-[-4px] transition-all duration-300">
                <div className="h-1 bg-gradient-to-r from-green-600 to-green-400"></div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Small Pack</CardTitle>
                    <div className="p-2 rounded-full bg-green-500/10">
                      <Zap size={18} className="text-green-400" />
                    </div>
                  </div>
                  <CardDescription className="text-gray-400">Quick boost for your learning</CardDescription>
                </CardHeader>
                
                <CardContent className="pb-4">
                  <div className="flex justify-between items-center p-3 mb-3 rounded-lg bg-gray-800/60 border border-gray-700/50">
                    <span className="text-base font-medium text-gray-300">200 Credits</span>
                    <span className="text-lg font-bold text-white">$7.99</span>
                  </div>
                  <p className="text-xs text-gray-500">Perfect for quickly testing study materials</p>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    onClick={() => handlePurchase('small-pack')} 
                    disabled={isProcessing && processedPlan === 'small-pack'}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isProcessing && processedPlan === 'small-pack' ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                        <span>Processing...</span>
                      </div>
                    ) : 'Purchase Now'}
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Standard Pack */}
              <Card className="bg-gray-900/70 border-gray-800/60 shadow-lg overflow-hidden hover:translate-y-[-4px] transition-all duration-300 relative">
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] px-3 py-1 rounded-bl-lg font-medium">
                  POPULAR
                </div>
                <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-400"></div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Medium Pack</CardTitle>
                    <div className="p-2 rounded-full bg-blue-500/10">
                      <Sparkles size={18} className="text-blue-400" />
                    </div>
                  </div>
                  <CardDescription className="text-gray-400">Best balance of value & cost</CardDescription>
                </CardHeader>
                
                <CardContent className="pb-4">
                  <div className="flex justify-between items-center p-3 mb-3 rounded-lg bg-gray-800/60 border border-gray-700/50">
                    <span className="text-base font-medium text-gray-300">500 Credits</span>
                    <span className="text-lg font-bold text-white">$14.99</span>
                  </div>
                  <p className="text-xs text-gray-500">Save 25% compared to Small Pack</p>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    onClick={() => handlePurchase('credit-pack')} 
                    disabled={isProcessing && processedPlan === 'credit-pack'}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isProcessing && processedPlan === 'credit-pack' ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                        <span>Processing...</span>
                      </div>
                    ) : 'Purchase Now'}
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Mega Pack */}
              <Card className="bg-gray-900/70 border-gray-800/60 shadow-lg overflow-hidden hover:translate-y-[-4px] transition-all duration-300">
                <div className="h-1 bg-gradient-to-r from-pink-600 to-pink-400"></div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Mega Pack</CardTitle>
                    <div className="p-2 rounded-full bg-pink-500/10">
                      <Sparkles size={18} className="text-pink-400" />
                    </div>
                  </div>
                  <CardDescription className="text-gray-400">Best value for serious students</CardDescription>
                </CardHeader>
                
                <CardContent className="pb-4">
                  <div className="flex justify-between items-center p-3 mb-3 rounded-lg bg-gray-800/60 border border-gray-700/50">
                    <span className="text-base font-medium text-gray-300">1500 Credits</span>
                    <span className="text-lg font-bold text-white">$39.99</span>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Badge size={12} className="text-pink-400" />
                    <span>Best value - Save 33% compared to Medium Pack</span>
                  </p>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    onClick={() => handlePurchase('mega-pack')} 
                    disabled={isProcessing && processedPlan === 'mega-pack'}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                  >
                    {isProcessing && processedPlan === 'mega-pack' ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                        <span>Processing...</span>
                      </div>
                    ) : 'Purchase Now'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
          
          {/* Payment Methods */}
          <div className="mt-14">
            <h2 className="text-xl font-semibold text-white mb-6">Payment Methods</h2>
            
            <Card className="bg-gray-900/70 border-gray-800/60 shadow-lg">
              <CardHeader className="border-b border-gray-800/60 bg-gray-800/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Saved Payment Methods</CardTitle>
                  <Button className="text-sm bg-purple-600 hover:bg-purple-700">Add New Method</Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-5">
                {/* Visa Card */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-800/60 bg-gray-800/40 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-md bg-blue-500/10">
                      <CreditCard size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">Visa ending in 4242</p>
                        <span className="px-1.5 py-0.5 text-[10px] bg-green-500/10 text-green-400 rounded">Primary</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Expires 05/2025</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" className="h-8 px-2 text-sm text-gray-400 hover:text-white">Edit</Button>
                    <Button variant="ghost" className="h-8 px-2 text-sm text-red-400 hover:text-red-300">Remove</Button>
                  </div>
                </div>
                
                {/* PayPal */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-800/60 bg-gray-800/40">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-md bg-blue-500/10">
                      <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.291-.077.448-.967 5.118-4.274 6.861-8.478 6.861h-2.6c-.597 0-1.115.398-1.265.996l-1.053 5.627c-.067.358-.37.622-.731.622h-.02l1.129-5.98c.024-.134.14-.234.276-.234h1.534c3.767 0 6.705-1.53 7.565-5.946.033-.17.062-.336.085-.493.68-3.596-.007-5.263-2.65-6.77C11.794 1.543 9.41 1 6.54 1H2.09L.019 19.808a.932.932 0 0 0 .923 1.077h6.134v.452z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-white">PayPal - john.doe@example.com</p>
                      <p className="text-xs text-gray-400 mt-1">Added on 01/15/2023</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" className="h-8 px-2 text-sm text-red-400 hover:text-red-300">Remove</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 