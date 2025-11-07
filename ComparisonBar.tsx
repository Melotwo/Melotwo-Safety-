
import React from 'react';
import type { Product } from '../types';
import { X, Scale, Trash2 } from 'lucide-react';

interface ComparisonBarProps {
  items: Product[];
  onCompare: () => void;
  onClear: () => void;
  onRemove: (productId: number) => void;
}

const ComparisonBar: React.FC<ComparisonBarProps> = ({ items, onCompare, onClear, onRemove }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 shadow-lg-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 hidden sm:block">
              Compare Products
              <span className="ml-2 text-slate-500 dark:text-slate-400 font-normal">
                ({items.length}/4)
              </span>
            </h3>
             <div className="h-10 border-l border-slate-300 dark:border-slate-600 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              {items.map(item => (
                <div key={item.id} className="relative group">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-16 w-16 rounded-md object-cover border-2 border-slate-300 dark:border-slate-600"
                  />
                  <button
                    onClick={() => onRemove(item.id)}
                    className="absolute -top-2 -right-2 bg-slate-600 text-white rounded-full h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    aria-label={`Remove ${item.name} from comparison`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button
              onClick={onClear}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-transparent border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </button>
            <button
              onClick={onCompare}
              className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white bg-amber-500 border border-transparent rounded-md shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <Scale className="w-4 h-4 mr-2" />
              Compare Now ({items.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonBar;
