import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection, query, orderBy, where, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';

// Icon imports from various components
import { 
  ShieldCheck, Sun, Moon, SearchX, ArrowUpDown, HardHat, Hand, Footprints, 
  Shield, Eye, Ear, Shirt, Mail, Loader2, CheckCircle, MessageSquare, X, Send, 
  Bot, User, Link, ChevronRight, History, ThumbsUp, ThumbsDown, Check, ShoppingCart, 
  Star, Minus, Plus, Printer, Share2, Copy, Twitter, Facebook, Linkedin, Scale, 
  Tag, BookmarkCheck, UploadCloud, Trash2, AlertTriangle, Info, XCircle, UserCircle,
  Search
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// NOTE: GoogleGenAI client inlined below
import { GoogleGenAI, Type } from "@google/genai";

// Global variables for Firebase configuration
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase services outside of the component for reuse
let app, db, auth;
if (Object.keys(firebaseConfig).length > 0) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (e) {
    console.error("Firebase Initialization Failed:", e);
  }
}

// ========= TYPES INLINED =========
interface Review {
  id: string;
  username: string;
  rating: number;
  comment: string;
  date: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  sabsCertified: boolean;
  sabsStandard?: string;
  description: string;
  imageUrl: string; // Dynamic, will be fetched
  affiliateUrl: string;
  price?: number; // Dynamic, will be fetched
  isPrintable?: boolean;
  reviews?: Review[];
  isLoading?: boolean; // Added for dynamic data fetching state
}

interface ProductCategory {
  name: string;
  description: string;
  icon: LucideIcon;
}

interface Source {
  title: string;
  uri: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: Source[];
  rating?: 'up' | 'down' | null;
}

interface EmailContent {
  subject: string;
  body: string;
}

interface ToastType {
  id: string;
  message: string;
  type: 'warning' | 'success' | 'info' | 'error';
}

interface FirestoreState {
  db: ReturnType<typeof getFirestore> | null;
  auth: ReturnType<typeof getAuth> | null;
  userId: string | null;
  isAuthReady: boolean;
}


// ========= GEMINI SERVICE INLINED =========

// Helper function to initialize AI and handle potential runtime errors.
const getAiClient = () => {
  const apiKey = "" // Placeholder for Canvas environment
  if (apiKey === "") {
    // In Canvas environment, we rely on the runtime to provide the key
    return new GoogleGenAI({}); 
  }
  return new GoogleGenAI({ apiKey });
};

const getAiBotResponse = async (query: string, chatHistory: ChatMessage[], location: { latitude: number; longitude: number; } | null): Promise<{ text: string; sources: Source[] }> => {
  const ai = getAiClient();
  if (!ai) {
    return { text: "I'm sorry, but the AI assistant is currently unavailable due to a configuration issue.", sources: [] };
  }
  
  const tools: any[] = [{ googleSearch: {} }];
  
  // NOTE: Google Maps tool is not available in the public SDK and should be removed.
  // const tools: any[] = [{ googleSearch: {} }, { googleMaps: {} }];
  // const toolConfig: any = location ? {
  //   retrievalConfig: {
  //     latLng: {
  //       latitude: location.latitude,
  //       longitude: location.longitude,
  //     },
  //   },
  // } : undefined;
  
  const systemInstruction = `You are Melotwo AI, a friendly and knowledgeable assistant for a Personal Protective Equipment (PPE) supplier named Melotwo.
Your expertise is in South African Bureau of Standards (SABS) for mining and industrial safety equipment.
When asked for product recommendations, refer to the products available on the Melotwo website.
Keep your answers concise, helpful, and professional.`;

  const contents = chatHistory.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  })).concat({ role: 'user', parts: [{ text: query }] });

  try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents as any,
        config: {
          tools,
          systemInstruction,
        }
      });

      const text = response.text;
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      
      const sources: Source[] = [];
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web && chunk.web.uri && chunk.web.title) {
            sources.push({ title: chunk.web.title, uri: chunk.web.uri });
        }
        // Removing Maps chunk extraction as the tool is removed.
        // if (chunk.maps && chunk.maps.uri && chunk.maps.title) {
        //     sources.push({ title: chunk.maps.title, uri: chunk.maps.uri });
        // }
      });

      return { text, sources: sources.filter(s => s.uri && s.title) };
  } catch(e) {
      console.error(e);
      return { text: "Sorry, I'm having trouble connecting right now. Please try again later.", sources: [] };
  }
};

