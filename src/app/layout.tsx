import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import { Toaster } from 'sonner';
import { AuthProvider } from "../components/providers/auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PrepFlashcard - Interview Preparation Made Easy",
  description: "Master your interview preparation with interactive flashcards",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} bg-gray-900/90`}>
        <Toaster position="top-center" theme="dark" />
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
              <Navbar />
              <main>{children}</main>
            </div>
        </body>
      </html>
    </AuthProvider>
  );
}