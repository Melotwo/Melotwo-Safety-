
import React from 'react';
import { Search } from 'lucide-react';

interface ProductSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const ProductSearchBar: React.FC<ProductSearchBarProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="relative w-full md:w-auto flex-grow">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
      </div>
      <input
        type="text"
        name="search"
        id="search"
        className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md leading-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:placeholder-slate-400 dark:focus:placeholder-slate-500 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
        placeholder="Search products by name or description..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default ProductSearchBar;
