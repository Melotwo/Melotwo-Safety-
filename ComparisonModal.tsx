
import React, { useState, useMemo, useEffect } from 'react';
import type { Product } from '../types';
import { X, CheckCircle, XCircle, SearchX } from 'lucide-react';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({ isOpen, onClose, products }) => {
  const [showOnlyCertified, setShowOnlyCertified] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState('All');

  // Reset filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowOnlyCertified(false);
      setSelectedStandard('All');
    }
  }, [isOpen]);

  const availableStandards = useMemo(() => {
    const standards = new Set<string>();
    products.forEach(p => {
      if (p.sabsStandard) {
        standards.add(p.sabsStandard);
      }
    });
    return Array.from(standards).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => !showOnlyCertified || p.sabsCertified)
      .filter(p => selectedStandard === 'All' || p.sabsStandard === selectedStandard);
  }, [products, showOnlyCertified, selectedStandard]);

  if (!isOpen) return null;

  const features = [
    { key: 'imageUrl', label: 'Image' },
    { key: 'name', label: 'Product Name' },
    { key: 'price', label: 'Price' },
    { key: 'sabsCertified', label: 'SABS Certified' },
    { key: 'sabsStandard', label: 'SABS Standard' },
    { key: 'description', label: 'Description' },
  ];

  const renderFeature = (product: Product, featureKey: string) => {
    switch (featureKey) {
      case 'imageUrl':
        return <img src={product.imageUrl} alt={product.name} className="w-32 h-32 object-cover rounded-md mx-auto" />;
      case 'price':
        return product.price ? product.price.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' }) : <span className="text-slate-500">N/A</span>;
      case 'sabsCertified':
        return product.sabsCertified ? (
          <div className="flex items-center justify-center text-green-600 dark:text-green-500">
            <CheckCircle className="w-5 h-5 mr-2" /> Yes
          </div>
        ) : (
          <div className="flex items-center justify-center text-red-600 dark:text-red-500">
            <XCircle className="w-5 h-5 mr-2" /> No
          </div>
        );
      case 'sabsStandard':
        return product.sabsStandard || <span className="text-slate-500">Not specified</span>;
      case 'description':
        return <p className="text-sm">{product.description}</p>;
      default:
        return <p className="font-bold text-lg">{(product as any)[featureKey]}</p>;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-6xl m-4 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100" id="modal-title">
            Product Comparison
          </h2>
          <button
            type="button"
            className="text-slate-400 bg-transparent hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-600 dark:hover:text-white rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Filter Controls */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-4 bg-slate-50 dark:bg-slate-900/50 sticky top-[69px] z-10">
          <label htmlFor="compare-sabs-filter" className="flex items-center space-x-2 cursor-pointer">
            <input
              id="compare-sabs-filter"
              type="checkbox"
              checked={showOnlyCertified}
              onChange={(e) => setShowOnlyCertified(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-amber-600 focus:ring-amber-500 bg-slate-100 dark:bg-slate-700"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">SABS Certified Only</span>
          </label>
          
          {availableStandards.length > 0 && (
            <div className="flex items-center space-x-2">
              <label htmlFor="compare-standard-filter" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-shrink-0">
                Filter by Standard:
              </label>
              <select
                id="compare-standard-filter"
                value={selectedStandard}
                onChange={(e) => setSelectedStandard(e.target.value)}
                className="block w-full sm:w-auto pl-3 pr-8 py-1.5 text-sm border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-amber-500 focus:border-amber-500 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200"
              >
                <option value="All">All Standards</option>
                {availableStandards.map(standard => (
                  <option key={standard} value={standard}>{standard}</option>
                ))}
              </select>
            </div>
          )}
        </div>


        <div className="overflow-x-auto overflow-y-auto">
          {filteredProducts.length > 0 ? (
            <table className="w-full table-fixed border-collapse">
              <thead className="sticky top-[132px] bg-slate-50 dark:bg-slate-900 z-[9]">
                <tr>
                  <th className="w-1/5 p-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300 border-b border-r border-slate-200 dark:border-slate-700">
                    Feature
                  </th>
                  {filteredProducts.map(product => (
                    <th key={product.id} className="w-1/5 p-4 text-sm font-semibold text-slate-600 dark:text-slate-300 border-b border-r border-slate-200 dark:border-slate-700">
                      {product.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {features.map(feature => (
                  <tr key={feature.key}>
                    <td className="p-4 align-top font-medium text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700">
                      {feature.label}
                    </td>
                    {filteredProducts.map(product => (
                      <td key={product.id} className="p-4 align-top text-center text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700">
                        {renderFeature(product, feature.key)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
             <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[300px]">
                <SearchX className="w-12 h-12 text-slate-400 dark:text-slate-500 mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">No Products Match Filters</h3>
                <p className="mt-2 text-slate-500 dark:text-slate-400">
                    Try adjusting your filter selections.
                </p>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-end p-5 border-t border-slate-200 dark:border-slate-700 sticky bottom-0 bg-white dark:bg-slate-800">
          <button
            type="button"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-amber-500 border border-transparent rounded-lg shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;
