import { Diamond } from 'lucide-react';

export const Logo = () => (
  <div className="flex items-center gap-3">
    <div className="relative">
      <Diamond className="w-7 h-7 text-purple-100" />
      <Diamond className="w-7 h-7 absolute top-0 left-0 text-indigo-400 opacity-50 animate-pulse" />
    </div>
    <span className="text-2xl font-bold bg-gradient-to-r from-purple-100 to-indigo-400 text-transparent bg-clip-text">
      PrepFlashcard
    </span>
  </div>
);