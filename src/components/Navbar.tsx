"use client";

import Link from "next/link";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { Brain } from "lucide-react";
import { Logo } from "./Logo";
import { UserDropdown } from "./UserDropdown";

const Navbar = () => {
  const { isSignedIn } = useAuth();

  return (
    <nav className="fixed top-0 w-full z-50 bg-gray-900/0 backdrop-blur-xl border-b border-purple-900/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition"
          >
            <Logo />
          </Link>
          <div className="flex items-center space-x-6">
            {isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-300 hover:text-purple-400 transition"
                >
                  Dashboard
                </Link>
                <UserDropdown />
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="bg-purple-500/20 border-2 border-purple-500 text-white px-4 py-2 rounded-lg transition-colors">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
