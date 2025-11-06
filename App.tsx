import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProductCard from './components/ProductCard';
import AiChatBot from './components/AiChatBot';
import ProductFilterSidebar from './components/ProductFilterSidebar';
import QuoteModal from './components/QuoteModal';
import { PRODUCTS, PRODUCT_CATEGORIES } from './constants';
import { HardHat, CheckCircle, SearchX } from 'lucide-react';
import type { Product } from './types';

const HomePage: React.FC<{
  quoteItems: Product[];
  onAddToQuote: (product: Product) => void;
}> = ({ quoteItems, onAddToQuote }) => {
  const [showOnlyCertified, setShowOnlyCertified] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredProducts = useMemo(() => {
    return PRODUCTS
      .filter(p => !showOnlyCertified || p.sabsCertified)
      .filter(p => selectedCategory === 'All' || p.category === selectedCategory);
  }, [showOnlyCertified, selectedCategory]);

  const isProductInQuote = useCallback((productId: number) => {
    return quoteItems.some(item => item.id === productId);
  }, [quoteItems]);

  return (
    <div className="space-y-24 md:space-y-32">
      {/* Hero Section */}
      <section className="relative text-center pt-16 md:pt-24 pb-12 md:pb-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800">
        <div 
          className="absolute inset-0 bg-slate-50 dark:bg-slate-900"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)'
          }}
        ></div>
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Your Premier Partner for <span className="text-orange-600">Certified Safety Equipment</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-400">
            Equip your workforce with SABS-approved Personal Protective Equipment (PPE). Fast procurement, expert advice, and uncompromising safety standards for the mining and industrial sectors.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a href="#products" className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700">
              Browse Products
            </a>
            <a href="#contact" className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-orange-700 bg-orange-100 border border-transparent rounded-md hover:bg-orange-200">
              Get Expert Advice
            </a>
          </div>
        </div>
      </section>

      {/* About/Features Section */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">Why Choose Melotwo?</h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">We are committed to quality, compliance, and your team's safety.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3">
          {PRODUCT_CATEGORIES.slice(0, 3).map((feature) => (
            <div key={feature.name} className="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 text-orange-600 mb-4">
                <feature.icon className="h-8 w-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{feature.name}</h3>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">Our PPE Products</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
            Select products to add them to your quote request.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          <ProductFilterSidebar
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            showOnlyCertified={showOnlyCertified}
            onCertifiedChange={setShowOnlyCertified}
          />

          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                    onAddToQuote={onAddToQuote}
                    isProductInQuote={isProductInQuote(product.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-100 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 h-full min-h-[400px]">
                <SearchX className="w-16 h-16 text-slate-400 dark:text-slate-500 mb-4" />
                <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">No Products Found</h3>
                <p className="mt-2 text-slate-500 dark:text-slate-400">
                  Try adjusting your filters to find what you're looking for.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};


const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [quoteItems, setQuoteItems] = useState<Product[]>([]);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const toggleDarkMode = () => {
      setIsDarkMode(prevMode => !prevMode);
  };
  
  const handleAddToQuote = useCallback((productToAdd: Product) => {
    setQuoteItems(prevItems => {
        if (prevItems.some(item => item.id === productToAdd.id)) {
            return prevItems; // Already in quote
        }
        return [...prevItems, productToAdd];
    });
  }, []);

  const handleRemoveFromQuote = useCallback((productId: number) => {
      setQuoteItems(prevItems => prevItems.filter(item => item.id !== productId));
  }, []);

  const handleClearQuote = useCallback(() => {
    setQuoteItems([]);
  }, []);

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
      <Navbar 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode} 
        quoteItemCount={quoteItems.length}
        onQuoteClick={() => setIsQuoteModalOpen(true)}
      />
      <main className="py-16">
        <HomePage quoteItems={quoteItems} onAddToQuote={handleAddToQuote} />
      </main>
      <Footer />
      <AiChatBot />
      <QuoteModal 
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        quoteItems={quoteItems}
        onRemoveItem={handleRemoveFromQuote}
        onClearQuote={handleClearQuote}
      />
    </div>
  );
};

export default App;