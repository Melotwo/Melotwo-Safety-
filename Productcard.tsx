
import React, { useState, useRef, useEffect } from 'react';
import type { Product, Review } from '../types.ts';
import { CheckCircle, ShoppingCart, Star, Minus, Plus, Printer, Share2, Copy, Check, Twitter, Facebook, Linkedin, Scale, MessageSquare, Eye } from 'lucide-react';
import CustomizationModal from './CustomizationModal.tsx';
import ProductReviews from './ProductReviews.tsx';
import StarRating from './StarRating.tsx';

interface ProductCardProps {
  product: Product;
  onToggleCompare: (product: Product) => void;
  isInCompare: boolean;
  isCompareDisabled: boolean;
  onAddReview: (productId: number, reviewData: Omit<Review, 'id' | 'date'>) => void;
  onQuickView: (product: Product) => void;
}

const SABS_STANDARD_DETAILS: { [key: string]: string } = {
  'SABS 1397': 'Specifies requirements for industrial safety helmets to protect the head from falling objects and electrical hazards.',
  'SABS EN388': 'Covers the requirements, test methods, marking, and information for protective gloves against mechanical risks like abrasion and cuts.',
  'SABS 20345': 'Details the basic and additional requirements for safety footwear, including features like toe protection and slip resistance.',
  'SABS 50361': 'Pertains to full body harnesses used in fall arrest systems, outlining design, performance, and testing requirements for working at height.',
  'SABS 166': 'Specifies the requirements for personal eye-protectors, including optical quality, strength, and resistance to various hazards.',
  'SANS 434': 'Relates to high-visibility warning clothing, ensuring wearers are conspicuous in hazardous situations under any light conditions.',
};


