
import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { X, CheckCircle, Minus, Plus, ShoppingCart, Printer } from 'lucide-react';
import StarRating from './StarRating';
import CustomizationModal from './CustomizationModal';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setIsExiting(false);
      // Lock body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Unlock body scroll
      document.body.style.overflow = '';
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [product]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300); // Wait for animation
  };

  if (!product) {
    return null;
  }

  const averageRating = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
    : 0;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] flex items-center justify-center transition-opacity duration-300 ${
          isExiting ? 'opacity-0' : 'opacity-100'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
      >
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose}></div>
        <div
          className={`relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl m-4 overflow-hidden flex flex-col max-h-[90vh] transition-transform duration-300 ${
            isExiting ? 'scale-95' : 'scale-100'
          }`}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-slate-400 bg-white/50 dark:bg-slate-900/50 rounded-full p-1.5 hover:text-slate-800 dark:hover:text-white z-20 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 h-full">
            <div className="p-4 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full max-h-[80vh] object-contain rounded-lg" />
            </div>
            
            <div className="p-8 flex flex-col overflow-y-auto">
              <div className="flex-grow">
                <span className="text-sm font-semibold text-amber-500 uppercase tracking-wider">{product.category}</span>
                <h2 id="product-detail-title" className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">{product.name}</h2>
                
                <div className="flex items-center mt-3">
                  {averageRating > 0 ? (
                    <>
                      <StarRating rating={averageRating} />
                      <a href="#reviews" onClick={handleClose} className="ml-3 text-sm text-slate-500 dark:text-slate-400 hover:underline">
                        ({product.reviews?.length || 0} review{product.reviews?.length !== 1 ? 's' : ''})
                      </a>
                    </>
                  ) : (
                    <span className="text-sm text-slate-500 dark:text-slate-400">No reviews yet</span>
                  )}
                </div>

                {product.price && (
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-200 mt-4">
                    {product.price.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
                  </p>
                )}
                
                <p className="text-base text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">{product.description}</p>
                
                {product.sabsCertified && (
                  <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-500 font-medium bg-green-50 dark:bg-green-500/10 px-3 py-2 rounded-md">
                    <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>SABS Certified: <strong>{product.sabsStandard}</strong></span>
                  </div>
                )}
              </div>
              
              <div className="mt-auto pt-6 space-y-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Quantity:</span>
                  <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-md">
                    <button 
                      onClick={decrementQuantity}
                      className="px-3 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-l-md transition-colors disabled:opacity-50"
                      aria-label="Decrease quantity"
                      disabled={quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-14 h-full text-center border-l border-r border-slate-300 dark:border-slate-600 bg-transparent dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      min="1"
                      aria-label="Product quantity"
                    />
                    <button 
                      onClick={incrementQuantity}
                      className="px-3 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-r-md transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-stretch gap-3">
                  <button className="flex-1 inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-amber-500 border border-transparent rounded-md shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors">
                    Add to Cart
                    <ShoppingCart className="w-5 h-5 ml-2" />
                  </button>
                  {product.isPrintable && (
                    <button 
                      onClick={() => setIsCustomizationModalOpen(true)} 
                      className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-500/20 border border-transparent rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      Customize
                      <Printer className="w-5 h-5 ml-2" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {product && (
        <CustomizationModal
          isOpen={isCustomizationModalOpen}
          onClose={() => setIsCustomizationModalOpen(false)}
          product={product}
        />
      )}
    </>
  );
};
