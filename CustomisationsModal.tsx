
import React, { useState, useRef, useEffect } from 'react';
import type { Product } from '../types.ts';
import { X, UploadCloud, Trash2, ShoppingCart } from 'lucide-react';

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

const CustomizationModal: React.FC<CustomizationModalProps> = ({ isOpen, onClose, product }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Cleanup function to revoke URL on unmount or when modal is closed
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
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        {/* Header */}
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

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preview Section */}
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
          
          {/* Upload Section */}
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
        
        {/* Footer */}
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

export default CustomizationModal;
