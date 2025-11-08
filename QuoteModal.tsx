import React, { useState, useEffect } from 'react';
import { Check, X, Mail, User, Building, Loader2 } from 'lucide-react';
import { PpeProduct } from '../types';

const QuoteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  product: PpeProduct | null;
}> = ({ isOpen, onClose, product }) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setCompany('');
      setEmail('');
      setIsSubmitted(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);
    console.log({ product: product.name, name, company, email });
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  const isFormValid = name.trim() !== '' && company.trim() !== '' && /^\S+@\S+\.\S+$/.test(email);
  
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={handleClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-[fade-in_0.2s_ease-out]"></div>
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 transition-all animate-[scale-up_0.2s_ease-out]">
        <button onClick={handleClose} className="absolute top-2 right-2 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Close modal">
          <X size={20} />
        </button>
        <div className="p-6 sm:p-8">
          {isSubmitted ? (
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
              </div>
              <h3 id="modal-title" className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Request Sent!</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Thank you, {name}. We will be in touch shortly.</p>
              <button onClick={handleClose} className="mt-6 w-full inline-flex justify-center rounded-md border border-transparent bg-amber-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-amber-600 focus:outline-none sm:text-sm">
                Close
              </button>
            </div>
          ) : (
            <>
              <h3 id="modal-title" className="text-lg font-semibold text-slate-900 dark:text-white">Request a Quote</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">For: <span className="font-medium text-amber-600 dark:text-amber-400">{product.name}</span></p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                  <div className="relative mt-1">
                    <User className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-3 h-5 w-5 text-slate-400" />
                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 dark:bg-slate-700 dark:text-white sm:text-sm" />
                  </div>
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Company</label>
                  <div className="relative mt-1">
                    <Building className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-3 h-5 w-5 text-slate-400" />
                    <input type="text" id="company" value={company} onChange={e => setCompany(e.target.value)} required className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 dark:bg-slate-700 dark:text-white sm:text-sm" />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                  <div className="relative mt-1">
                    <Mail className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-3 h-5 w-5 text-slate-400" />
                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 dark:bg-slate-700 dark:text-white sm:text-sm" />
                  </div>
                </div>
                <button type="submit" disabled={!isFormValid || isSubmitting} className="w-full mt-4 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:outline-none disabled:bg-amber-300 disabled:cursor-not-allowed dark:disabled:bg-amber-800 dark:disabled:text-slate-400">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Sending...' : 'Submit Request'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteModal;
