import React from 'react';
import type { Product } from '../types';
import { CheckCircle, ExternalLink, PlusCircle, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToQuote: (product: Product) => void;
  isProductInQuote: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToQuote, isProductInQuote }) => {
  const description = product.description;
  const maxLength = 80;
  const truncatedDescription = description.length > maxLength
    ? `${description.substring(0, maxLength)}...`
    : description;

  return (
    <div className="group flex flex-col bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="overflow-hidden">
        <img className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" src={product.imageUrl} alt={product.name} />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{product.name}</h3>
        <p 
          className="text-sm text-slate-500 dark:text-slate-400 mt-2 flex-grow"
          title={description}
        >
          {truncatedDescription}
        </p>
        
        {product.sabsCertified && (
          <div className="flex items-center flex-wrap gap-y-2 text-sm text-green-600 dark:text-green-500 mt-3 font-medium">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1.5" />
              <span>SABS Certified</span>
            </div>
            {product.sabsStandard && (
              <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs font-semibold rounded-full">
                {product.sabsStandard}
              </span>
            )}
          </div>
        )}
        
        <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => onAddToQuote(product)}
              disabled={isProductInQuote}
              className={`w-full inline-flex items-center justify-center px-4 py-2 text-sm font-semibold border rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                isProductInQuote
                  ? 'bg-green-600 text-white border-transparent cursor-default'
                  : 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30 dark:hover:bg-orange-500/30'
              }`}
            >
              {isProductInQuote ? (
                <>
                  In Quote <Check className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Add to Quote <PlusCircle className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
            <a 
              href={product.affiliateUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-slate-600 border border-transparent rounded-md shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
            >
              View Details
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;