import React from 'react';
import { History, Trash2 } from 'lucide-react';
import { GenerationHistoryItem } from '../types.ts';

interface GenerationHistoryProps {
  history: GenerationHistoryItem[];
  onItemClick: (item: GenerationHistoryItem) => void;
  onClear: () => void;
}

const GenerationHistory: React.FC<GenerationHistoryProps> = ({ history, onItemClick, onClear }) => {
  if (history.length === 0) {
    return null; // Don't render anything if there's no history
  }

  return (
    <section aria-labelledby="generation-history-title" className="mt-12 animate-slide-in" style={{ animationDelay: '0.3s' }}>
      <div className="flex justify-between items-center mb-4">
        <h2 id="generation-history-title" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center">
          <History className="w-7 h-7 mr-3 text-amber-500" />
          Recent Generations
        </h2>
        <button
          onClick={onClear}
          className="flex items-center text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          aria-label="Clear generation history"
        >
          <Trash2 size={16} className="mr-1" />
          Clear All
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {history.map(item => (
          <button
            key={item.id}
            onClick={() => onItemClick(item)}
            className="text-left p-4 bg-white dark:bg-slate-900/50 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 border-2 border-slate-200 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-800 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500"
          >
            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={item.task}>{item.task}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{item.industry}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{item.timestamp}</p>
          </button>
        ))}
      </div>
    </section>
  );
};

export default GenerationHistory;
