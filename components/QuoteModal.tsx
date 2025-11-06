import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Trash2, Send, FileText, AlertTriangle } from 'lucide-react';
import type { Product } from '../types';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteItems: Product[];
  onRemoveItem: (productId: number) => void;
  onClearQuote: () => void;
}

const QuoteModal: React.FC<QuoteModalProps> = ({ isOpen, onClose, quoteItems, onRemoveItem, onClearQuote }) => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const recipientEmail = 'quotes@melotwo.com';
    const subject = `Quote Request from ${formData.company || formData.name}`;
    const productList = quoteItems.map(item => `- ${item.name} (ID: ${item.id})`).join('\n');
    
    const body = `
New Quote Request from Melotwo Website
--------------------------------------

Contact Details:
- Name: ${formData.name}
- Company: ${formData.company}
- Email: ${formData.email}
- Phone: ${formData.phone}

Message:
${formData.message || 'No additional message.'}

--- Requested Products (${quoteItems.length}) ---
${productList}
    `;

    const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    setIsSubmitted(true);
  };
  
  const handleClose = () => {
      if(isSubmitted) {
        onClearQuote();
        setIsSubmitted(false);
        setFormData({ name: '', company: '', email: '', phone: '', message: '' });
      }
      onClose();
  }

  if (!isOpen) return null;

  const inputFieldClasses = "block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100";

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 rounded-t-lg">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Request a Quote</h2>
          </div>
          <button onClick={handleClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700">
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
            {isSubmitted ? (
                 <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                    <Send className="w-16 h-16 text-green-500 mb-4" />
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Quote Request Prepared!</h3>
                    <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-md">
                        Your email client should now be open with the quote details. If it hasn't, please check your browser settings. You can now close this window.
                    </p>
                     <button 
                        onClick={handleClose}
                        className="mt-6 inline-flex items-center justify-center px-6 py-2 text-base font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700"
                      >
                       Close
                    </button>
                 </div>
            ) : (
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8 p-6">
            {/* Left side: Item List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Selected Products ({quoteItems.length})
              </h3>
              {quoteItems.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2 -mr-2">
                  {quoteItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded object-cover flex-shrink-0" />
                        <div className="truncate">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate" title={item.name}>{item.name}</p>
                          {item.sabsStandard ? (
                            <p className="text-xs text-slate-500 dark:text-slate-400">{item.sabsStandard}</p>
                          ) : (
                            <p className="text-xs text-slate-500 dark:text-slate-400 italic">Standard not specified</p>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => onRemoveItem(item.id)} 
                        className="p-1.5 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/20 dark:hover:text-red-400 flex-shrink-0 ml-2"
                        aria-label={`Remove ${item.name} from quote`}
                        title={`Remove ${item.name} from quote`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                 <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-100 dark:bg-slate-700/50 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 min-h-[150px]">
                    <AlertTriangle className="w-10 h-10 text-slate-400 dark:text-slate-500 mb-2" />
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300">Your quote is empty</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Add products to get started.</p>
                </div>
              )}
            </div>
            
            {/* Right side: Form */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Your Details</h3>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Full Name *</label>
                        <input type="text" name="name" id="name" required value={formData.name} onChange={handleInputChange} className={inputFieldClasses}/>
                    </div>
                    <div>
                        <label htmlFor="company" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Company Name</label>
                        <input type="text" name="company" id="company" value={formData.company} onChange={handleInputChange} className={inputFieldClasses}/>
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Email Address *</label>
                        <input type="email" name="email" id="email" required value={formData.email} onChange={handleInputChange} className={inputFieldClasses}/>
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Phone Number</label>
                        <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleInputChange} className={inputFieldClasses}/>
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Message</label>
                        <textarea name="message" id="message" rows={3} value={formData.message} onChange={handleInputChange} className={inputFieldClasses} placeholder="Any specific requirements..."></textarea>
                    </div>
                </div>
            </div>
          </form>
            )}
        </div>

        {!isSubmitted && (
        <footer className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 sticky bottom-0 rounded-b-lg">
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={quoteItems.length === 0 || !formData.name || !formData.email}
            className="w-full inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700 disabled:bg-slate-400 disabled:cursor-not-allowed dark:disabled:bg-slate-600"
          >
            <Send className="w-5 h-5 mr-2" />
            Submit Quote Request
          </button>
        </footer>
        )}
      </div>
    </div>
  );
};

export default QuoteModal;