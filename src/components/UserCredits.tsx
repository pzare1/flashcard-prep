"use client";

import { useEffect, useState } from 'react';
import { useAuth } from "@clerk/nextjs";
import { Coins } from 'lucide-react';

interface UserCreditsProps {
  className?: string;
}

export function UserCredits({ className = "" }: UserCreditsProps) {
  const { userId } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [totalGenerated, setTotalGenerated] = useState<number | null>(null);

  useEffect(() => {
    const fetchCredits = async () => {
      if (!userId) return;
      
      try {
        const response = await fetch('/api/user/credits');
        const data = await response.json();
        
        if (response.ok) {
          setCredits(data.credits);
          setTotalGenerated(data.totalQuestionsGenerated);
        }
      } catch (error) {
        console.error('Error fetching credits:', error);
      }
    };

    fetchCredits();
  }, [userId]);

  if (credits === null) return null;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Coins className="h-5 w-5 text-yellow-400" />
      <div className="text-sm">
        <span className="font-medium text-yellow-400">{credits}</span>
        <span className="text-gray-400"> credits</span>
      </div>
    </div>
  );
} 