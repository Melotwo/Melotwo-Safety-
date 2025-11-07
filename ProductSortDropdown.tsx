
import React from 'react';
import { ArrowUpDown } from 'lucide-react';

interface ProductSortDropdownProps {
  sortOption: string;
  onSortChange: (option: string) => void;
}

const ProductSortDropdown: React.FC<ProductSortDropdownProps> = ({ sortOption, onSortChange }) => {
  return (
    <div className="flex items-center space-x-2">
       <label htmlFor="sort-options" className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center">
        <ArrowUpDown className="w-4 h-4 mr-1.5" />
        Sort by:
      </label>
      <select
        id="sort-options"
        value={sortOption}
        onChange={(e) => onSortChange(e.target.value)}
        className="block w-48 pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200"
      >
        <option value="relevance">Relevance</option>
        <option value="name-asc">Name: A-Z</option>
        <option value="name-desc">Name: Z-A</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
      </select>
    </div>
  );
};

export default ProductSortDropdown;
