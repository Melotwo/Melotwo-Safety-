
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';

// Icon imports from lucide-react, used across various components
import { 
  ShieldCheck, Sun, Moon, SearchX, ArrowUpDown, HardHat, Hand, Footprints, 
  Shield, Eye, Ear, Shirt, Mail, Loader2, CheckCircle, MessageSquare, X, Send, 
  Bot, User, Link, ThumbsUp, ThumbsDown, Check, ShoppingCart, 
  Star, Minus, Plus, Printer, Share2, Copy, Twitter, Facebook, Linkedin, Scale, 
  Tag, BookmarkCheck, UploadCloud, Trash2, AlertTriangle, Info, XCircle, UserCircle,
  Search, SlidersHorizontal, Trash
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
  
// The Gemini service functions have been inlined here to resolve the build error.
import { GoogleGenAI, Type } from "@google/genai";


// ========= TYPES INLINED TO FIX BUILD ERROR =========
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
  imageUrl: string;
  affiliateUrl: string;
  price?: number;
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


// ========= GEMINI SERVICE INLINED TO FIX BUILD ERROR =========

// Helper function to initialize AI and handle potential runtime errors.
const getAiClient = () => {
  try {
    if (typeof process === 'undefined' || !process.env || !process.env.API_KEY) {
      throw new Error("API Key environment variable not found at runtime.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  } catch (e) {
    console.error("AI Initialization Error: ", e);
    return null;
  }
};

const getAiBotResponse = async (query: string, location: { latitude: number; longitude: number; } | null): Promise<{ text: string; sources: Source[] }> => {
  const ai = getAiClient();
  if (!ai) {
    return { text: "I'm sorry, but the AI assistant is currently unavailable due to a configuration issue. Please try again later.", sources: [] };
  }
  
  const tools: any[] = [{ googleSearch: {} }, { googleMaps: {} }];
  const toolConfig: any = location ? {
      retrievalConfig: {
        latLng: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      },
  } : undefined;
  
  const systemInstruction = `You are Melotwo AI, a friendly and knowledgeable assistant for a Personal Protective Equipment (PPE) supplier named Melotwo.
Your expertise is in South African Bureau of Standards (SABS) for mining and industrial safety equipment.
When asked for product recommendations, refer to the products available on the Melotwo website.
When asked about nearby locations or services, use the provided user location.
Keep your answers concise, helpful, and professional.`;

  try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
        config: {
          tools,
          ...(toolConfig && { toolConfig }),
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
        if (chunk.maps && chunk.maps.uri && chunk.maps.title) {
            sources.push({ title: chunk.maps.title, uri: chunk.maps.uri });
        }
      });

      return { text, sources: sources.filter(s => s.uri && s.title) };
  } catch(e) {
      console.error(e);
      return { text: "Sorry, I'm having trouble connecting right now. Please try again later.", sources: [] };
  }
};

const generateEmailDraft = async (messages: ChatMessage[]): Promise<EmailContent | null> => {
    const conversationHistory = messages
        .filter(msg => msg.id !== 'initial')
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

// ========= CONSTANTS INLINED TO FIX BUILD ERROR =========
const PRODUCT_CATEGORIES: ProductCategory[] = [
  { name: 'Head Protection', description: 'Helmets and hard hats for construction and mining.', icon: HardHat },
  { name: 'Hand Protection', description: 'Gloves for various industrial applications.', icon: Hand },
  { name: 'Foot Protection', description: 'Safety boots and shoes with reinforced toes.', icon: Footprints },
  { name: 'Fall Protection', description: 'Harnesses, lanyards, and fall arrest systems.', icon: Shield },
  { name: 'Eye Protection', description: 'Goggles and safety glasses for all environments.', icon: Eye },
  { name: 'Hearing Protection', description: 'Earmuffs and earplugs to prevent hearing loss.', icon: Ear },
  { name: 'Workwear', description: 'Durable and customizable clothing for the workplace.', icon: Shirt },
];

const PRODUCTS: Product[] = [
  { id: 1, name: 'Industrial Hard Hat V-Gard', category: 'Head Protection', sabsCertified: true, sabsStandard: 'SABS 1397', description: 'A durable and comfortable hard hat with a high-density polyethylene shell. Meets SABS 1397 standards.', imageUrl: 'https://images.unsplash.com/photo-1581092570089-c45a27a5a87e?q=80&w=800&auto=format&fit=crop', affiliateUrl: '#', price: 350.00, isPrintable: true, reviews: [ { id: 'review-1-1', username: 'Safety Steve', rating: 5, comment: 'Excellent hard hat. Comfortable for all-day wear and feels very sturdy. The SABS certification gives me peace of mind.', date: '2023-10-26T10:00:00Z', }, { id: 'review-1-2', username: 'Procurement Pro', rating: 4, comment: 'Good value for a certified helmet. The team likes them. Docking one star because the color options were limited.', date: '2023-09-15T14:30:00Z', }, ], },
  { id: 2, name: 'Leather Work Gloves', category: 'Hand Protection', sabsCertified: true, sabsStandard: 'SABS EN388', description: 'Reinforced leather gloves for heavy-duty tasks. SABS certified for abrasion resistance.', imageUrl: 'https://images.unsplash.com/photo-1620993369420-5312f38d39e3?q=80&w=800&auto=format&fit=crop', affiliateUrl: '#', price: 120.50, reviews: [], },
  { id: 3, name: 'Steel-Toe Safety Boots', category: 'Foot Protection', sabsCertified: true, sabsStandard: 'SABS 20345', description: 'Anti-slip, oil-resistant sole with steel toe cap protection. SABS 20345 compliant.', imageUrl: 'https://images.unsplash.com/photo-1628755712093-02051a81213f?q=80&w=800&auto=format&fit=crop', affiliateUrl: '#', price: 899.99, reviews: [ { id: 'review-3-1', username: 'Mark C.', rating: 5, comment: 'Best boots I\'ve owned. They survived a full year on the site with no issues. Waterproof and comfortable.', date: '2023-11-01T08:00:00Z', }, ] },
  { id: 4, name: 'Full Body Safety Harness', category: 'Fall Protection', sabsCertified: true, sabsStandard: 'SABS 50361', description: '5-point adjustment harness for maximum safety during work at height. Complies with SABS 50361.', imageUrl: 'https://images.unsplash.com/photo-1552121332-9c3a3782b78a?q=80&w=800&auto=format&fit=crop', affiliateUrl: '#', price: 1500.00, reviews: [], },
  { id: 5, name: 'Anti-Fog Safety Goggles', category: 'Eye Protection', sabsCertified: true, sabsStandard: 'SABS 166', description: 'Ventilated, anti-fog, and scratch-resistant goggles for full eye protection. SABS 166 certified.', imageUrl: 'https://images.unsplash.com/photo-1608323223631-a8315a6f4438?q=80&w=800&auto=format&fit=crop', affiliateUrl: '#', price: 250.00, reviews: [], },
  { id: 6, name: 'High-Performance Earmuffs', category: 'Hearing Protection', sabsCertified: false, description: 'Comfortable earmuffs with a high Noise Reduction Rating (NRR) of 31dB.', imageUrl: 'https://images.unsplash.com/photo-1618342468252-87a3d31006d8?q=80&w=800&auto=format&fit=crop', affiliateUrl: '#', price: 450.75, reviews: [], },
  { id: 7, name: 'Reflective Mining Helmet', category: 'Head Protection', sabsCertified: true, sabsStandard: 'SABS 1397', description: 'Specialized helmet for mining with high visibility reflective strips and lamp bracket. SABS 1397.', imageUrl: 'https://images.unsplash.com/photo-1620635489839-93f8736a4f49?q=80&w=800&auto=format&fit=crop', affiliateUrl: '#', price: 420.00, reviews: [], },
  { id: 8, name: 'Cut-Resistant Gloves', category: 'Hand Protection', sabsCertified: true, sabsStandard: 'SABS EN388', description: 'Level 5 cut resistance for handling sharp materials. Meets SABS EN388 standards.', imageUrl: 'https://images.unsplash.com/photo-1590779031853-3375865a70eb?q=80&w=800&auto=format&fit=crop', affiliateUrl: '#', price: 180.00, reviews: [], },
  { id: 9, name: 'High-Visibility Safety Vest', category: 'Workwear', sabsCertified: true, sabsStandard: 'SANS 434', description: 'Bright, reflective safety vest for maximum visibility. Available for custom logo printing.', imageUrl: 'https://images.unsplash.com/photo-1571434221972-383a1a586a16?q=80&w=800&auto=format&fit=crop', affiliateUrl: '#', price: 280.00, isPrintable: true, reviews: [], },
  { id: 10, name: 'Branded Cotton Work Shirt', category: 'Workwear', sabsCertified: false, description: 'Comfortable and durable 100% cotton work shirt. Perfect for adding your company logo.', imageUrl: 'https://images.unsplash.com/photo-1598032895397-b9472444bf20?q=80&w=800&auto=format&fit=crop', affiliateUrl: '#', price: 320.50, isPrintable: true, reviews: [], }
];

const SABS_STANDARD_DETAILS: { [key: string]: string } = {
  'SABS 1397': 'Specifies requirements for industrial safety helmets to protect the head from falling objects and electrical hazards.', 'SABS EN388': 'Covers the requirements, test methods, marking, and information for protective gloves against mechanical risks like abrasion and cuts.', 'SABS 20345': 'Details the basic and additional requirements for safety footwear, including features like toe protection and slip resistance.', 'SABS 50361': 'Pertains to full body harnesses used in fall arrest systems, outlining design, performance, and testing requirements for working at height.', 'SABS 166': 'Specifies the requirements for personal eye-protectors, including optical quality, strength, and resistance to various hazards.', 'SANS 434': 'Relates to high-visibility warning clothing, ensuring wearers are conspicuous in hazardous situations under any light conditions.',
};

// ========= ALL COMPONENT DEFINITIONS START =========

// --- From components/StarRating.tsx ---
const StarRating: React.FC<{ rating: number; totalStars?: number; onRatingChange?: (rating: number) => void; size?: number; className?: string; }> = ({ rating, totalStars = 5, onRatingChange, size = 16, className = '', }) => ( <div className={`flex items-center space-x-0.5 ${className}`}> {[...Array(totalStars)].map((_, index) => { const starValue = index + 1; return ( <button key={starValue} type="button" disabled={!onRatingChange} onClick={() => onRatingChange && onRatingChange(starValue)} className={`transition-colors ${onRatingChange ? 'cursor-pointer' : ''}`} aria-label={`Rate ${starValue} out of ${totalStars} stars`}> <Star size={size} className={` ${starValue <= rating ? 'text-amber-400 fill-current' : 'text-slate-300 dark:text-slate-600'} ${onRatingChange ? 'hover:text-amber-300' : ''} `} /> </button> ); })} </div> );

// --- From components/CustomizationModal.tsx ---
const CustomizationModal: React.FC<{ isOpen: boolean; onClose: () => void; product: Product; }> = ({ isOpen, onClose, product }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null); const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { return () => { if (logoUrl) URL.revokeObjectURL(logoUrl); }; }, [logoUrl]);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) { if (logoUrl) URL.revokeObjectURL(logoUrl); setLogoUrl(URL.createObjectURL(file)); } };
  const handleRemoveLogo = () => { if (logoUrl) URL.revokeObjectURL(logoUrl); setLogoUrl(null); if (fileInputRef.current) fileInputRef.current.value = ""; };
  if (!isOpen) return null;
  return ( <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" aria-labelledby="modal-title" role="dialog" aria-modal="true" onClick={onClose}> <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg m-4 overflow-hidden" onClick={e => e.stopPropagation()}> <div className="flex items-start justify-between p-5 border-b border-slate-200 dark:border-slate-700"> <div className="text-lg font-semibold text-slate-900 dark:text-slate-100" id="modal-title"> Customize: <span className="font-bold">{product.name}</span> </div> <button type="button" className="text-slate-400 bg-transparent hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-600 dark:hover:text-white rounded-lg text-sm p-1.5 ml-auto inline-flex items-center" onClick={onClose} aria-label="Close modal"> <X size={20} /> </button> </div> <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6"> <div className="space-y-4"> <h3 className="font-semibold text-slate-700 dark:text-slate-300">Preview</h3> <div className="relative w-full aspect-square bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden"> <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> {logoUrl && ( <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 flex items-center justify-center p-2"> <img src={logoUrl} alt="Custom logo preview" className="max-w-full max-h-full object-contain" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }} /> </div> )} </div> </div> <div className="space-y-4 flex flex-col justify-center"> <h3 className="font-semibold text-slate-700 dark:text-slate-300">Your Logo</h3> <div className="flex flex-col items-center justify-center w-full"> <label htmlFor="logo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:hover:bg-bray-800 dark:bg-slate-700 hover:bg-slate-100 dark:hover:border-slate-500 dark:hover:bg-slate-600 transition-colors"> <div className="flex flex-col items-center justify-center pt-5 pb-6"> <UploadCloud className="w-8 h-8 mb-3 text-slate-500 dark:text-slate-400"/> <p className="mb-2 text-sm text-slate-500 dark:text-slate-400 text-center"><span className="font-semibold">Click to upload</span> or drag and drop</p> <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG, SVG (MAX. 5MB)</p> </div> <input id="logo-upload" ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} /> </label> </div> {logoUrl && ( <button onClick={handleRemoveLogo} className="w-full flex items-center justify-center gap-2 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md py-2 transition-colors"> <Trash2 size={16}/> Remove Logo </button> )} </div> </div> <div className="flex items-center justify-end p-5 border-t border-slate-200 dark:border-slate-700 space-x-3"> <button type="button" className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 focus:ring-4 focus:outline-none focus:ring-slate-300 dark:focus:ring-slate-500" onClick={onClose}> Cancel </button> <button type="button" className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-amber-500 border border-transparent rounded-lg shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!logoUrl}> Add to Cart <ShoppingCart className="w-4 h-4 ml-2" /> </button> </div> </div> </div> );
};

