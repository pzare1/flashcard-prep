"use client";

import { SignIn } from "@clerk/nextjs";
import { useEffect } from "react";

export function AuthModal() {
  useEffect(() => {
    // Store the current URL if not already stored
    if (!sessionStorage.getItem("redirectPath")) {
      sessionStorage.setItem("redirectPath", window.location.pathname + window.location.search);
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-2xl">
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-transparent shadow-none",
              headerTitle: "text-gray-200",
              headerSubtitle: "text-gray-400",
              socialButtonsBlockButton: "bg-gray-700 border border-gray-600 hover:bg-gray-600",
              socialButtonsBlockButtonText: "text-gray-200",
              formButtonPrimary: "bg-purple-600 hover:bg-purple-700",
              formFieldInput: "bg-gray-700 border-gray-600 text-gray-200",
              formFieldLabel: "text-gray-300",
              footerActionLink: "text-purple-400 hover:text-purple-300"
            }
          }}
        />
      </div>
    </div>
  );
}