const generateEmailDraft = async (messages: ChatMessage[]): Promise<EmailContent | null> => {
    const conversationHistory = messages
        .filter(msg => msg.id !== 'initial') // Exclude initial greeting
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
        .join('\n');
    
    if (!conversationHistory) {
      return {
        subject: 'Inquiry about Safety Equipment',
        body: 'Hello Melotwo Team,\n\nI would like to inquire about...'
      };
    }
    
    const prompt = `Based on the following conversation between a user and an AI assistant for Melotwo (a PPE supplier), generate a concise and professional email draft for a price quote or inquiry.
    
    Conversation:
    ---
    ${conversationHistory}
    ---
    
    Generate a subject line and a body for the email. The email should summarize the user's needs and request a formal quote or further information.
    Assume the email is sent from a generic procurement manager to Melotwo. Keep it professional and to the point.
    `;

    const ai = getAiClient();
    if (!ai) {
      console.error("Could not generate email draft because AI client failed to initialize.");
      return null;
    }

    try {
        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                subject: { type: Type.STRING, description: "A concise subject line for the email." },
                body: { type: Type.STRING, description: "The full body content of the email, including a professional greeting and closing." }
            },
            required: ['subject', 'body']
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema,
            },
        });

        const jsonString = response.text.trim();
        const emailContent: EmailContent = JSON.parse(jsonString);
        return emailContent;

    } catch (error) {
        console.error("Error generating email draft:", error);
        return null;
    }
};

const fetchProductDetails = async (productName: string, productDescription: string): Promise<{ price: number | null; imageUrl: string | null }> => {
  const ai = getAiClient();
  if (!ai) {
    console.error("AI client not available for fetching product details.");
    return { price: null, imageUrl: null };
  }

  const prompt = `
    Based on publicly available South African market data, find the typical retail price in ZAR and a high-quality, commercially usable image URL for the following Personal Protective Equipment (PPE) product.
    Product Name: "${productName}"
    Description: "${productDescription}"
    
    If you cannot find a specific price, return null for price.
    If you cannot find a suitable image URL, return null for imageUrl.
    
    Provide ONLY the JSON object. Do not include any introductory text, comments, or markdown formatting.
  `;

  try {
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        price: {
          type: Type.NUMBER,
          description: "The estimated retail price in South African Rand (ZAR). Return null if a reliable price cannot be found."
        },
        imageUrl: {
          type: Type.STRING,
          description: "A direct URL to a high-quality, representative image of the product. Return null if a suitable image cannot be found."
        }
      },
      required: ['price', 'imageUrl']
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema,
      },
    });

    const jsonString = response.text.trim();
    const details = JSON.parse(jsonString);
    
    // Validate and sanitize response
    let finalPrice: number | null = null;
    if (typeof details.price === 'number' && details.price > 0) {
      finalPrice = parseFloat(details.price.toFixed(2));
    }
    
    let finalImageUrl: string | null = null;
    if (typeof details.imageUrl === 'string' && details.imageUrl.startsWith('http')) {
      finalImageUrl = details.imageUrl;
    }

    return { price: finalPrice, imageUrl: finalImageUrl };

  } catch (error) {
    console.error(`Error fetching details for "${productName}":`, error);
    return { price: null, imageUrl: null };
  }
};


