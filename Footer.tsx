
import React, { useState } from 'react';
import { ShieldCheck, Send, Loader2, CheckCircle } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../constants';

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

    // Simulate API call
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

export default Footer;
