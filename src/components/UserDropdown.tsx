"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { 
  UserCog, 
  Wallet, 
  LogOut, 
  ChevronDown, 
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

export function UserDropdown() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Handle clicks outside of dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Fetch user credits
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

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
      toast.success("Successfully signed out");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg bg-gray-800/60 p-1.5 pr-4 text-sm hover:bg-gray-700/80 focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <img 
          src={user.imageUrl} 
          alt={user.fullName || "User"} 
          className="h-8 w-8 rounded-full border border-purple-500/50"
        />
        <span className="hidden text-sm font-medium text-gray-200 md:block max-w-[100px] truncate">
          {user.fullName}
        </span>
        <ChevronDown 
          size={14} 
          className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg bg-gray-900 shadow-lg border border-gray-800 z-50 animate-in fade-in slide-in-from-top-5">
          <div className="p-3 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <img 
                src={user.imageUrl} 
                alt={user.fullName || "User avatar"} 
                className="h-10 w-10 rounded-full border border-purple-500/50" 
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white">{user.fullName}</p>
                <p className="text-xs text-gray-400 truncate">{user.primaryEmailAddress?.emailAddress}</p>
                <div className="mt-1 text-xs text-purple-400">
                  Credits: {credits === null ? "..." : credits}
                </div>
              </div>
            </div>
          </div>
          
          <div className="py-1">
            <Link 
              href="/account" 
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <UserCog size={16} className="text-purple-400" />
              <span>Account Settings</span>
            </Link>
            
            <Link 
              href="/billing" 
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Wallet size={16} className="text-blue-400" />
              <span>Billing & Credits</span>
            </Link>
            
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Sparkles size={16} className="text-green-400" />
              <span>Dashboard</span>
            </Link>
          </div>
          
          <div className="border-t border-gray-800 py-1">
            <button 
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 