import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Brain } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-gray-900/90 backdrop-blur-sm border-b border-purple-900/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link 
            href="/" 
            className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition"
          >
            <Brain className="w-8 h-8" />
            <span className="text-xl font-bold">PrepFlashcard</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link 
              href="/practice" 
              className="text-gray-300 hover:text-purple-400 transition"
            >
              Practice
            </Link>
            <Link 
              href="/progress" 
              className="text-gray-300 hover:text-purple-400 transition"
            >
              Progress
            </Link>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8"
                }
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;