// ========= CONSTANTS INLINED =========
const PRODUCT_CATEGORIES: ProductCategory[] = [
  { name: 'Head Protection', description: 'Helmets and hard hats for construction and mining.', icon: HardHat },
  { name: 'Hand Protection', description: 'Gloves for various industrial applications.', icon: Hand },
  { name: 'Foot Protection', description: 'Safety boots and shoes with reinforced toes.', icon: Footprints },
  { name: 'Fall Protection', description: 'Harnesses, lanyards, and fall arrest systems.', icon: Shield },
  { name: 'Eye Protection', description: 'Goggles and safety glasses for all environments.', icon: Eye },
  { name: 'Hearing Protection', description: 'Earmuffs and earplugs to prevent hearing loss.', icon: Ear },
  { name: 'Workwear', description: 'Durable and customizable clothing for the workplace.', icon: Shirt },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Industrial Hard Hat V-Gard',
    category: 'Head Protection',
    sabsCertified: true,
    sabsStandard: 'SABS 1397',
    description: 'A durable and comfortable hard hat with a high-density polyethylene shell. Meets SABS 1397 standards.',
    imageUrl: 'https://placehold.co/400x400/94A3B8/ffffff?text=Loading+Hat',
    affiliateUrl: 'https://mineafrica.co.za/',
    isPrintable: true,
    reviews: [],
    isLoading: true,
  },
  {
    id: 2,
    name: 'Leather Work Gloves',
    category: 'Hand Protection',
    sabsCertified: true,
    sabsStandard: 'SABS EN388',
    description: 'Reinforced leather gloves for heavy-duty tasks. SABS certified for abrasion resistance.',
    imageUrl: 'https://placehold.co/400x400/94A3B8/ffffff?text=Loading+Gloves',
    affiliateUrl: 'https://mineafrica.co.za/',
    reviews: [],
    isLoading: true,
  },
  {
    id: 3,
    name: 'Steel-Toe Safety Boots',
    category: 'Foot Protection',
    sabsCertified: true,
    sabsStandard: 'SABS 20345',
    description: 'Anti-slip, oil-resistant sole with steel toe cap protection. SABS 20345 compliant.',
    imageUrl: 'https://placehold.co/400x400/94A3B8/ffffff?text=Loading+Boots',
    affiliateUrl: 'https://mineafrica.co.za/',
    reviews: [],
    isLoading: true,
  },
  {
    id: 4,
    name: 'Full Body Safety Harness',
    category: 'Fall Protection',
    sabsCertified: true,
    sabsStandard: 'SABS 50361',
    description: '5-point adjustment harness for maximum safety during work at height. Complies with SABS 50361.',
    imageUrl: 'https://placehold.co/400x400/94A3B8/ffffff?text=Loading+Harness',
    affiliateUrl: 'https://mineafrica.co.za/',
    reviews: [],
    isLoading: true,
  },
  {
    id: 5,
    name: 'Anti-Fog Safety Goggles',
    category: 'Eye Protection',
    sabsCertified: true,
    sabsStandard: 'SABS 166',
    description: 'Ventilated, anti-fog, and scratch-resistant goggles for full eye protection. SABS 166 certified.',
    imageUrl: 'https://placehold.co/400x400/94A3B8/ffffff?text=Loading+Goggles',
    affiliateUrl: 'https://mineafrica.co.za/',
    reviews: [],
    isLoading: true,
  },
  {
    id: 6,
    name: 'High-Performance Earmuffs',
    category: 'Hearing Protection',
    sabsCertified: false,
    description: 'Comfortable earmuffs with a high Noise Reduction Rating (NRR) of 31dB.',
    imageUrl: 'https://placehold.co/400x400/94A3B8/ffffff?text=Loading+Earmuffs',
    affiliateUrl: 'https://mineafrica.co.za/',
    reviews: [],
    isLoading: true,
  },
  {
    id: 7,
    name: 'Reflective Mining Helmet',
    category: 'Head Protection',
    sabsCertified: true,
    sabsStandard: 'SABS 1397',
    description: 'Specialized helmet for mining with high visibility reflective strips and lamp bracket. SABS 1397.',
    imageUrl: 'https://placehold.co/400x400/94A3B8/ffffff?text=Loading+Mining+Hat',
    affiliateUrl: 'https://mineafrica.co.za/',
    reviews: [],
    isLoading: true,
  },
  {
    id: 8,
    name: 'Cut-Resistant Gloves',
    category: 'Hand Protection',
    sabsCertified: true,
    sabsStandard: 'SABS EN388',
    description: 'Level 5 cut resistance for handling sharp materials. Meets SABS EN388 standards.',
    imageUrl: 'https://placehold.co/400x400/94A3B8/ffffff?text=Loading+Cut+Gloves',
    affiliateUrl: 'https://mineafrica.co.za/',
    reviews: [],
    isLoading: true,
  },
  {
    id: 9,
    name: 'High-Visibility Safety Vest',
    category: 'Workwear',
    sabsCertified: true,
    sabsStandard: 'SANS 434',
    description: 'Bright, reflective safety vest for maximum visibility. Available for custom logo printing.',
    imageUrl: 'https://placehold.co/400x400/94A3B8/ffffff?text=Loading+Safety+Vest',
    affiliateUrl: 'https://mineafrica.co.za/',
    isPrintable: true,
    reviews: [],
    isLoading: true,
  },
  {
    id: 10,
    name: 'Branded Cotton Work Shirt',
    category: 'Workwear',
    sabsCertified: false,
    description: 'Comfortable and durable 100% cotton work shirt. Perfect for adding your company logo.',
    imageUrl: 'https://placehold.co/400x400/94A3B8/ffffff?text=Loading+Shirt',
    affiliateUrl: 'https://mineafrica.co.za/',
    isPrintable: true,
    reviews: [],
    isLoading: true,
  }
];

const FALLBACK_IMAGE_URL = (text: string) => `https://placehold.co/400x400/D1D5DB/1F2937?text=${encodeURIComponent(text.replace(/\s/g, '+'))}`;

// The collection path for private user data
const getUserCollectionPath = (userId: string) => 
  `/artifacts/${appId}/users/${userId}/melotwo_data`;

// The collection path for public, shared data (e.g., reviews)
const getPublicReviewsCollectionPath = () =>
  `/artifacts/${appId}/public/data/melotwo_reviews`;


// ========= ALL COMPONENT DEFINITIONS START =========

// --- StarRating Component ---
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


// --- CustomizationModal Component ---
interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onToast: (toast: Omit<ToastType, 'id'>) => void;
}
const CustomizationModal: React.FC<CustomizationModalProps> = ({ isOpen, onClose, product, onToast }) => {
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

  const handleAddToCart = () => {
    onToast({
      message: `"${product.name}" with custom logo added to inquiry list!`,
      type: 'success'
    });
    onClose();
  }

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
        className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg m-4 overflow-hidden transform transition-all scale-100 opacity-100"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <div className="text-lg font-semibold text-slate-900 dark:text-slate-100" id="modal-title">
            Customize: <span className="font-bold text-amber-500">{product.name}</span>
          </div>
          <button 
            type="button" 
            className="text-slate-400 bg-transparent hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-600 dark:hover:text-white rounded-lg text-sm p-1.5 ml-auto inline-flex items-center transition-colors" 
            onClick={onClose}
            aria-label="Close customization modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Eye size={16}/> Preview</h3>
            <div className="relative w-full aspect-square bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden border border-slate-300 dark:border-slate-600">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover" 
                onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE_URL(product.name) }}
              />
              {logoUrl && (
                <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 flex items-center justify-center p-2">
                    <img 
                        src={logoUrl} 
                        alt="Custom logo preview" 
                        className="max-w-full max-h-full object-contain" 
                        style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}
                    />
                </div>
              )}
            </div>
          </div>
          <div className="space-y-4 flex flex-col justify-center">
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><UploadCloud size={16}/> Upload Logo</h3>
              <div className="flex flex-col items-center justify-center w-full">
                <label htmlFor="logo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-amber-400 dark:border-amber-600 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:hover:bg-bray-800 dark:bg-slate-700 hover:bg-amber-50 dark:hover:border-amber-500 dark:hover:bg-slate-600 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-3 text-amber-500 dark:text-amber-400"/>
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
            className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 focus:ring-4 focus:outline-none focus:ring-slate-300 dark:focus:ring-slate-500 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-amber-500 border border-transparent rounded-lg shadow-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={!logoUrl}
            onClick={handleAddToCart}
          >
            Add to Cart
            <ShoppingCart className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};


