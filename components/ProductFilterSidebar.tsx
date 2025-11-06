import React from 'react';
import { PRODUCT_CATEGORIES } from '../constants';
import { Tag } from 'lucide-react';

interface ProductFilterSidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  showOnlyCertified: boolean;
  onCertifiedChange: (checked: boolean) => void;
}

const allCategoriesOption = { name: 'All Categories' };

const ProductFilterSidebar: React.FC<ProductFilterSidebarProps> = ({
  selectedCategory,
  onCategoryChange,
  showOnlyCertified,
  onCertifiedChange,
}) => {
  return (
    <aside className="w-full md:w-64 lg:w-72 flex-shrink-0">
      <div className="sticky top-24 space-y-8">
        {/* Categories Filter */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 flex items-center">
            <Tag className="w-5 h-5 mr-2 text-orange-600" />
            Categories
          </h3>
          <ul className="space-y-1">
            {[allCategoriesOption, ...PRODUCT_CATEGORIES].map((category) => (
              <li key={category.name}>
                <button
                  onClick={() => onCategoryChange(category.name === 'All Categories' ? 'All' : category.name)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-between ${
                    (selectedCategory === category.name || (selectedCategory === 'All' && category.name === 'All Categories'))
                      ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400'
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
           <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
            Certification
          </h3>
          <label htmlFor="sabs-filter" className="flex items-center space-x-3 p-2 rounded-lg transition-colors hover:bg-orange-50 dark:hover:bg-slate-800 cursor-pointer">
              <input
                  id="sabs-filter"
                  type="checkbox"
                  checked={showOnlyCertified}
                  onChange={(e) => onCertifiedChange(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 dark:border-slate-600 text-orange-600 focus:ring-orange-500 bg-slate-100 dark:bg-slate-700"
              />
              <span className="font-medium text-slate-700 dark:text-slate-300">SABS Certified Only</span>
          </label>
        </div>
      </div>
    </aside>
  );
};

export default ProductFilterSidebar;