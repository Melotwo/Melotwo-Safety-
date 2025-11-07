
import React from 'react';
import { ShieldCheck, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-2">
              <ShieldCheck className="h-8 w-8 text-amber-500" />
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">Melotwo</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-4">
            <a href="#products" className="text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Products</a>
            <a href="#about" className="text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">About Us</a>
            <a href="#contact" className="text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Contact</a>
            <div className="flex items-center space-x-2">
              <a href="#" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-amber-500 border border-transparent rounded-md shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
                Request a Quote
              </a>
              <button
                onClick={toggleDarkMode}
                className="flex items-center justify-center w-10 h-10 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