// --- From components/ProductReviews.tsx ---
const ProductReviews: React.FC<{ productId: number; reviews: Review[]; onAddReview: (productId: number, reviewData: Omit<Review, 'id' | 'date'>) => void; }> = ({ productId, reviews, onAddReview }) => {
  const [username, setUsername] = useState(''); const [rating, setRating] = useState(0); const [comment, setComment] = useState(''); const [sortBy, setSortBy] = useState<'date-desc' | 'rating-desc' | 'rating-asc'>('date-desc'); const [formError, setFormError] = useState('');
  const sortedReviews = useMemo(() => { const sorted = [...reviews]; switch (sortBy) { case 'rating-desc': return sorted.sort((a, b) => b.rating - a.rating); case 'rating-asc': return sorted.sort((a, b) => a.rating - b.rating); case 'date-desc': default: return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); } }, [reviews, sortBy]);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!username.trim() || rating === 0 || !comment.trim()) { setFormError('Please fill in all fields and provide a rating.'); return; } setFormError(''); onAddReview(productId, { username, rating, comment }); setUsername(''); setRating(0); setComment(''); };
  return ( <div className="p-5 border-t border-slate-200 dark:border-slate-700 space-y-6"> <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg"> <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Leave a Review</h4> <form onSubmit={handleSubmit} className="space-y-4"> <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> <div> <label htmlFor={`username-${productId}`} className="sr-only">Username</label> <input id={`username-${productId}`} type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your Name" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-amber-500 bg-white dark:bg-slate-800 text-sm" /> </div> <div className="flex items-center"> <span className="text-sm text-slate-600 dark:text-slate-400 mr-3">Your Rating:</span> <StarRating rating={rating} onRatingChange={setRating} size={20} /> </div> </div> <div> <label htmlFor={`comment-${productId}`} className="sr-only">Comment</label> <textarea id={`comment-${productId}`} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your thoughts on this product..." rows={3} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-amber-500 bg-white dark:bg-slate-800 text-sm" ></textarea> </div> {formError && <p className="text-sm text-red-500">{formError}</p>} <button type="submit" className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-amber-500 border border-transparent rounded-md shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"> Submit Review <Send size={14} className="ml-2" /> </button> </form> </div> <div> <div className="flex justify-between items-center mb-4"> <h4 className="font-semibold text-slate-800 dark:text-slate-200">{reviews.length} Review{reviews.length !== 1 && 's'}</h4> {reviews.length > 1 && ( <div className="flex items-center space-x-2"> <label htmlFor={`sort-reviews-${productId}`} className="text-sm font-medium text-slate-600 dark:text-slate-400"> <ArrowUpDown className="w-4 h-4 inline mr-1.5" /> Sort: </label> <select id={`sort-reviews-${productId}`} value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="block pl-2 pr-8 py-1 text-sm border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-amber-500 focus:border-amber-500 rounded-md bg-white dark:bg-slate-800"> <option value="date-desc">Newest</option> <option value="rating-desc">Highest Rating</option> <option value="rating-asc">Lowest Rating</option> </select> </div> )} </div> <div className="space-y-5"> {sortedReviews.length > 0 ? ( sortedReviews.map(review => ( <div key={review.id} className="flex items-start space-x-4"> <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center"> <UserCircle className="w-6 h-6 text-slate-500 dark:text-slate-400" /> </div> <div> <div className="flex items-center space-x-3"> <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{review.username}</p> <StarRating rating={review.rating} size={14} /> </div> <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5"> {new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} </p> <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{review.comment}</p> </div> </div> )) ) : ( <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">No reviews yet. Be the first to share your thoughts!</p> )} </div> </div> </div> );
};

// --- From components/EmailQuoteModal.tsx ---
const EmailQuoteModal: React.FC<{ isOpen: boolean; onClose: () => void; emailContent: EmailContent | null; }> = ({ isOpen, onClose, emailContent }) => {
  const [recipient, setRecipient] = useState(''); const [subject, setSubject] = useState(''); const [body, setBody] = useState(''); const [copied, setCopied] = useState(false);
  useEffect(() => { if (isOpen && emailContent) { setSubject(emailContent.subject); setBody(emailContent.body); setRecipient(''); setCopied(false); } }, [isOpen, emailContent]);
  if (!isOpen) return null;
  const handleCopyToClipboard = () => { const emailBodyForKlaviyo = `Subject: ${subject}\n\n${body}`; navigator.clipboard.writeText(emailBodyForKlaviyo).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };
  const handleSendMail = () => { const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`; window.open(mailtoLink, '_blank'); onClose(); };
  return ( <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" aria-labelledby="modal-title" role="dialog" aria-modal="true" onClick={onClose}> <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl m-4 overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}> <div className="flex items-start justify-between p-5 border-b border-slate-200 dark:border-slate-700"> <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100" id="modal-title"> Generated Email Draft </h2> <button type="button" className="text-slate-400 bg-transparent hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-600 dark:hover:text-white rounded-lg text-sm p-1.5 ml-auto inline-flex items-center" onClick={onClose} aria-label="Close modal"> <X size={20} /> </button> </div> <div className="p-6 space-y-4 overflow-y-auto"> <div> <label htmlFor="recipient-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"> Recipient Email </label> <input type="email" id="recipient-email" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="procurement@example.com" className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200" /> </div> <div> <label htmlFor="email-subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"> Subject </label> <input type="text" id="email-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200" /> </div> <div> <label htmlFor="email-body" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"> Body </label> <textarea id="email-body" rows={10} value={body} onChange={(e) => setBody(e.target.value)} className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200" /> </div> <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-start gap-3"> <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" /> <p className="text-sm text-amber-800 dark:text-amber-300"> Use 'Copy for Klaviyo' to easily paste this content into your marketing campaigns. </p> </div> </div> <div className="flex items-center justify-between p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"> <button type="button" onClick={handleCopyToClipboard} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 border border-transparent rounded-md hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:ring-offset-slate-800"> {copied ? <Check className="w-5 h-5 mr-2 text-green-600" /> : <Copy className="w-5 h-5 mr-2" />} {copied ? 'Copied!' : 'Copy for Klaviyo'} </button> <div className="flex items-center space-x-3"> <button type="button" className="px-5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600" onClick={onClose}> Cancel </button> <button type="button" onClick={handleSendMail} disabled={!recipient} className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white bg-amber-500 border border-transparent rounded-lg shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"> Send via Email Client <Send className="w-4 h-4 ml-2" /> </button> </div> </div> </div> </div> );
};

// --- From components/ProductCard.tsx ---
const ProductCard: React.FC<{ product: Product; onToggleCompare: (product: Product) => void; isInCompare: boolean; isCompareDisabled: boolean; onAddReview: (productId: number, reviewData: Omit<Review, 'id' | 'date'>) => void; onQuickView: (product: Product) => void; }> = ({ product, onToggleCompare, isInCompare, isCompareDisabled, onAddReview, onQuickView }) => {
  const [quantity, setQuantity] = useState(1); const [isModalOpen, setIsModalOpen] = useState(false); const [isShareOpen, setIsShareOpen] = useState(false); const [linkCopied, setLinkCopied] = useState(false); const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const shareButtonRef = useRef<HTMLButtonElement>(null); const sharePopoverRef = useRef<HTMLDivElement>(null);
  const sabsDetail = product.sabsStandard ? SABS_STANDARD_DETAILS[product.sabsStandard] : undefined;
  const averageRating = product.reviews && product.reviews.length > 0 ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length : 0;
  useEffect(() => { const handleClickOutside = (event: MouseEvent) => { if ( isShareOpen && sharePopoverRef.current && !sharePopoverRef.current.contains(event.target as Node) && shareButtonRef.current && !shareButtonRef.current.contains(event.target as Node) ) { setIsShareOpen(false); } }; document.addEventListener('mousedown', handleClickOutside); return () => { document.removeEventListener('mousedown', handleClickOutside); }; }, [isShareOpen]);
  const incrementQuantity = () => setQuantity(prev => prev + 1); const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  const handleCopyLink = () => { const productUrl = `${window.location.origin}${window.location.pathname}#product-${product.id}`; navigator.clipboard.writeText(productUrl).then(() => { setLinkCopied(true); setTimeout(() => { setLinkCopied(false); setIsShareOpen(false); }, 2000); }); };
  if (product.isLoading) { return ( <div className="flex flex-col bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md overflow-hidden animate-pulse"> <div className="w-full h-48 bg-slate-200 dark:bg-slate-700"></div> <div className="p-5 flex flex-col flex-grow"> <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3"></div> <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div> <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mt-2"></div> <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3 mt-4"> <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full"></div> <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full"></div> </div> </div> </div> ); }
  const productUrl = encodeURIComponent(`${window.location.origin}${window.location.pathname}#product-${product.id}`); const productText = encodeURIComponent(`Check out this product: ${product.name}`);
  const twitterUrl = `https://twitter.com/intent/tweet?url=${productUrl}&text=${productText}`; const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${productUrl}`; const linkedinUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${productUrl}&title=${productText}`;
  return ( <div className="flex flex-col"> <div id={`product-${product.id}`} className={`group flex flex-col bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${isReviewsOpen ? 'rounded-t-lg' : 'rounded-lg'}`}> <div className="overflow-hidden relative"> <img className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" src={product.imageUrl} alt={product.name} /> <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"> <button onClick={() => onQuickView(product)} className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-900 bg-white/90 border border-transparent rounded-md shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"> <Eye size={16} className="mr-2" /> Quick View </button> </div> {product.isPrintable && ( <div className="absolute top-3 right-3 bg-indigo-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md"> <Printer size={14} /> <span>Customizable</span> </div> )} </div> <div className="p-5 flex flex-col flex-grow"> <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{product.name}</h3> <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 flex-grow">{product.description}</p> {product.price && ( <div className="mt-3"> <p className="text-xl font-bold text-slate-800 dark:text-slate-200"> {product.price.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })} </p> </div> )} <div className="flex items-center mt-2"> {averageRating > 0 ? ( <> <StarRating rating={averageRating} /> <span className="ml-2 text-xs text-slate-500 dark:text-slate-400"> {averageRating.toFixed(1)} average rating </span> </> ) : ( <span className="text-xs text-slate-500 dark:text-slate-400">No reviews yet</span> )} </div> {product.sabsCertified && ( <div className="mt-3"> <div className="relative group inline-flex items-center" aria-describedby={`sabs-tooltip-${product.id}`}> <div className="flex items-center text-sm text-green-600 dark:text-green-500 font-medium cursor-help"> <CheckCircle className="w-4 h-4 mr-1.5" /> <span>SABS Certified</span> {product.sabsStandard && ( <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs font-semibold rounded-full"> {product.sabsStandard} </span> )} </div> {sabsDetail && ( <div id={`sabs-tooltip-${product.id}`} role="tooltip" className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 dark:bg-slate-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 pointer-events-none z-10"> <h4 className="font-bold border-b border-slate-600 pb-1 mb-1.5">{product.sabsStandard}</h4> <p className="leading-relaxed">{sabsDetail}</p> <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-800 dark:border-t-slate-900"></div> </div> )} </div> </div> )} <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3"> {product.isPrintable ? ( <button onClick={() => setIsModalOpen(true)} className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"> <Printer className="w-4 h-4 mr-2" /> Customize & Add to Cart </button> ) : ( <div className="flex items-center gap-2"> <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-md"> <button onClick={decrementQuantity} className="px-2.5 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-l-md transition-colors disabled:opacity-50" aria-label="Decrease quantity" disabled={quantity <= 1}> <Minus size={16} /> </button> <input type="number" value={quantity} onChange={(e) => { const value = parseInt(e.target.value, 10); if (!isNaN(value) && value >= 1) { setQuantity(value); } }} className="w-12 h-full text-center border-l border-r border-slate-300 dark:border-slate-600 bg-transparent dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" min="1" aria-label="Product quantity" /> <button onClick={incrementQuantity} className="px-2.5 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-r-md transition-colors" aria-label="Increase quantity"> <Plus size={16} /> </button> </div> <button className="flex-grow inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-amber-500 border border-transparent rounded-md shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"> <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart </button> </div> )} <div className="grid grid-cols-3 gap-2 text-center text-sm"> <div className="relative"> <button ref={shareButtonRef} onClick={() => setIsShareOpen(!isShareOpen)} className="w-full flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"> <Share2 size={14}/> Share </button> {isShareOpen && ( <div ref={sharePopoverRef} className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max p-2 bg-white dark:bg-slate-900 rounded-lg shadow-lg z-10 border border-slate-200 dark:border-slate-700"> <div className="flex items-center gap-2 mb-2"> <input type="text" readOnly value={`${window.location.origin}${window.location.pathname}#product-${product.id}`} className="w-full text-xs bg-slate-100 dark:bg-slate-800 rounded-md px-2 py-1 border border-slate-300 dark:border-slate-600" /> <button onClick={handleCopyLink} className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"> {linkCopied ? <Check size={14} className="text-green-500"/> : <Copy size={14}/>} </button> </div> <div className="flex items-center justify-center gap-2"> <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><Twitter size={16} /></a> <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><Facebook size={16} /></a> <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><Linkedin size={16} /></a> </div> </div> )} </div> <button onClick={() => onToggleCompare(product)} disabled={isCompareDisabled && !isInCompare} className={`w-full flex items-center justify-center gap-1.5 transition-colors py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 ${ isInCompare ? 'text-amber-600 dark:text-amber-500 font-semibold' : 'text-slate-600 dark:text-slate-400' } disabled:opacity-50 disabled:cursor-not-allowed`} title={isCompareDisabled && !isInCompare ? "Maximum 4 products for comparison" : ""}> <Scale size={14}/> {isInCompare ? 'Comparing' : 'Compare'} </button> <button onClick={() => setIsReviewsOpen(!isReviewsOpen)} className="w-full flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"> <MessageSquare size={14}/> Reviews ({product.reviews?.length || 0}) </button> </div> </div> </div> </div> <CustomizationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} product={product} /> {isReviewsOpen && product.reviews && ( <div className="bg-white dark:bg-slate-800 border-x border-b border-slate-200 dark:border-slate-700 rounded-b-lg -mt-1 shadow-md z-0 relative"> <ProductReviews productId={product.id} reviews={product.reviews} onAddReview={onAddReview} /> </div> )} </div> );
};

// --- From components/Navbar.tsx ---
const Navbar: React.FC<{ onThemeToggle: () => void; isDarkMode: boolean }> = ({ onThemeToggle, isDarkMode }) => ( <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800"> <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> <div className="flex justify-between items-center h-16"> <div className="flex items-center space-x-4"> <ShieldCheck className="w-8 h-8 text-amber-500" /> <span className="text-xl font-bold text-slate-800 dark:text-slate-200">Melotwo PPE Hub</span> </div> <div className="flex items-center space-x-4"> <button onClick={onThemeToggle} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-slate-900"> {isDarkMode ? <Sun size={20} /> : <Moon size={20} />} <span className="sr-only">Toggle theme</span> </button> </div> </div> </div> </nav> );

// --- From components/EmailCapture.tsx ---
const EmailCapture: React.FC = () => ( <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg my-16"> <div className="max-w-4xl mx-auto text-center py-12 px-4 sm:px-6 lg:py-16 lg:px-8"> <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl"> <span className="block">Stay Ahead in Safety.</span> </h2> <p className="mt-4 text-lg leading-6 text-slate-600 dark:text-slate-400"> Get the latest on SABS standards, new product arrivals, and exclusive offers delivered right to your inbox. </p> <form className="mt-8 sm:flex sm:justify-center"> <div className="min-w-0 flex-1"> <label htmlFor="email-address" className="sr-only">Email address</label> <input id="email-address" name="email-address" type="email" autoComplete="email" required className="block w-full px-5 py-3 border border-slate-300 dark:border-slate-600 rounded-md text-base text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-amber-500 bg-white dark:bg-slate-800" placeholder="Enter your email" /> </div> <div className="mt-3 sm:mt-0 sm:ml-3"> <button type="submit" className="block w-full py-3 px-5 rounded-md shadow bg-amber-500 text-white font-medium hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-amber-500"> Subscribe </button> </div> </form> </div> </div> );

// --- From components/Footer.tsx ---
const Footer: React.FC = () => ( <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800"> <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500 dark:text-slate-400"> <p>&copy; {new Date().getFullYear()} Melotwo PPE Procurement Hub. All rights reserved.</p> <p className="mt-1">Your trusted partner in workplace safety and SABS-certified equipment.</p> </div> </footer> );

// --- From components/AiChatBot.tsx ---
const AiChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false); const [messages, setMessages] = useState<ChatMessage[]>([ { id: 'initial', role: 'model', text: 'Hello! I am Melotwo AI. How can I assist you with your SABS-certified PPE needs today?' } ]); const [input, setInput] = useState(''); const [isLoading, setIsLoading] = useState(false); const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null); const [isEmailModalOpen, setIsEmailModalOpen] = useState(false); const [emailContent, setEmailContent] = useState<EmailContent | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(scrollToBottom, [messages]);
  useEffect(() => { if (isOpen) { navigator.geolocation.getCurrentPosition( (position) => { setUserLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }); }, (error) => { console.warn("Could not get user location:", error.message); } ); } }, [isOpen]);
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!input.trim() || isLoading) return; const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: input }; setMessages(prev => [...prev, userMessage]); setInput(''); setIsLoading(true); const { text, sources } = await getAiBotResponse(input, userLocation); const modelMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: text, sources: sources, rating: null, }; setMessages(prev => [...prev, modelMessage]); setIsLoading(false); };
  const handleRating = (messageId: string, rating: 'up' | 'down') => { setMessages(messages.map(msg => msg.id === messageId ? { ...msg, rating: msg.rating === rating ? null : rating } : msg)); };
  const handleGenerateEmail = async () => { setIsLoading(true); const generatedContent = await generateEmailDraft(messages); setIsLoading(false); if (generatedContent) { setEmailContent(generatedContent); setIsEmailModalOpen(true); } else { console.error("Failed to generate email content."); } };
  return ( <> <div className="fixed bottom-5 right-5 z-50"> <button onClick={() => setIsOpen(!isOpen)} className="bg-amber-500 hover:bg-amber-600 text-white rounded-full p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500" aria-label={isOpen ? "Close Chat" : "Open Chat"}> {isOpen ? <X size={24} /> : <MessageSquare size={24} />} </button> </div> {isOpen && ( <div className="fixed bottom-20 right-5 w-full max-w-sm h-[70vh] max-h-[600px] bg-white dark:bg-slate-900 rounded-lg shadow-2xl flex flex-col z-50 border border-slate-200 dark:border-slate-700"> <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700"> <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2"> <Bot className="text-amber-500"/> Melotwo AI Assistant </h3> <button onClick={handleGenerateEmail} disabled={isLoading || messages.length <= 1} className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed" title="Generate Email Draft"> <Mail size={18} /> </button> </div> <div className="flex-1 overflow-y-auto p-4 space-y-4"> {messages.map((message) => ( <div key={message.id} className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : ''}`}> {message.role === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white"><Bot size={20} /></div>} <div className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user' ? 'bg-amber-500 text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'}`}> <p className="text-sm prose dark:prose-invert prose-p:my-0">{message.text}</p> {message.sources && message.sources.length > 0 && ( <div className="mt-3 border-t border-slate-200 dark:border-slate-700 pt-2 space-y-1.5"> <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sources:</h4> {message.sources.map((source, index) => ( <a key={index} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-500 hover:underline"> <Link size={12} /> <span className="truncate">{source.title}</span> </a> ))} </div> )} {message.role === 'model' && message.id !== 'initial' && ( <div className="flex items-center justify-end gap-1 mt-2"> <button onClick={() => handleRating(message.id, 'up')} className={`p-1 rounded-full ${message.rating === 'up' ? 'bg-green-100 dark:bg-green-900 text-green-600' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}><ThumbsUp size={14}/></button> <button onClick={() => handleRating(message.id, 'down')} className={`p-1 rounded-full ${message.rating === 'down' ? 'bg-red-100 dark:bg-red-900 text-red-600' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}><ThumbsDown size={14}/></button> </div> )} </div> {message.role === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400"><User size={20} /></div>} </div> ))} {isLoading && ( <div className="flex items-end gap-2"> <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white"><Bot size={20} /></div> <div className="max-w-[80%] rounded-lg p-3 bg-slate-100 dark:bg-slate-800 rounded-bl-none"> <Loader2 className="animate-spin text-amber-500" size={20} /> </div> </div> )} <div ref={chatEndRef} /> </div> <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2"> <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about products or safety..." className="flex-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-full focus:ring-1 focus:ring-amber-500 bg-white dark:bg-slate-800 text-sm" disabled={isLoading} /> <button type="submit" disabled={isLoading || !input.trim()} className="bg-amber-500 text-white rounded-full p-2.5 hover:bg-amber-600 disabled:bg-slate-300 dark:disabled:bg-slate-600"> <Send size={18} /> </button> </form> </div> )} <EmailQuoteModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} emailContent={emailContent} /> </> );
};

// --- From components/Toast.tsx ---
const Toast: React.FC<{ toast: ToastType; onDismiss: (id: string) => void; }> = ({ toast, onDismiss }) => {
  useEffect(() => { const timer = setTimeout(() => onDismiss(toast.id), 5000); return () => clearTimeout(timer); }, [toast.id, onDismiss]);
  const iconMap = { warning: <AlertTriangle />, success: <CheckCircle />, info: <Info />, error: <XCircle /> };
  const colorMap = { warning: 'bg-amber-500', success: 'bg-green-500', info: 'bg-blue-500', error: 'bg-red-500' };
  return ( <div className={`flex items-center w-full max-w-xs p-4 text-white ${colorMap[toast.type]} rounded-lg shadow-lg`}> <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg">{iconMap[toast.type]}</div> <div className="ml-3 text-sm font-normal">{toast.message}</div> <button type="button" onClick={() => onDismiss(toast.id)} className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-white/20" aria-label="Close"> <X className="w-5 h-5" /> </button> </div> );
};

// --- From components/ComparisonBar.tsx and ComparisonModal.tsx ---
const ComparisonFeature: React.FC<{ compareList: Product[]; onToggleCompare: (product: Product) => void; clearCompareList: () => void; }> = ({ compareList, onToggleCompare, clearCompareList }) => {
  const [isModalOpen, setIsModalOpen] = useState(false); if (compareList.length === 0) return null;
  return ( <> <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl z-40"> <div className="bg-white dark:bg-slate-800/80 backdrop-blur-md rounded-t-lg shadow-[0_-5px_25px_-5px_rgba(0,0,0,0.1)] mx-4 border border-slate-200 dark:border-slate-700 border-b-0"> <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3"> <div className="flex items-center justify-between"> <div className="flex items-center gap-3"> <h3 className="font-semibold text-slate-800 dark:text-slate-200 hidden sm:block">Compare Products</h3> <div className="flex items-center gap-2"> {compareList.map(p => ( <div key={p.id} className="relative group"> <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-md object-cover"/> <button onClick={() => onToggleCompare(p)} className="absolute -top-1.5 -right-1.5 bg-slate-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Remove ${p.name} from comparison`}> <X size={12}/> </button> </div> ))} </div> <span className="text-sm font-medium text-slate-600 dark:text-slate-400"> ({compareList.length} of 4) </span> </div> <div className="flex items-center gap-3"> <button onClick={clearCompareList} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-500"> Clear </button> <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-amber-500 border border-transparent rounded-md shadow-sm hover:bg-amber-600"> Compare Now <Scale className="ml-2" size={16}/> </button> </div> </div> </div> </div> </div> {isModalOpen && ( <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}> <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-6xl m-4 overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}> <div className="flex items-start justify-between p-5 border-b border-slate-200 dark:border-slate-700"> <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Product Comparison</h2> <button type="button" className="text-slate-400 hover:text-slate-900 dark:hover:text-white" onClick={() => setIsModalOpen(false)} aria-label="Close modal"><X size={24}/></button> </div> <div className="overflow-x-auto overflow-y-auto"> <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400 border-collapse"> <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700/50 sticky top-0"> <tr> <th scope="col" className="px-6 py-3 font-bold">Feature</th> {compareList.map(p => <th key={p.id} scope="col" className="px-6 py-3 w-1/4"> <div className="flex flex-col items-center text-center"> <img src={p.imageUrl} className="w-24 h-24 object-cover rounded-md mb-2" alt={p.name}/> <span className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</span> </div> </th>)} </tr> </thead> <tbody> <tr className="bg-white dark:bg-slate-800 border-b dark:border-slate-700"><th scope="row" className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">Price</th>{compareList.map(p => <td key={p.id} className="px-6 py-4 text-center font-bold text-lg text-slate-700 dark:text-slate-200">{p.price ? p.price.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' }) : 'N/A'}</td>)}</tr> <tr className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-700"><th scope="row" className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">Avg. Rating</th>{compareList.map(p => <td key={p.id} className="px-6 py-4 text-center"> <StarRating rating={p.reviews?.reduce((a,c)=>a+c.rating,0)/(p.reviews?.length || 1) || 0} /> </td>)}</tr> <tr className="bg-white dark:bg-slate-800 border-b dark:border-slate-700"><th scope="row" className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">SABS Certified</th>{compareList.map(p => <td key={p.id} className="px-6 py-4 text-center">{p.sabsCertified ? <CheckCircle className="mx-auto text-green-500" /> : <XCircle className="mx-auto text-red-500" />}</td>)}</tr> <tr className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-700"><th scope="row" className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">SABS Standard</th>{compareList.map(p => <td key={p.id} className="px-6 py-4 text-center">{p.sabsStandard || 'N/A'}</td>)}</tr> <tr className="bg-white dark:bg-slate-800 border-b dark:border-slate-700"><th scope="row" className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">Customizable</th>{compareList.map(p => <td key={p.id} className="px-6 py-4 text-center">{p.isPrintable ? <CheckCircle className="mx-auto text-green-500" /> : <XCircle className="mx-auto text-red-500" />}</td>)}</tr> </tbody> </table> </div> </div> </div> )} </> );
};

// --- From components/ProductDetailModal.tsx (Quick View) ---
const ProductDetailModal: React.FC<{ product: Product | null; onClose: () => void; onAddReview: (productId: number, reviewData: Omit<Review, 'id' | 'date'>) => void; }> = ({ product, onClose, onAddReview }) => {
  if (!product) return null;
  return ( <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}> <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl m-4 overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}> <button type="button" className="absolute top-3 right-3 text-slate-400 hover:text-slate-900 dark:hover:text-white" onClick={onClose}><X size={24}/></button> <div className="grid md:grid-cols-2 gap-6 p-6 overflow-y-auto"> <div className="space-y-4"> <img src={product.imageUrl} alt={product.name} className="w-full h-auto max-h-96 object-contain rounded-lg"/> </div> <div className="space-y-4"> <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{product.name}</h2> <StarRating rating={product.reviews?.reduce((a,c)=>a+c.rating,0)/(product.reviews?.length || 1) || 0} /> <p className="text-slate-600 dark:text-slate-400">{product.description}</p> {product.sabsCertified && <div className="flex items-center gap-2"><CheckCircle className="text-green-500"/> SABS Certified: <span className="font-semibold">{product.sabsStandard}</span></div>} {product.price && <p className="text-3xl font-bold">{product.price.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</p>} <button className="w-full inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-amber-500 border border-transparent rounded-md shadow-sm hover:bg-amber-600"> <ShoppingCart className="w-5 h-5 mr-3" /> Add to Cart </button> </div> </div> {product.reviews && <div className="overflow-y-auto"><ProductReviews productId={product.id} reviews={product.reviews} onAddReview={onAddReview} /></div>} </div> </div> );
};


// --- Main App Component ---
const App: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [products, setProducts] = useState<Product[]>(() => PRODUCTS.map(p => ({ ...p, isLoading: false })));
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ category: 'all', sabsCertified: false, isPrintable: false });
    const [sortBy, setSortBy] = useState('name-asc');
    const [compareList, setCompareList] = useState<Product[]>([]);
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
    const [toasts, setToasts] = useState<ToastType[]>([]);

    useEffect(() => {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);
    }, []);

    useEffect(() => {
        window.document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);
    
    const addToast = (message: string, type: ToastType['type'] = 'info') => {
      const id = Date.now().toString();
      setToasts(prev => [...prev, { id, message, type }]);
    };
    
    const dismissToast = (id: string) => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const handleAddReview = (productId: number, reviewData: Omit<Review, 'id' | 'date'>) => {
        setProducts(currentProducts => currentProducts.map(p => {
            if (p.id === productId) {
                const newReview: Review = { ...reviewData, id: `review-${productId}-${(p.reviews?.length || 0) + 1}`, date: new Date().toISOString(), };
                return { ...p, reviews: [...(p.reviews || []), newReview] };
            }
            return p;
        }));
    };
    
    const handleToggleCompare = (product: Product) => {
        setCompareList(prev => {
            const isInCompare = prev.some(p => p.id === product.id);
            if (isInCompare) {
                return prev.filter(p => p.id !== product.id);
            }
            if (prev.length < 4) {
                return [...prev, product];
            }
            addToast("Maximum 4 products can be compared.", 'warning');
            return prev;
        });
    };
    
    const clearCompareList = () => setCompareList([]);

    const filteredAndSortedProducts = useMemo(() => {
        let result = products.filter(p => 
            (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filters.category === 'all' || p.category === filters.category) &&
            (!filters.sabsCertified || p.sabsCertified) &&
            (!filters.isPrintable || p.isPrintable)
        );

        switch (sortBy) {
            case 'price-asc': result.sort((a, b) => (a.price || Infinity) - (b.price || Infinity)); break;
            case 'price-desc': result.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
            case 'rating-desc':
                result.sort((a, b) => {
                    const ratingA = a.reviews && a.reviews.length > 0 ? a.reviews.reduce((acc, r) => acc + r.rating, 0) / a.reviews.length : 0;
                    const ratingB = b.reviews && b.reviews.length > 0 ? b.reviews.reduce((acc, r) => acc + r.rating, 0) / b.reviews.length : 0;
                    return ratingB - ratingA;
                });
                break;
            case 'name-desc': result.sort((a, b) => b.name.localeCompare(a.name)); break;
            case 'name-asc':
            default: result.sort((a, b) => a.name.localeCompare(b.name)); break;
        }
        return result;
    }, [products, searchTerm, filters, sortBy]);

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 transition-colors duration-300`}>
      <Navbar onThemeToggle={() => setIsDarkMode(p => !p)} isDarkMode={isDarkMode} />
      
      <header className="relative bg-white dark:bg-slate-900 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-200/[0.4] dark:bg-grid-slate-700/[0.2] [mask-image:linear-gradient(to_bottom,white_5%,transparent_90%)]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-5xl md:text-6xl">
            Your Premier Partner for <span className="text-amber-500">Certified Safety Equipment</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
           Equip your workforce with SABS-approved Personal Protective Equipment (PPE). Fast procurement, expert advice, and uncompromising safety standards for the mining and industrial sectors.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-lg sticky top-[65px] z-30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="lg:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Search Products</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-slate-400" /></div>
                <input type="search" id="search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name or description..." className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:outline-none focus:ring-amber-500 focus:border-amber-500" />
              </div>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select id="category" value={filters.category} onChange={e => setFilters(f => ({...f, category: e.target.value}))} className="block w-full py-2 pl-3 pr-10 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:outline-none focus:ring-amber-500 focus:border-amber-500">
                <option value="all">All Categories</option>
                {PRODUCT_CATEGORIES.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="sort-by" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sort By</label>
              <select id="sort-by" value={sortBy} onChange={e => setSortBy(e.target.value)} className="block w-full py-2 pl-3 pr-10 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:outline-none focus:ring-amber-500 focus:border-amber-500">
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Highest Rated</option>
              </select>
            </div>
            <div className="col-span-full flex items-center justify-start gap-x-6 gap-y-2 flex-wrap mt-2">
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input id="sabs-certified" type="checkbox" checked={filters.sabsCertified} onChange={e => setFilters(f => ({...f, sabsCertified: e.target.checked}))} className="focus:ring-amber-500 h-4 w-4 text-amber-600 border-slate-300 rounded" />
                </div>
                <div className="ml-2 text-sm"><label htmlFor="sabs-certified" className="font-medium text-slate-700 dark:text-slate-300 cursor-pointer">SABS Certified Only</label></div>
              </div>
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input id="is-printable" type="checkbox" checked={filters.isPrintable} onChange={e => setFilters(f => ({...f, isPrintable: e.target.checked}))} className="focus:ring-amber-500 h-4 w-4 text-amber-600 border-slate-300 rounded" />
                </div>
                <div className="ml-2 text-sm"><label htmlFor="is-printable" className="font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Customizable Products</label></div>
              </div>
            </div>
          </div>
        </div>

        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onToggleCompare={handleToggleCompare}
                isInCompare={compareList.some(p => p.id === product.id)}
                isCompareDisabled={compareList.length >= 4}
                onAddReview={handleAddReview}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <SearchX className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-lg font-medium text-slate-900 dark:text-slate-200">No Products Found</h3>
            <p className="mt-1 text-slate-500 dark:text-slate-400">Your search and filter combination did not match any products.</p>
          </div>
        )}
        
        <EmailCapture />
      </main>

      <Footer />
      <AiChatBot />
      <ComparisonFeature compareList={compareList} onToggleCompare={handleToggleCompare} clearCompareList={clearCompareList}/>
      <ProductDetailModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} onAddReview={handleAddReview} />

      <div aria-live="assertive" className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-[70]">
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          {toasts.map(toast => <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />)}
        </div>
      </div>
    </div>
  );
};

export default App;
