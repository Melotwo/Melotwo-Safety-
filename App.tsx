import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';

// Icon imports from various components
import { 
  ShieldCheck, Sun, Moon, SearchX, ArrowUpDown, HardHat, Hand, Footprints, 
  Shield, Eye, Ear, Shirt, Mail, Loader2, CheckCircle, MessageSquare, X, Send, 
  Bot, User, Link, ChevronRight, History, ThumbsUp, ThumbsDown, Check, ShoppingCart, 
  Star, Minus, Plus, Printer, Share2, Copy, Twitter, Facebook, Linkedin, Scale, 
  Tag, BookmarkCheck, UploadCloud, Trash2, AlertTriangle, Info, XCircle, UserCircle,
  // FIX: Added Search icon for the search bar.
  Search
} from 'lucide-react';

// Type imports from various components
import type { 
  Product, Review, Toast as ToastType, ChatMessage, EmailContent, Source, 
  ProductCategory, LucideIcon 
} from './types.ts';
  
// Constant imports from various components
import { PRODUCTS, PRODUCT_CATEGORIES } from './constants.ts';

// Service imports from various components
import { getAiBotResponse, generateEmailDraft } from './services/geminiService.ts';


// ========= ALL COMPONENT DEFINITIONS START =========

// --- From components/StarRating.tsx ---
interface StarRatingProps {
  rating: number;
  totalStars?: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  className?: string;
}
const StarRating: React.FC<StarRatingProps> = ({
  rating,
  totalStars = 5,
  onRatingChange,
  size = 16,
  className = '',
}) => {
  return (
    <div className={`flex items-center space-x-0.5 ${className}`}>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            key={starValue}
            type="button"
            disabled={!onRatingChange}
            onClick={() => onRatingChange && onRatingChange(starValue)}
            className={`transition-colors ${onRatingChange ? 'cursor-pointer' : ''}`}
            aria-label={`Rate ${starValue} out of ${totalStars} stars`}
          >
            <Star
              size={size}
              className={`
                ${starValue <= rating ? 'text-amber-400 fill-current' : 'text-slate-300 dark:text-slate-600'}
                ${onRatingChange ? 'hover:text-amber-300' : ''}
              `}
            />
          </button>
        );
      })}
    </div>
  );
};


