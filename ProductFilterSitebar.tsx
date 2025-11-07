
import React from 'react';
import { PRODUCT_CATEGORIES } from '../constants.ts';
import { Tag, BookmarkCheck, CheckCircle } from 'lucide-react';

interface ProductFilterSidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  showOnlyCertified: boolean;
  onCertifiedChange: (checked: boolean) => void;
  allSabsStandards: string[];
  selectedStandards: string[];
  onStandardsChange: (standard: string) => void;
}

const allCategoriesOption = { name: 'All Categories' };

const ProductFilterSidebar: React.FC<ProductFilterSidebarProps> = ({
  selectedCategory,
  onCategoryChange,
  showOnlyCertified,
  onCertifiedChange,
  allSabsStandards,
  selectedStandards,
  onStandardsChange,
}) => {
  return (
    <aside className="w-full md:w-64 lg:w-72 flex-shrink-0">
      <div className="sticky top-24 space-y-8">
        {/* Categories Filter */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 flex items-center">
            <Tag className="w-5 h-5 mr-2 text-amber-500" />
            Categories
          </h3>
          <ul className="space-y-1">
            {[allCategoriesOption, ...PRODUCT_CATEGORIES].map((category) => (
              <li key={category.name}>
                <button
                  onClick={() => onCategoryChange(category.name === 'All Categories' ? 'All' : category.name)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-between ${
                    (selectedCategory === category.name || (selectedCategory === 'All' && category.name === 'All Categories'))
                      ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Certification Filter */}
        <div>
           <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-amber-500" />
            Certification
          </h3>
          <label htmlFor="sabs-filter" className="flex items-center space-x-3 p-2 rounded-lg transition-colors hover:bg-amber-50 dark:hover:bg-slate-800 cursor-pointer">
              <input
                  id="sabs-filter"
                  type="checkbox"
                  checked={showOnlyCertified}
                  onChange={(e) => onCertifiedChange(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 dark:border-slate-600 text-amber-600 focus:ring-amber-500 bg-slate-100 dark:bg-slate-700"
              />
              <span className="font-medium text-slate-700 dark:text-slate-300">SABS Certified Only</span>
          </label>
        </div>
        
        {/* SABS Standards Filter */}
        {allSabsStandards.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 flex items-center">
              <BookmarkCheck className="w-5 h-5 mr-2 text-amber-500" />
              SABS Standards
            </h3>
            <ul className="space-y-1 max-h-60 overflow-y-auto pr-2">
              {allSabsStandards.map(standard => (
                <li key={standard}>
                  <label htmlFor={`standard-${standard}`} className="flex items-center space-x-3 p-2 rounded-lg transition-colors hover:bg-amber-50 dark:hover:bg-slate-800 cursor-pointer">
                    <input
                      id={`standard-${standard}`}
                      type="checkbox"
                      checked={selectedStandards.includes(standard)}
                      onChange={() => onStandardsChange(standard)}
                      className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-amber-600 focus:ring-amber-500 bg-slate-100 dark:bg-slate-700"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{standard}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
};

export default ProductFilterSidebar;
