import Link from 'next/link';
import { Github, Twitter, Heart, Linkedin } from 'lucide-react';
import { Logo } from './Logo';

export const Footer = () => (
  <footer className="w-full bg-gray-900/90 backdrop-blur-sm border-t border-gray-800 mt-5">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Logo />
          <p className="text-gray-400 text-sm">
            Master your interview preparation with AI-powered flashcards tailored to your field.
          </p>
        </div>
        
        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/practice" className="text-gray-400 hover:text-purple-400 transition">
                Practice Now
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="text-gray-400 hover:text-purple-400 transition">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-gray-400 hover:text-purple-400 transition">
                About Us
              </Link>
            </li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-white font-semibold mb-4">Categories</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/?field=Software Development" className="text-gray-400 hover:text-purple-400 transition">
                Software Development
              </Link>
            </li>
            <li>
              <Link href="/?field=Data Science" className="text-gray-400 hover:text-purple-400 transition">
                Data Science
              </Link>
            </li>
            <li>
              <Link href="/?field=Healthcare" className="text-gray-400 hover:text-purple-400 transition">
                Healthcare
              </Link>
            </li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-white font-semibold mb-4">Connect</h3>
          <div className="flex space-x-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" 
               className="text-gray-400 hover:text-purple-400 transition">
              <Github className="w-6 h-6" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
               className="text-gray-400 hover:text-purple-400 transition">
              <Twitter className="w-6 h-6" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
               className="text-gray-400 hover:text-purple-400 transition">
              <Linkedin className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
      
      <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} PrepFlashcard. All rights reserved.
        </p>
        <div className="flex items-center gap-2 text-gray-400 text-sm mt-4 md:mt-0">
          Made with <Heart className="w-4 h-4 text-red-400" /> by PrepFlashcard Team
        </div>
      </div>
    </div>
  </footer>
);