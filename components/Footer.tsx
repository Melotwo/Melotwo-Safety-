import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-800 dark:bg-slate-900 text-slate-300" id="contact">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="grid grid-cols-2 gap-8 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase">Products</h3>
                <ul className="mt-4 space-y-2">
                  {PRODUCT_CATEGORIES.map(cat => (
                     <li key={cat.name}><a href="#products" className="text-base text-slate-300 hover:text-white">{cat.name}</a></li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase">Company</h3>
                <ul className="mt-4 space-y-2">
                  <li><a href="#about" className="text-base text-slate-300 hover:text-white">About</a></li>
                  <li><a href="#" className="text-base text-slate-300 hover:text-white">Careers</a></li>
                  <li><a href="#" className="text-base text-slate-300 hover:text-white">Contact Us</a></li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase">Legal</h3>
                <ul className="mt-4 space-y-2">
                  <li><a href="#" className="text-base text-slate-300 hover:text-white">Privacy</a></li>
                  <li><a href="#" className="text-base text-slate-300 hover:text-white">Terms</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 xl:mt-0">
            <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase">Join Our Newsletter</h3>
            <p className="mt-4 text-base text-slate-400">Get the latest on new products and safety standards.</p>
            <form className="mt-4 sm:flex sm:max-w-md">
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input 
                type="email" 
                name="email-address" 
                id="email-address" 
                autoComplete="email" 
                required 
                className="w-full px-4 py-2 border border-slate-600 rounded-md text-slate-100 bg-slate-700 placeholder-slate-400 focus:ring-orange-500 focus:border-orange-500" 
                placeholder="Enter your email" 
              />
              <div className="mt-3 rounded-md sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                <button 
                  type="submit" 
                  className="w-full bg-orange-600 flex items-center justify-center border border-transparent rounded-md py-2 px-4 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-orange-500"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-700 dark:border-slate-600 pt-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-8 w-8 text-orange-600" />
            <span className="text-xl font-bold text-white">Melotwo</span>
          </div>
          <p className="mt-4 md:mt-0 text-base text-slate-400">&copy; {new Date().getFullYear()} Melotwo, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;