// --- From components/CustomizationModal.tsx ---
interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}
const CustomizationModal: React.FC<CustomizationModalProps> = ({ isOpen, onClose, product }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (logoUrl) {
        URL.revokeObjectURL(logoUrl);
      }
    };
  }, [logoUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (logoUrl) {
        URL.revokeObjectURL(logoUrl);
      }
      setLogoUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveLogo = () => {
    if (logoUrl) {
      URL.revokeObjectURL(logoUrl);
      setLogoUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg m-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <div className="text-lg font-semibold text-slate-900 dark:text-slate-100" id="modal-title">
            Customize: <span className="font-bold">{product.name}</span>
          </div>
          <button 
            type="button" 
            className="text-slate-400 bg-transparent hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-600 dark:hover:text-white rounded-lg text-sm p-1.5 ml-auto inline-flex items-center" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Preview</h3>
            <div className="relative w-full aspect-square bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              {logoUrl && (
                <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 flex items-center justify-center p-2">
                    <img 
                        src={logoUrl} 
                        alt="Custom logo preview" 
                        className="max-w-full max-h-full object-contain" 
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
                    />
                </div>
              )}
            </div>
          </div>
          <div className="space-y-4 flex flex-col justify-center">
             <h3 className="font-semibold text-slate-700 dark:text-slate-300">Your Logo</h3>
             <div className="flex flex-col items-center justify-center w-full">
                <label htmlFor="logo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:hover:bg-bray-800 dark:bg-slate-700 hover:bg-slate-100 dark:hover:border-slate-500 dark:hover:bg-slate-600 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-3 text-slate-500 dark:text-slate-400"/>
                        <p className="mb-2 text-sm text-slate-500 dark:text-slate-400 text-center"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG, SVG (MAX. 5MB)</p>
                    </div>
                    <input id="logo-upload" ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
            </div> 
            {logoUrl && (
              <button onClick={handleRemoveLogo} className="w-full flex items-center justify-center gap-2 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md py-2 transition-colors">
                <Trash2 size={16}/> Remove Logo
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end p-5 border-t border-slate-200 dark:border-slate-700 space-x-3">
          <button 
            type="button" 
            className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 focus:ring-4 focus:outline-none focus:ring-slate-300 dark:focus:ring-slate-500"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-amber-500 border border-transparent rounded-lg shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!logoUrl}
          >
            Add to Cart
            <ShoppingCart className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};


// --- From components/ProductReviews.tsx ---
interface ProductReviewsProps {
  productId: number;
  reviews: Review[];
  onAddReview: (productId: number, reviewData: Omit<Review, 'id' | 'date'>) => void;
}
const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, reviews, onAddReview }) => {
  const [username, setUsername] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'rating-desc' | 'rating-asc'>('date-desc');
  const [formError, setFormError] = useState('');

  const sortedReviews = useMemo(() => {
    const sorted = [...reviews];
    switch (sortBy) {
      case 'rating-desc':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'rating-asc':
        return sorted.sort((a, b) => a.rating - b.rating);
      case 'date-desc':
      default:
        return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  }, [reviews, sortBy]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || rating === 0 || !comment.trim()) {
      setFormError('Please fill in all fields and provide a rating.');
      return;
    }
    setFormError('');
    onAddReview(productId, { username, rating, comment });
    setUsername('');
    setRating(0);
    setComment('');
  };

  return (
    <div className="p-5 border-t border-slate-200 dark:border-slate-700 space-y-6">
      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Leave a Review</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`username-${productId}`} className="sr-only">Username</label>
              <input
                id={`username-${productId}`}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your Name"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-amber-500 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
            <div className="flex items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400 mr-3">Your Rating:</span>
              <StarRating rating={rating} onRatingChange={setRating} size={20} />
            </div>
          </div>
          <div>
            <label htmlFor={`comment-${productId}`} className="sr-only">Comment</label>
            <textarea
              id={`comment-${productId}`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts on this product..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-amber-500 bg-white dark:bg-slate-800 text-sm"
            ></textarea>
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <button type="submit" className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-amber-500 border border-transparent rounded-md shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
            Submit Review <Send size={14} className="ml-2" />
          </button>
        </form>
      </div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200">{reviews.length} Review{reviews.length !== 1 && 's'}</h4>
          {reviews.length > 1 && (
            <div className="flex items-center space-x-2">
              <label htmlFor={`sort-reviews-${productId}`} className="text-sm font-medium text-slate-600 dark:text-slate-400">
                <ArrowUpDown className="w-4 h-4 inline mr-1.5" />
                Sort:
              </label>
              <select
                id={`sort-reviews-${productId}`}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="block pl-2 pr-8 py-1 text-sm border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-amber-500 focus:border-amber-500 rounded-md bg-white dark:bg-slate-800"
              >
                <option value="date-desc">Newest</option>
                <option value="rating-desc">Highest Rating</option>
                <option value="rating-asc">Lowest Rating</option>
              </select>
            </div>
          )}
        </div>
        <div className="space-y-5">
          {sortedReviews.length > 0 ? (
            sortedReviews.map(review => (
              <div key={review.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{review.username}</p>
                    <StarRating rating={review.rating} size={14} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{review.comment}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">No reviews yet. Be the first to share your thoughts!</p>
          )}
        </div>
      </div>
    </div>
  );
};


// --- From components/EmailQuoteModal.tsx ---
interface EmailQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailContent: EmailContent | null;
}
const EmailQuoteModal: React.FC<EmailQuoteModalProps> = ({ isOpen, onClose, emailContent }) => {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && emailContent) {
      setSubject(emailContent.subject);
      setBody(emailContent.body);
      setRecipient('');
      setCopied(false);
    }
  }, [isOpen, emailContent]);

  if (!isOpen) return null;

  const handleCopyToClipboard = () => {
    const emailBodyForKlaviyo = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(emailBodyForKlaviyo).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSendMail = () => {
    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl m-4 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100" id="modal-title">
            Generated Email Draft
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
        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="recipient-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Recipient Email
            </label>
            <input
              type="email"
              id="recipient-email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="procurement@example.com"
              className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200"
            />
          </div>
          <div>
            <label htmlFor="email-subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Subject
            </label>
            <input
              type="text"
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200"
            />
          </div>
          <div>
            <label htmlFor="email-body" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Body
            </label>
            <textarea
              id="email-body"
              rows={10}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200"
            />
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Use 'Copy for Klaviyo' to easily paste this content into your marketing campaigns.
              </p>
          </div>
        </div>
        <div className="flex items-center justify-between p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={handleCopyToClipboard}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 border border-transparent rounded-md hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:ring-offset-slate-800"
          >
            {copied ? <Check className="w-5 h-5 mr-2 text-green-600" /> : <Copy className="w-5 h-5 mr-2" />}
            {copied ? 'Copied!' : 'Copy for Klaviyo'}
          </button>
          <div className="flex items-center space-x-3">
             <button
              type="button"
              className="px-5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSendMail}
              disabled={!recipient}
              className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white bg-amber-500 border border-transparent rounded-lg shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send via Email Client
              <Send className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- From components/ProductCard.tsx ---
const SABS_STANDARD_DETAILS: { [key: string]: string } = {
  'SABS 1397': 'Specifies requirements for industrial safety helmets to protect the head from falling objects and electrical hazards.',
  'SABS EN388': 'Covers the requirements, test methods, marking, and information for protective gloves against mechanical risks like abrasion and cuts.',
  'SABS 20345': 'Details the basic and additional requirements for safety footwear, including features like toe protection and slip resistance.',
  'SABS 50361': 'Pertains to full body harnesses used in fall arrest systems, outlining design, performance, and testing requirements for working at height.',
  'SABS 166': 'Specifies the requirements for personal eye-protectors, including optical quality, strength, and resistance to various hazards.',
  'SANS 434': 'Relates to high-visibility warning clothing, ensuring wearers are conspicuous in hazardous situations under any light conditions.',
};
interface ProductCardProps {
  product: Product;
  onToggleCompare: (product: Product) => void;
  isInCompare: boolean;
  isCompareDisabled: boolean;
  onAddReview: (productId: number, reviewData: Omit<Review, 'id' | 'date'>) => void;
  onQuickView: (product: Product) => void;
}
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
      // Allow empty input
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


// --- From components/ProductDetailModal.tsx ---
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
      document.body.style.overflow = 'hidden';
    } else {
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
    setTimeout(onClose, 300);
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


// --- From components/AiChatBot.tsx ---
const CHAT_HISTORY_KEY = 'melotwo-chat-history';
const MAX_HISTORY_MESSAGES = 10;
const AiChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const storedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      return storedHistory ? JSON.parse(storedHistory) : [];
    } catch (error) {
      console.error('Error loading chat history from localStorage:', error);
      return [];
    }
  });
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; } | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailContent, setEmailContent] = useState<EmailContent | null>(null);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const isInitialMessageOnly = messages.length === 1 && messages[0].id === 'initial';
      if (messages.length > 0 && !isInitialMessageOnly) {
        const historyToSave = messages.slice(-MAX_HISTORY_MESSAGES);
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(historyToSave));
      }
    } catch (error) {
      console.error('Error saving chat history to localStorage:', error);
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
        if (messages.length === 0) {
            setMessages([
              { id: 'initial', role: 'model', text: 'Hello! I am the Melotwo AI assistant. How can I help you with SABS-certified products or safety standards today?' }
            ]);
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                console.warn("Could not get user location:", error.message);
            }
        );
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    chatBodyRef.current?.scrollTo(0, chatBodyRef.current.scrollHeight);
  }, [messages]);

  const submitQuery = useCallback(async (query: string) => {
    if (query.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    setQueryHistory(prevHistory => {
        const updatedHistory = [query, ...prevHistory.filter(q => q !== query)];
        return updatedHistory.slice(0, 5);
    });

    try {
      const modelResponse = await getAiBotResponse(query, location);
      const modelMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        text: modelResponse.text,
        sources: modelResponse.sources.length > 0 ? modelResponse.sources : undefined,
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = { id: crypto.randomUUID(), role: 'model', text: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, location]);

  const handleSendMessage = useCallback(() => {
      submitQuery(userInput);
      setUserInput('');
  }, [submitQuery, userInput]);
  
  const handleHistoryClick = useCallback((query: string) => {
      submitQuery(query);
  }, [submitQuery]);

  const handleRating = (messageId: string, rating: 'up' | 'down') => {
    setMessages(prevMessages =>
      prevMessages.map(msg => {
        if (msg.id === messageId) {
          const newRating = msg.rating === rating ? null : rating;
          console.log(`Feedback submitted for message ID ${messageId}:`, {
            text: msg.text,
            rating: newRating,
          });
          return { ...msg, rating: newRating };
        }
        return msg;
      })
    );
  };

  const handleGenerateEmail = async () => {
    if (isGeneratingEmail || messages.length < 2) return;
    setIsGeneratingEmail(true);
    const draft = await generateEmailDraft(messages);
    if (draft) {
        setEmailContent(draft);
        setIsEmailModalOpen(true);
    } else {
        const errorMessage: ChatMessage = { id: crypto.randomUUID(), role: 'model', text: 'Sorry, I was unable to generate an email draft. Please try again later.' };
        setMessages(prev => [...prev, errorMessage]);
    }
    setIsGeneratingEmail(false);
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-amber-500 text-white rounded-full p-4 shadow-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-transform duration-200 ease-in-out hover:scale-110"
          aria-label="Toggle AI Chat"
        >
          {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
        </button>
      </div>
      <div
        className={`fixed bottom-20 right-5 z-50 w-[calc(100vw-2.5rem)] max-w-sm h-[70vh] max-h-[600px] bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900 rounded-t-lg">
          <div className="flex items-center">
            <Bot className="w-6 h-6 text-amber-500 mr-2" />
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Safety Assistant</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100">
            <X size={20} />
          </button>
        </header>
        <div ref={chatBodyRef} className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col items-start w-full">
                <div className={`flex items-start gap-3 w-full ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'model' && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white">
                        <Bot size={20} />
                        </div>
                    )}
                    <div className={`max-w-xs md:max-w-sm rounded-lg px-4 py-2 ${
                        msg.role === 'user' ? 'bg-amber-500 text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'
                    }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    {msg.role === 'user' && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300">
                        <User size={20} />
                        </div>
                    )}
                </div>
                 {msg.sources && msg.sources.length > 0 && msg.role === 'model' && (
                    <div className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 pl-11 w-full max-w-sm">
                        <h4 className="font-semibold mb-1 flex items-center gap-1.5">
                            <Link className="w-3 h-3"/>
                            Sources
                        </h4>
                        <ul className="space-y-1">
                            {msg.sources.map((source, index) => (
                                <li key={index} className="flex items-start">
                                <ChevronRight className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0 text-slate-400"/>
                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-500 hover:underline truncate" title={source.uri}>
                                        {source.title}
                                </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                 {msg.role === 'model' && msg.id !== 'initial' && (
                    <div className="mt-2 pl-11 flex items-center gap-2">
                        <button onClick={() => handleRating(msg.id, 'up')} className={`p-1 rounded-full transition-colors ${msg.rating === 'up' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`} aria-label="Good response">
                            <ThumbsUp size={14} />
                        </button>
                        <button onClick={() => handleRating(msg.id, 'down')} className={`p-1 rounded-full transition-colors ${msg.rating === 'down' ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`} aria-label="Bad response">
                            <ThumbsDown size={14} />
                        </button>
                    </div>
                )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
               <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white">
                  <Bot size={20} />
                </div>
              <div className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-4 py-2 rounded-bl-none">
                <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
              </div>
            </div>
          )}
        </div>
        <footer className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-b-lg">
          {queryHistory.length > 0 && (
            <div className="mb-3 px-1">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center">
                    <History size={14} className="mr-1.5"/>
                    Recent Queries
                </h4>
                <div className="flex flex-wrap gap-2">
                    {queryHistory.map((query, index) => (
                        <button
                            key={index}
                            onClick={() => handleHistoryClick(query)}
                            disabled={isLoading}
                            className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full hover:bg-amber-100 dark:hover:bg-amber-500/20 hover:text-amber-700 dark:hover:text-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={`Re-submit: "${query}"`}
                        >
                            {query}
                        </button>
                    ))}
                </div>
            </div>
          )}
          <div className="relative">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about PPE..."
              className="w-full pl-3 pr-24 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition bg-transparent dark:text-slate-200"
              disabled={isLoading || isGeneratingEmail}
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
                <button
                    onClick={handleGenerateEmail}
                    disabled={isGeneratingEmail || messages.length < 2}
                    className="flex items-center justify-center h-full w-10 text-slate-500 dark:text-slate-400 hover:text-amber-500 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                    aria-label="Generate email draft"
                    title="Generate email draft from conversation"
                >
                    {isGeneratingEmail ? <Loader2 size={20} className="animate-spin" /> : <Mail size={20} />}
                </button>
                 <div className="h-2/3 self-center border-l border-slate-300 dark:border-slate-600"></div>
                <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !userInput.trim()}
                    className="flex items-center justify-center h-full w-12 text-slate-500 dark:text-slate-400 hover:text-amber-500 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                    aria-label="Send message"
                >
                    <Send size={20} />
                </button>
            </div>
          </div>
        </footer>
      </div>
      <EmailQuoteModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        emailContent={emailContent}
      />
    </>
  );
};


// --- From components/Navbar.tsx ---
interface NavbarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}
const Navbar: React.FC<NavbarProps> = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-2">
              <ShieldCheck className="h-8 w-8 text-amber-500" />
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">Melotwo</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-4">
            <a href="#products" className="text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Products</a>
            <a href="#about" className="text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">About Us</a>
            <a href="#contact" className="text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Contact</a>
            <div className="flex items-center space-x-2">
              <a href="#" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-amber-500 border border-transparent rounded-md shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
                Request a Quote
              </a>
              <button
                onClick={toggleDarkMode}
                className="flex items-center justify-center w-10 h-10 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};


// --- From components/Footer.tsx ---
const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSuccess(true);
    setEmail('');
    setTimeout(() => setIsSuccess(false), 5000);
  };

  return (
    <footer className="bg-slate-800 dark:bg-slate-900 text-slate-300" id="contact">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <ShieldCheck className="h-8 w-8 text-amber-500" />
              <span className="text-xl font-bold text-white">Melotwo</span>
            </div>
            <p className="text-sm text-slate-400">Your trusted partner in workplace safety and PPE procurement.</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase">Products</h3>
            <ul className="mt-4 space-y-2">
              {PRODUCT_CATEGORIES.map(cat => (
                 <li key={cat.name}><a href="#products" className="text-base text-slate-300 hover:text-white">{cat.name}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#about" className="text-base text-slate-300 hover:text-white">About</a></li>
              <li><a href="#" className="text-base text-slate-300 hover:text-white">Careers</a></li>
              <li><a href="#" className="text-base text-slate-300 hover:text-white">Contact Us</a></li>
            </ul>
          </div>
           <div>
            <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase">Newsletter</h3>
            <p className="mt-4 text-sm text-slate-400">Get the latest on safety standards and product updates.</p>
            {isSuccess ? (
              <div className="mt-4 flex items-center p-3 rounded-md bg-green-500/20 text-green-300">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Subscribed!</span>
              </div>
            ) : (
               <form onSubmit={handleSubscribe} className="mt-4">
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    id="footer-email"
                    className="block w-full rounded-md border-slate-600 bg-slate-700 py-2.5 pl-4 pr-12 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-slate-400 hover:text-amber-400 disabled:cursor-not-allowed"
                    disabled={isLoading}
                    aria-label="Subscribe to newsletter"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </div>
                {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
              </form>
            )}
           
          </div>
        </div>
        <div className="mt-12 border-t border-slate-700 dark:border-slate-600 pt-8 text-center">
          <p className="text-base text-slate-400">&copy; {new Date().getFullYear()} Melotwo, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};


// --- From components/ProductFilterSidebar.tsx ---
interface ProductFilterSidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  showOnlyCertified: boolean;
  onCertifiedChange: (checked: boolean) => void;
  allSabsStandards: string[];
  selectedStandards: string[];
  onStandardsChange: (standard: string) => void;
}
const ProductFilterSidebar: React.FC<ProductFilterSidebarProps> = ({
  selectedCategory,
  onCategoryChange,
  showOnlyCertified,
  onCertifiedChange,
  allSabsStandards,
  selectedStandards,
  onStandardsChange,
}) => {
  const allCategoriesOption = { name: 'All Categories' };
  return (
    <aside className="w-full md:w-64 lg:w-72 flex-shrink-0">
      <div className="sticky top-24 space-y-8">
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


// --- From components/EmailCapture.tsx ---
const EmailCapture: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please provide a valid email address.');
      return;
    }
    setError('');
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSuccess(true);
  };

  return (
    <section className="bg-amber-50 dark:bg-slate-800/50">
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
        <Mail className="mx-auto h-12 w-12 text-amber-500" />
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
          Stay Ahead in Safety
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
          Join our mailing list for the latest on SABS standards, new product arrivals, and exclusive procurement tips.
        </p>
        <div className="mt-8 max-w-md mx-auto">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center p-6 bg-green-100 dark:bg-green-500/20 rounded-lg">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <h3 className="mt-4 text-xl font-semibold text-green-800 dark:text-green-300">
                Thank you for subscribing!
              </h3>
              <p className="mt-1 text-green-600 dark:text-green-400">
                You're on the list. Keep an eye on your inbox.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="sm:flex sm:gap-3">
              <div className="min-w-0 flex-1">
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border-slate-300 dark:border-slate-600 px-5 py-3 text-base text-slate-900 dark:text-slate-200 placeholder-slate-500 shadow-sm focus:border-amber-500 focus:ring-amber-500 bg-white dark:bg-slate-900/50"
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="mt-3 sm:mt-0">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center justify-center w-full rounded-md border border-transparent bg-amber-500 px-5 py-3 text-base font-medium text-white shadow hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-amber-50 dark:focus:ring-offset-slate-800 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Subscribing...
                    </>
                  ) : 'Subscribe'}
                </button>
              </div>
            </form>
          )}
           {error && !isSuccess && <p className="mt-3 text-sm text-red-600 dark:text-red-500">{error}</p>}
        </div>
      </div>
    </section>
  );
};


// --- From components/ComparisonBar.tsx ---
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


// --- From components/ComparisonModal.tsx ---
interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}
const ComparisonModal: React.FC<ComparisonModalProps> = ({ isOpen, onClose, products }) => {
  const [showOnlyCertified, setShowOnlyCertified] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState('All');

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


// --- From components/Toast.tsx ---
const ICONS = {
  warning: <AlertTriangle className="h-6 w-6 text-amber-500" />,
  success: <CheckCircle className="h-6 w-6 text-green-500" />,
  info: <Info className="h-6 w-6 text-blue-500" />,
  error: <XCircle className="h-6 w-6 text-red-500" />,
};
const BG_COLORS = {
  warning: 'bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700',
  success: 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700',
  info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
  error: 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700',
}
const TEXT_COLORS = {
    warning: 'text-amber-800 dark:text-amber-200',
    success: 'text-green-800 dark:text-green-200',
    info: 'text-blue-800 dark:text-blue-200',
    error: 'text-red-800 dark:text-red-200',
}
const Toast: React.FC<{ toast: ToastType; onClose: () => void; }> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [toast, onClose]);

  const icon = ICONS[toast.type];
  const bgColor = BG_COLORS[toast.type];
  const textColor = TEXT_COLORS[toast.type];

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md p-4 rounded-lg shadow-2xl border ${bgColor} animate-toast-in`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${textColor}`}>
            {toast.message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={onClose}
            className={`inline-flex rounded-md p-1.5 ${textColor} hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-black`}
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-toast-in { animation: toast-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};


// --- From components/ProductSearchBar.tsx ---
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


// --- From components/ProductSortDropdown.tsx ---
const ProductSortDropdown: React.FC<{ sortOption: string; onSortChange: (option: string) => void; }> = ({ sortOption, onSortChange }) => {
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

// ========= ALL COMPONENT DEFINITIONS END =========


const MAX_COMPARE_ITEMS = 4;

interface HomePageProps {
  showToast: (message: string, type: ToastType['type']) => void;
}

const HomePage: React.FC<HomePageProps> = ({ showToast }) => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [showOnlyCertified, setShowOnlyCertified] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStandards, setSelectedStandards] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState('relevance');
  const [searchQuery, setSearchQuery] = useState('');
  const [comparisonList, setComparisonList] = useState<Product[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const allSabsStandards = useMemo(() => {
    const standards = new Set<string>();
    PRODUCTS.forEach(p => {
      if (p.sabsStandard) {
        standards.add(p.sabsStandard);
      }
    });
    return Array.from(standards).sort();
  }, []);

  const handleToggleCompare = (product: Product) => {
    setComparisonList(prevList => {
      const isInList = prevList.some(p => p.id === product.id);
      if (isInList) {
        return prevList.filter(p => p.id !== product.id);
      }
      if (prevList.length < MAX_COMPARE_ITEMS) {
        return [...prevList, product];
      }
      showToast(`You can only compare up to ${MAX_COMPARE_ITEMS} products.`, 'warning');
      return prevList;
    });
  };

  const handleAddReview = (productId: number, reviewData: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...reviewData,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    setProducts(currentProducts =>
      currentProducts.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            reviews: [newReview, ...(p.reviews || [])],
          };
        }
        return p;
      })
    );
  };

  const handleStandardsChange = (standard: string) => {
    setSelectedStandards(prev =>
      prev.includes(standard)
        ? prev.filter(s => s !== standard)
        : [...prev, standard]
    );
  };

  const handleClearCompare = () => setComparisonList([]);
  const handleOpenCompareModal = () => setIsComparisonModalOpen(true);
  const handleCloseCompareModal = () => setIsComparisonModalOpen(false);

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products
      .filter(p => {
        if (!searchQuery) return true;
        const searchTerm = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(searchTerm) || p.description.toLowerCase().includes(searchTerm);
      })
      .filter(p => !showOnlyCertified || p.sabsCertified)
      .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
      .filter(p => {
        if (selectedStandards.length === 0) return true;
        return p.sabsStandard ? selectedStandards.includes(p.sabsStandard) : false;
      });

    switch (sortOption) {
      case 'name-asc':
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return [...filtered].sort((a, b) => b.name.localeCompare(a.name));
      case 'price-asc':
        return [...filtered].sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-desc':
        return [...filtered].sort((a, b) => (b.price || 0) - a.price);
      case 'relevance':
      default:
        return filtered;
    }
  }, [showOnlyCertified, selectedCategory, sortOption, searchQuery, products, selectedStandards]);

  return (
    <div className="space-y-24 md:space-y-32">
      <section className="relative text-center pt-16 md:pt-24 pb-12 md:pb-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800">
        <div 
          className="absolute inset-0 bg-slate-50 dark:bg-slate-900"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)' }}
        ></div>
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Your Premier Partner for <span className="text-amber-500">Certified Safety Equipment</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-400">
            Equip your workforce with SABS-approved Personal Protective Equipment (PPE). Fast procurement, expert advice, and uncompromising safety standards for the mining and industrial sectors.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a href="#products" className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-amber-500 border border-transparent rounded-md shadow-sm hover:bg-amber-600">
              Browse Products
            </a>
            <a href="#contact" className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-amber-700 bg-amber-100 border border-transparent rounded-md hover:bg-amber-200">
              Get Expert Advice
            </a>
          </div>
        </div>
      </section>

      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">Why Choose Melotwo?</h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">We are committed to quality, compliance, and your team's safety.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3">
          {PRODUCT_CATEGORIES.slice(0, 3).map((feature) => (
            <div key={feature.name} className="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 text-amber-600 mb-4">
                <feature.icon className="h-8 w-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{feature.name}</h3>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <EmailCapture />

      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">Our PPE Products</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
            Filter by category or certification to find the exact safety equipment you need.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          <ProductFilterSidebar
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            showOnlyCertified={showOnlyCertified}
            onCertifiedChange={setShowOnlyCertified}
            allSabsStandards={allSabsStandards}
            selectedStandards={selectedStandards}
            onStandardsChange={handleStandardsChange}
          />
          <div className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
               <ProductSearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
              <div className="w-full md:w-auto flex-shrink-0">
                 <ProductSortDropdown
                  sortOption={sortOption}
                  onSortChange={setSortOption}
                />
              </div>
            </div>
            {filteredAndSortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAndSortedProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                    onToggleCompare={handleToggleCompare}
                    isInCompare={comparisonList.some(p => p.id === product.id)}
                    isCompareDisabled={comparisonList.length >= MAX_COMPARE_ITEMS && !comparisonList.some(p => p.id === product.id)}
                    onAddReview={handleAddReview}
                    onQuickView={setQuickViewProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-100 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 h-full min-h-[400px]">
                <SearchX className="w-16 h-16 text-slate-400 dark:text-slate-500 mb-4" />
                <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">No Products Found</h3>
                <p className="mt-2 text-slate-500 dark:text-slate-400">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      {comparisonList.length > 0 && (
        <ComparisonBar
          items={comparisonList}
          onCompare={handleOpenCompareModal}
          onClear={handleClearCompare}
          onRemove={(productId) => setComparisonList(prev => prev.filter(p => p.id !== productId))}
        />
      )}
      <ComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={handleCloseCompareModal}
        products={comparisonList}
      />
       <ProductDetailModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [toast, setToast] = useState<ToastType | null>(null);

  const toggleDarkMode = () => {
      setIsDarkMode(prevMode => !prevMode);
  };

  const showToast = (message: string, type: ToastType['type']) => {
    setToast({ id: crypto.randomUUID(), message, type });
  };

  useEffect(() => {
      const root = window.document.documentElement;
      if (isDarkMode) {
          root.classList.add('dark');
      } else {
          root.classList.remove('dark');
      }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans antialiased">
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <main className="py-16">
        <HomePage showToast={showToast} />
      </main>
      <Footer />
      <AiChatBot />
    </div>
  );
};

export default App;
