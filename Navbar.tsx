import React from 'react';
import { ShieldCheck, Sun, Moon, Bookmark, Share2 } from 'lucide-react';

const Navbar: React.FC<{
  onThemeToggle: () => void;
  isDarkMode: boolean;
  onOpenSaved: () => void;
  savedCount: number;
  onOpenQrCode: () => void;
}> = ({ onThemeToggle, isDarkMode, onOpenSaved, savedCount, onOpenQrCode }) => (
  <nav role="navigation" aria-label="Main navigation" className="no-print bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center space-x-4">
          <ShieldCheck className="w-8 h-8 text-amber-500" />
          <div>
            <span className="hidden sm:inline text-xl font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">AI Safety Checklist Generator</span>
            <span className="inline sm:hidden text-lg font-bold text-slate-800 dark:text-slate-200">AI Safety Gen</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button onClick={onOpenSaved} className="relative p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500 dark:focus-visible:ring-offset-slate-900" aria-label={`View saved checklists (${savedCount} saved)`}>
            <Bookmark size={20} />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-xs font-medium text-white" aria-hidden="true">{savedCount}</span>
            )}
          </button>
          <button onClick={onOpenQrCode} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500 dark:focus-visible:ring-offset-slate-900" aria-label="Share application">
            <Share2 size={20} />
          </button>
          <button onClick={onThemeToggle} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500 dark:focus-visible:ring-offset-slate-900" aria-label={isDarkMode ? 'Activate light mode' : 'Activate dark mode'}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </div>
  </nav>
);

export default Navbar;