// --- ProductReviews Component ---
interface ProductReviewsProps {
  productId: number;
  reviews: Review[];
  onAddReview: (productId: number, reviewData: Omit<Review, 'id' | 'date'>) => void;
  onToast: (toast: Omit<ToastType, 'id'>) => void;
}
const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, reviews, onAddReview, onToast }) => {
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
    onToast({ message: "Review submitted! Thank you for your feedback.", type: 'success' });
    setUsername('');
    setRating(0);
    setComment('');
  };

  return (
    <div className="p-5 border-t border-slate-200 dark:border-slate-700 space-y-6">
      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 text-lg flex items-center gap-2"><BookmarkCheck size={18} className="text-amber-500"/> Leave a Review</h4>
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
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-slate-800 text-sm shadow-sm"
              />
            </div>
            <div className="flex items-center justify-start sm:justify-end">
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
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-slate-800 text-sm shadow-sm"
            ></textarea>
          </div>
          {formError && <p className="text-sm text-red-500 flex items-center gap-1"><XCircle size={16}/>{formError}</p>}
          <button type="submit" className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-amber-500 border border-transparent rounded-lg shadow-md hover:bg-amber-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
            Submit Review <Send size={14} className="ml-2" />
          </button>
        </form>
      </div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-xl">{reviews.length} Customer Review{reviews.length !== 1 && 's'}</h4>
          {reviews.length > 1 && (
            <div className="flex items-center space-x-2">
              <label htmlFor={`sort-reviews-${productId}`} className="text-sm font-medium text-slate-600 dark:text-slate-400 sr-only sm:not-sr-only">
                <ArrowUpDown className="w-4 h-4 inline mr-1.5 hidden sm:inline" />
                Sort:
              </label>
              <select
                id={`sort-reviews-${productId}`}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="block pl-2 pr-8 py-1 text-sm border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-amber-500 focus:border-amber-500 rounded-lg bg-white dark:bg-slate-800 shadow-sm"
              >
                <option value="date-desc">Newest</option>
                <option value="rating-desc">Highest Rating</option>
                <option value="rating-asc">Lowest Rating</option>
              </select>
            </div>
          )}
        </div>
        <div className="space-y-6">
          {sortedReviews.length > 0 ? (
            sortedReviews.map(review => (
              <div key={review.id} className="flex items-start space-x-4 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{review.username}</p>
                      <StarRating rating={review.rating} size={14} />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{review.comment}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                <Info size={24} className="w-10 h-10 mx-auto text-slate-400 mb-2"/>
                <p className="text-sm text-slate-500 dark:text-slate-400">No reviews yet. Share your experience!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// --- EmailQuoteModal Component (Completed) ---
interface EmailQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailContent: EmailContent | null;
  onToast: (toast: Omit<ToastType, 'id'>) => void;
}
const EmailQuoteModal: React.FC<EmailQuoteModalProps> = ({ isOpen, onClose, emailContent, onToast }) => {
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
    // Format the entire email for easy pasting
    const emailBodyForKlaviyo = `Subject: ${subject}\n\nTo: ${recipient || '[Insert Recipient Email]'}\n\n${body}`;
    
    // Fallback for clipboard access
    const tempElement = document.createElement('textarea');
    tempElement.value = emailBodyForKlaviyo;
    document.body.appendChild(tempElement);
    tempElement.select();
    document.execCommand('copy');
    document.body.removeChild(tempElement);
    
    setCopied(true);
    onToast({ message: "Email copied to clipboard!", type: 'info' });
    setTimeout(() => setCopied(false), 2000);
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
        className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl m-4 overflow-hidden flex flex-col max-h-[90vh] transform transition-all scale-100 opacity-100"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2" id="modal-title">
            <Mail className="w-5 h-5 text-amber-500"/> Generated Email Draft
          </h2>
          <button
            type="button"
            className="text-slate-400 bg-transparent hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-600 dark:hover:text-white rounded-lg text-sm p-1.5 ml-auto inline-flex items-center transition-colors"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className='bg-amber-50 dark:bg-slate-700/50 p-3 rounded-lg flex items-center text-sm text-slate-700 dark:text-slate-300 border border-amber-200 dark:border-slate-600'>
              <Info size={16} className='flex-shrink-0 text-amber-600 mr-2'/>
              This draft summarizes your chat. Use the "Send Email" button to open your mail app.
          </div>
          <div>
            <label htmlFor="recipient-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Recipient Email (Optional, for mail app link)
            </label>
            <input
              type="email"
              id="recipient-email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="sales@melotwo.com"
              className="block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200 p-2.5"
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
              className="block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 p-2.5"
            />
          </div>
          <div>
            <label htmlFor="email-body" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Body
            </label>
            <textarea
              id="email-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className="block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 p-2.5 resize-none font-mono text-xs"
            ></textarea>
          </div>
        </div>
        <div className="flex items-center justify-end p-5 border-t border-slate-200 dark:border-slate-700 space-x-3">
          <button
            type="button"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300"
            onClick={handleCopyToClipboard}
          >
            {copied ? <Check size={16} className='mr-2' /> : <Copy size={16} className='mr-2' />}
            {copied ? 'Copied!' : 'Copy Text'}
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-amber-500 border border-transparent rounded-lg shadow-md hover:bg-amber-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            onClick={handleSendMail}
          >
            Send Email <Send size={16} className='ml-2' />
          </button>
        </div>
      </div>
    </div>
  );
};


// --- Toast Component ---
interface ToastProps {
  toast: ToastType;
  onClose: (id: string) => void;
}
const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const Icon = useMemo(() => {
    switch (toast.type) {
      case 'success': return CheckCircle;
      case 'error': return XCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      default: return Info;
    }
  }, [toast.type]);

  const colorClass = useMemo(() => {
    switch (toast.type) {
      case 'success': return 'bg-green-500 text-white';
      case 'error': return 'bg-red-500 text-white';
      case 'warning': return 'bg-yellow-500 text-slate-900';
      case 'info': return 'bg-sky-500 text-white';
      default: return 'bg-slate-600 text-white';
    }
  }, [toast.type]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <div className={`p-4 rounded-lg shadow-lg flex items-center justify-between w-full max-w-sm transition-all duration-300 ease-out transform translate-y-0 ${colorClass}`}>
      <div className="flex items-center space-x-3">
        <Icon size={20} className="flex-shrink-0" />
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
      <button onClick={() => onClose(toast.id)} className="p-1 rounded-full hover:bg-black/10 transition-colors" aria-label="Close notification">
        <X size={16} />
      </button>
    </div>
  );
};


// --- App Component (Main) ---
const App: React.FC = () => {
  const [firestoreState, setFirestoreState] = useState<FirestoreState>({
    db: null,
    auth: null,
    userId: null,
    isAuthReady: false,
  });
  const { db: firestoreDb, userId, isAuthReady } = firestoreState;

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [view, setView] = useState<'store' | 'chat'>('store'); // store view is default
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [emailQuoteModalOpen, setEmailQuoteModalOpen] = useState(false);
  const [emailDraft, setEmailDraft] = useState<EmailContent | null>(null);
  const [customizationModalProduct, setCustomizationModalProduct] = useState<Product | null>(null);
  const [toasts, setToasts] = useState<ToastType[]>([]);

  // Refs for auto-scrolling
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Firestore & Auth Setup ---
  useEffect(() => {
    if (!app || !auth || !db) {
      setFirestoreState(s => ({ ...s, isAuthReady: true }));
      console.error("Firebase is not configured or failed to initialize.");
      return;
    }

    const signInAndListen = async () => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Firebase Auth Error:", error);
      }
    };

    signInAndListen();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      const currentUserId = user ? user.uid : crypto.randomUUID();
      setFirestoreState({ db, auth, userId: currentUserId, isAuthReady: true });
      console.log(`User ID set: ${currentUserId}`);
    });

    return () => unsubscribeAuth();
  }, []); // Run only once for initialization

  // --- Firestore Chat/Review Listeners ---
  useEffect(() => {
    if (!firestoreDb || !userId) return;

    // 1. Chat History Listener (Private Data)
    const chatQuery = query(
      collection(firestoreDb, getUserCollectionPath(userId)),
      'chatHistory',
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribeChat = onSnapshot(chatQuery, (snapshot) => {
      const messages: ChatMessage[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          role: data.role || 'model',
          text: data.text || '',
          sources: data.sources || [],
          rating: data.rating || null,
        } as ChatMessage;
      });
      setChatHistory([
        { id: 'initial', role: 'model', text: `Hello! I'm Melotwo AI, your assistant for SABS-certified PPE. How can I help you ensure workplace safety today?`, sources: [] },
        ...messages
      ]);
    }, (error) => {
      console.error("Error fetching chat history:", error);
    });

    // 2. Reviews Listener (Public Data)
    const publicReviewsPath = getPublicReviewsCollectionPath();
    const unsubscribeReviews = onSnapshot(collection(firestoreDb, publicReviewsPath), (snapshot) => {
      const allReviews: Review[] = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        allReviews.push({
          id: doc.id,
          username: data.username,
          rating: data.rating,
          comment: data.comment,
          date: data.date.toDate().toISOString(),
          productId: data.productId, // Used for merging below
        } as Review & { productId: number });
      });

      setProducts(prevProducts => prevProducts.map(product => {
        const productReviews = allReviews.filter(review => review.productId === product.id);
        return { ...product, reviews: productReviews };
      }));
    }, (error) => {
        console.error("Error fetching reviews:", error);
    });


    return () => {
      unsubscribeChat();
      unsubscribeReviews();
    };
  }, [firestoreDb, userId]);


  // --- Data Fetching (Product Images & Prices) ---
  useEffect(() => {
    const loadProductDetails = async () => {
      const updatedProducts = await Promise.all(INITIAL_PRODUCTS.map(async (p) => {
        if (!p.isLoading) return p;
        
        try {
          const { price, imageUrl } = await fetchProductDetails(p.name, p.description);
          
          const finalImageUrl = imageUrl || FALLBACK_IMAGE_URL(`No Image: ${p.name}`);
          const finalPrice = price || p.price; // Keep hardcoded price if fetch fails
          
          return {
            ...p,
            price: finalPrice,
            imageUrl: finalImageUrl,
            isLoading: false,
          };
        } catch (error) {
          console.error(`Failed to load details for ${p.name}:`, error);
          return {
            ...p,
            imageUrl: FALLBACK_IMAGE_URL(`Error: ${p.name}`),
            isLoading: false,
          };
        }
      }));
      setProducts(updatedProducts);
    };

    if (products.some(p => p.isLoading)) {
      loadProductDetails();
    }
  }, []);


  // --- Chat Logic ---
  const handleSendMessage = useCallback(async () => {
    if (!currentQuery.trim() || isLoading || !firestoreDb || !userId) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: currentQuery.trim(),
    };
    
    setCurrentQuery('');
    setIsLoading(true);
    
    try {
      // 1. Save User message to Firestore
      await addDoc(collection(firestoreDb, getUserCollectionPath(userId), 'chatHistory'), {
        ...userMessage,
        timestamp: serverTimestamp(),
      });

      // 2. Get AI Response
      // Get location (using dummy data for simplicity in this environment)
      const location = { latitude: -25.7479, longitude: 28.2293 }; // Pretoria, SA
      const response = await getAiBotResponse(userMessage.text, chatHistory, location);
      
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        text: response.text,
        sources: response.sources,
      };

      // 3. Save AI response to Firestore
      await addDoc(collection(firestoreDb, getUserCollectionPath(userId), 'chatHistory'), {
        ...aiMessage,
        timestamp: serverTimestamp(),
      });

    } catch (e) {
      console.error("Chat error:", e);
      setToasts(prev => [...prev, { id: crypto.randomUUID(), message: "Failed to send message. Please try again.", type: 'error' }]);
    } finally {
      setIsLoading(false);
    }
  }, [currentQuery, isLoading, firestoreDb, userId, chatHistory]);

  const handleRating = async (messageId: string, currentRating: 'up' | 'down' | null) => {
    if (!firestoreDb || !userId) return;

    const currentMessage = chatHistory.find(msg => msg.id === messageId);
    if (!currentMessage) return;

    const newRating = currentRating === 'up' ? 'down' : (currentRating === 'down' ? null : 'up');
    
    try {
      await setDoc(doc(firestoreDb, getUserCollectionPath(userId), 'chatHistory', messageId), {
        rating: newRating,
      }, { merge: true });
      setToasts(prev => [...prev, { id: crypto.randomUUID(), message: `Feedback recorded: ${newRating ? newRating : 'cleared'}!`, type: 'info' }]);

    } catch (error) {
      console.error("Error updating rating:", error);
    }
  };

  const handleClearChat = async () => {
    if (!firestoreDb || !userId) return;
    try {
      const collectionRef = collection(firestoreDb, getUserCollectionPath(userId), 'chatHistory');
      const q = query(collectionRef);
      const snapshot = await getDocs(q);
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      setToasts(prev => [...prev, { id: crypto.randomUUID(), message: "Chat history cleared successfully.", type: 'success' }]);
    } catch (error) {
      console.error("Error clearing chat:", error);
      setToasts(prev => [...prev, { id: crypto.randomUUID(), message: "Failed to clear chat.", type: 'error' }]);
    }
  };

  // --- Review Logic ---
  const handleAddReview = async (productId: number, reviewData: Omit<Review, 'id' | 'date'>) => {
    if (!firestoreDb || !userId) {
        setToasts(prev => [...prev, { id: crypto.randomUUID(), message: "Login required to submit review.", type: 'error' }]);
        return;
    }

    try {
        await addDoc(collection(firestoreDb, getPublicReviewsCollectionPath()), {
            ...reviewData,
            productId,
            userId: userId, // Record which user made the review
            date: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error adding review:", error);
        setToasts(prev => [...prev, { id: crypto.randomUUID(), message: "Review submission failed.", type: 'error' }]);
    }
  };


  // --- Utility Handlers ---
  const filteredProducts = useMemo(() => {
    let list = products;
    
    if (selectedCategory) {
      list = list.filter(p => p.category === selectedCategory);
    }
    
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower) ||
        p.sabsStandard?.toLowerCase().includes(searchLower)
      );
    }

    return list;
  }, [products, selectedCategory, searchQuery]);
  
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
    document.documentElement.classList.toggle('dark');
  };

  const handleGenerateEmail = async () => {
    setEmailQuoteModalOpen(true);
    const draft = await generateEmailDraft(chatHistory);
    setEmailDraft(draft);
  }

  const handleAddToast = (toast: Omit<ToastType, 'id'>) => {
    setToasts(prev => [...prev, { id: crypto.randomUUID(), ...toast }]);
  };


  // --- Render Components ---

  const renderProductCard = (product: Product) => {
    const averageRating = product.reviews && product.reviews.length > 0
      ? (product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length)
      : 0;

    return (
      <div key={product.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-slate-100 dark:border-slate-700">
        <div className="relative h-48 bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
          {product.isLoading ? (
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          ) : (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE_URL(product.name) }}
            />
          )}
          {product.sabsCertified && (
            <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <ShieldCheck size={12}/> SABS
            </div>
          )}
          {product.isPrintable && (
            <div className="absolute bottom-3 right-3 bg-blue-500/80 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 backdrop-blur-sm">
              <Printer size={12}/> Customizable
            </div>
          )}
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">{product.category}</p>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{product.name}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{product.description}</p>
          
          <div className="flex items-center space-x-2 text-sm mb-4">
            <StarRating rating={averageRating} size={14} />
            <span className="text-slate-700 dark:text-slate-300 font-semibold">{averageRating.toFixed(1)}</span>
            <span className="text-slate-500 dark:text-slate-400">({product.reviews?.length || 0} reviews)</span>
          </div>

          <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                    {product.price ? `R${product.price.toFixed(2)}` : 'R--.--'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Scale size={14} /> SABS: {product.sabsStandard || 'N/A'}
                </span>
            </div>
            <div className="flex space-x-2">
              <button 
                className="flex-1 inline-flex items-center justify-center py-2 text-sm font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => product.isPrintable ? setCustomizationModalProduct(product) : window.open(product.affiliateUrl, '_blank')}
                disabled={product.isLoading}
                style={{ 
                    backgroundColor: product.isPrintable ? '#3B82F6' : '#F59E0B', 
                    color: 'white',
                    hover: { backgroundColor: product.isPrintable ? '#2563EB' : '#D97706' }
                }}
              >
                {product.isPrintable ? (
                    <>Customize <Printer size={16} className="ml-2"/></>
                ) : (
                    <>Order Now <ShoppingCart size={16} className="ml-2"/></>
                )}
              </button>
            </div>
          </div>
          
          {/* Detailed Review Section - Toggled Visibility */}
          <details className="mt-3">
              <summary className="text-sm text-amber-600 dark:text-amber-400 font-medium cursor-pointer hover:underline flex items-center justify-between">
                View Reviews ({product.reviews?.length || 0}) <ChevronRight size={16} className="transition-transform duration-300 group-open:rotate-90"/>
              </summary>
              <ProductReviews 
                  productId={product.id} 
                  reviews={product.reviews || []} 
                  onAddReview={handleAddReview} 
                  onToast={handleAddToast}
              />
          </details>
        </div>
      </div>
    );
  };

  const renderChatView = () => (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-inner">
      <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Bot className="w-5 h-5 text-amber-500"/> Melotwo AI Assistant
        </h2>
        <div className='flex items-center space-x-3'>
            <button 
                onClick={handleGenerateEmail}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors tooltip relative group"
                aria-label="Generate Email Draft"
                disabled={chatHistory.length <= 1}
            >
                <Mail size={20} />
                <span className="tooltip-text absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-slate-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    Generate Quote Email
                </span>
            </button>
            <button 
                onClick={handleClearChat}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors tooltip relative group"
                aria-label="Clear Chat History"
            >
                <History size={20} />
                <span className="tooltip-text absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-slate-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    Clear History
                </span>
            </button>
        </div>
      </header>

      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {chatHistory.map(message => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3/4 p-3 rounded-xl shadow-md ${message.role === 'user' 
              ? 'bg-amber-500 text-white rounded-br-none' 
              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'
            }`}>
              <div className="flex items-center font-semibold mb-1 text-xs">
                {message.role === 'user' ? <User size={14} className='mr-1'/> : <Bot size={14} className='mr-1 text-amber-500'/>}
                {message.role === 'user' ? 'You' : 'Melotwo AI'}
              </div>
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              
              {message.role === 'model' && message.sources && message.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Sources:</h4>
                  <ul className="space-y-1">
                    {message.sources.map((source, index) => (
                      <li key={index} className="text-xs">
                        <Link size={10} className="inline mr-1 text-slate-500 dark:text-slate-400"/>
                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 hover:underline">
                          {source.title.substring(0, 50)}...
                        </a>
                      </li>
                    ))}
                  </ul>
                  <div className='flex items-center justify-end mt-2 space-x-2'>
                    <button 
                      onClick={() => handleRating(message.id, message.rating)}
                      className={`p-1 rounded-full transition-colors ${message.rating === 'up' ? 'bg-green-500 text-white' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                      aria-label="Thumbs Up"
                    >
                      <ThumbsUp size={16} />
                    </button>
                    <button 
                      onClick={() => handleRating(message.id, message.rating)}
                      className={`p-1 rounded-full transition-colors ${message.rating === 'down' ? 'bg-red-500 text-white' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                      aria-label="Thumbs Down"
                    >
                      <ThumbsDown size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-3/4 p-3 rounded-xl rounded-tl-none bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700">
              <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
        <div className="flex space-x-3">
          <textarea
            value={currentQuery}
            onChange={(e) => setCurrentQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about SABS standards, product specs, or safety tips..."
            className="flex-grow p-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-amber-500 focus:border-amber-500 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200 resize-none h-12 overflow-hidden"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !currentQuery.trim()}
            className="flex-shrink-0 w-12 h-12 inline-flex items-center justify-center rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed shadow-md"
            aria-label="Send Message"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send size={20} />}
          </button>
        </div>
        {userId && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-right">
                User: <span className='font-mono'>{userId.substring(0, 8)}...</span>
            </p>
        )}
      </div>
      
      {emailQuoteModalOpen && (
        <EmailQuoteModal
          isOpen={emailQuoteModalOpen}
          onClose={() => setEmailQuoteModalOpen(false)}
          emailContent={emailDraft}
          onToast={handleAddToast}
        />
      )}
    </div>
  );

  const renderStoreView = () => (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-slate-50 dark:bg-slate-900 min-h-full">
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <div className="flex-grow relative">
          <input
            type="text"
            placeholder="Search products by name, SABS standard, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-10 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
          />
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
        </div>
        <div className="flex-shrink-0">
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="w-full md:w-auto p-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm appearance-none pr-10"
          >
            <option value="">All Categories</option>
            {PRODUCT_CATEGORIES.map(cat => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 border-b border-amber-500 pb-2">
        {selectedCategory || 'All'} Safety Products ({filteredProducts.length})
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(renderProductCard)
        ) : (
          <div className="col-span-full text-center py-12 bg-white dark:bg-slate-800 rounded-xl shadow-lg border-4 border-dashed border-slate-300 dark:border-slate-700">
            <SearchX size={48} className="mx-auto text-slate-400 mb-4"/>
            <p className="text-xl font-semibold text-slate-600 dark:text-slate-300">No matching products found.</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Try adjusting your search or filter settings.</p>
          </div>
        )}
      </div>

      {/* Customization Modal */}
      {customizationModalProduct && (
        <CustomizationModal
          isOpen={!!customizationModalProduct}
          onClose={() => setCustomizationModalProduct(null)}
          product={customizationModalProduct}
          onToast={handleAddToast}
        />
      )}
    </div>
  );

  return (
    <div className={`h-screen w-full flex flex-col ${isDarkMode ? 'dark' : ''} bg-slate-100 dark:bg-slate-950 font-sans`}>
      
      {/* Header / Navigation */}
      <header className="flex-shrink-0 bg-white dark:bg-slate-900 shadow-md border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center">
              <ShieldCheck className="w-6 h-6 text-amber-500 mr-2"/> Melotwo Safety
            </h1>
            <nav className='hidden sm:flex space-x-4'>
              <button 
                onClick={() => setView('store')} 
                className={`py-1 px-3 text-sm font-semibold rounded-full transition-colors ${view === 'store' ? 'bg-amber-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                Store
              </button>
              <button 
                onClick={() => setView('chat')} 
                className={`py-1 px-3 text-sm font-semibold rounded-full transition-colors ${view === 'chat' ? 'bg-amber-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                AI Assistant
              </button>
            </nav>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="User Profile"
            >
              <UserCircle size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow overflow-hidden flex">
        <div className={`flex-grow overflow-y-auto ${view === 'store' ? 'block' : 'hidden md:block'}`}>
          {renderStoreView()}
        </div>
        
        <div className={`w-full md:w-96 flex-shrink-0 ${view === 'chat' ? 'block' : 'hidden md:block'}`}>
          {renderChatView()}
        </div>
        
        {/* Mobile View Toggle */}
        <div className='fixed bottom-4 right-4 sm:hidden z-40'>
            <button
                onClick={() => setView(view === 'store' ? 'chat' : 'store')}
                className='p-4 rounded-full bg-amber-500 text-white shadow-xl flex items-center space-x-2 transition-transform hover:scale-105'
            >
                {view === 'store' ? (
                    <>
                        <Bot size={24} /> 
                        <span className='font-semibold'>Chat</span>
                    </>
                ) : (
                    <>
                        <ShoppingCart size={24} /> 
                        <span className='font-semibold'>Store</span>
                    </>
                )}
            </button>
        </div>
      </main>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-[70] space-y-3">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} />
        ))}
      </div>
    </div>
  );
};

export default App;
