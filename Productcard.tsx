import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { PpeProduct } from '../types';

const ProductCard: React.FC<{
  product: PpeProduct;
  onGetQuote: (product: PpeProduct) => void;
}> = ({ product, onGetQuote }) => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col">
    <img src={product.image} alt={product.name} className="h-48 w-full object-cover" />
    <div className="p-4 flex flex-col flex-grow">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{product.name}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 flex-grow">{product.description}</p>
      <button
        onClick={() => onGetQuote(product)}
        className="mt-4 w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-slate-900 bg-amber-500 hover:bg-amber-600 focus:outline-none"
      >
        <ShoppingCart size={16} className="mr-2" />
        Get a Quote
      </button>
    </div>
  </div>
);

export default ProductCard;