const ProductCard: React.FC<ProductCardProps> = ({ product, onToggleCompare, isInCompare, isCompareDisabled, onAddReview, onQuickView }) => {
  const [quantity, setQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);


  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const sharePopoverRef = useRef<HTMLDivElement>(null);

  const sabsDetail = product.sabsStandard ? SABS_STANDARD_DETAILS[product.sabsStandard] : undefined;

  const averageRating = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
    : 0;
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (
            isShareOpen &&
            sharePopoverRef.current &&
            !sharePopoverRef.current.contains(event.target as Node) &&
            shareButtonRef.current &&
            !shareButtonRef.current.contains(event.target as Node)
        ) {
            setIsShareOpen(false);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isShareOpen]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      setQuantity(value);
    } else if (e.target.value === '') {
      // Allow empty input but treat it as 1 for logic, or decide on a different handling.
    }
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  
  const handleCopyLink = () => {
    const productUrl = `${window.location.origin}${window.location.pathname}#product-${product.id}`;
    navigator.clipboard.writeText(productUrl).then(() => {
        setLinkCopied(true);
        setTimeout(() => {
            setLinkCopied(false);
            setIsShareOpen(false);
        }, 2000);
    });
  };

  const productUrl = encodeURIComponent(`${window.location.origin}${window.location.pathname}#product-${product.id}`);
  const productText = encodeURIComponent(`Check out this product: ${product.name}`);
  const twitterUrl = `https://twitter.com/intent/tweet?url=${productUrl}&text=${productText}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${productUrl}`;
  const linkedinUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${productUrl}&title=${productText}`;

  return (
    <>
      <div className="group flex flex-col bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="overflow-hidden relative">
          <img className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" src={product.imageUrl} alt={product.name} />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
                onClick={() => onQuickView(product)}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-900 bg-white/90 border border-transparent rounded-md shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
                <Eye size={16} className="mr-2" />
                Quick View
            </button>
          </div>
          {product.isPrintable && (
            <div className="absolute top-3 right-3 bg-indigo-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
              <Printer size={14} />
              <span>Customizable</span>
            </div>
          )}
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{product.name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 flex-grow">{product.description}</p>
          
          {product.price && (
            <div className="mt-3">
              <p className="text-xl font-bold text-slate-800 dark:text-slate-200">
                {product.price.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
              </p>
            </div>
          )}
          
          <div className="flex items-center mt-2">
             {averageRating > 0 ? (
                <>
                  <StarRating rating={averageRating} />
                  <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                    {averageRating.toFixed(1)} average rating
                  </span>
                </>
            ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400">No reviews yet</span>
            )}
          </div>
          
          {product.sabsCertified && (
            <div className="mt-3">
              <div className="relative group inline-flex items-center" aria-describedby={`sabs-tooltip-${product.id}`}>
                <div className="flex items-center text-sm text-green-600 dark:text-green-500 font-medium cursor-help">
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  <span>SABS Certified</span>
                  {product.sabsStandard && (
                    <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs font-semibold rounded-full">
                      {product.sabsStandard}
                    </span>
                  )}
                </div>
                {sabsDetail && (
                  <div
                    id={`sabs-tooltip-${product.id}`}
                    role="tooltip"
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 dark:bg-slate-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 pointer-events-none z-10"
                  >
                    <h4 className="font-bold border-b border-slate-600 pb-1 mb-1.5">{product.sabsStandard}</h4>
                    <p className="leading-relaxed">{sabsDetail}</p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-800 dark:border-t-slate-900"></div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center gap-2">
                  <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-md">
                      <button 
                          onClick={decrementQuantity}
                          className="px-2.5 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-l-md transition-colors disabled:opacity-50"
                          aria-label="Decrease quantity"
                          disabled={quantity <= 1}
                      >
                          <Minus size={16} />
                      </button>
                      <input
                          type="number"
                          value={quantity}
                          onChange={handleQuantityChange}
                          className="w-12 h-full text-center border-l border-r border-slate-300 dark:border-slate-600 bg-transparent dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          min="1"
                          aria-label="Product quantity"
                      />
                      <button 
                          onClick={incrementQuantity}
                          className="px-2.5 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-r-md transition-colors"
                          aria-label="Increase quantity"
                      >
                          <Plus size={16} />
                      </button>
                  </div>
                  <button
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-amber-500 border border-transparent rounded-md shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
                      >
                      Add to Cart
                      <ShoppingCart className="w-4 h-4 ml-2" />
                  </button>
                   <div className="relative">
                        <button
                            ref={shareButtonRef}
                            onClick={() => setIsShareOpen(prev => !prev)}
                            className="p-2.5 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            aria-label="Share product"
                        >
                            <Share2 size={16} />
                        </button>
                        {isShareOpen && (
                            <div ref={sharePopoverRef} className="absolute bottom-full right-0 mb-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-10 p-2 transition-opacity duration-200"
                            >
                                <div className="space-y-1">
                                    <button
                                        onClick={handleCopyLink}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                    >
                                        {linkCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        <span>{linkCopied ? 'Link Copied!' : 'Copy Product Link'}</span>
                                    </button>
                                    <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
                                    <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                                        <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                                        <span>Share on Twitter</span>
                                    </a>
                                    <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                                        <Facebook className="w-4 h-4 text-[#1877F2]" />
                                        <span>Share on Facebook</span>
                                    </a>
                                    <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                                        <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                                        <span>Share on LinkedIn</span>
                                    </a>
                                </div>
                            </div>
                        )}
                   </div>
              </div>
               <div className="flex items-center gap-2">
                {product.isPrintable && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-500/20 border border-transparent rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        Customize
                        <Printer className="w-4 h-4 ml-2" />
                    </button>
                )}
                <button
                    onClick={() => setIsReviewsOpen(prev => !prev)}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                    <MessageSquare size={16} className="mr-2"/>
                    Reviews ({product.reviews?.length || 0})
                </button>
                <button
                    onClick={() => onToggleCompare(product)}
                    disabled={isCompareDisabled}
                    className={`flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isInCompare 
                        ? 'bg-amber-500 text-white border-transparent hover:bg-amber-600' 
                        : 'bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                >
                    <Scale size={16} className="mr-2"/>
                    {isInCompare ? 'Selected' : 'Compare'}
                </button>
              </div>
          </div>
        </div>
        {isReviewsOpen && (
          <ProductReviews
            productId={product.id}
            reviews={product.reviews || []}
            onAddReview={onAddReview}
          />
        )}
      </div>
      <CustomizationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
      />
    </>
  );
};

export default ProductCard;
