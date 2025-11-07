import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
import ProductCard from './components/ProductCard.tsx';
import AiChatBot from './components/AiChatBot.tsx';
import ProductFilterSidebar from './components/ProductFilterSidebar.tsx';
import ProductSortDropdown from './components/ProductSortDropdown.tsx';
import EmailCapture from './components/EmailCapture.tsx';
import ComparisonBar from './components/ComparisonBar.tsx';
import ComparisonModal from './components/ComparisonModal.tsx';
import Toast from './components/Toast.tsx';
import ProductDetailModal from './components/ProductDetailModal.tsx';
import { PRODUCTS, PRODUCT_CATEGORIES } from './constants.ts';
import { SearchX } from 'lucide-react';
import ProductSearchBar from './components/ProductSearchBar.tsx';
import type { Product, Review, Toast as ToastType } from './types.ts';

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
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null); // State for Quick View

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

  const handleClearCompare = () => {
    setComparisonList([]);
  };
  
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

      {/* About/Features Section */}
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

      {/* Email Capture Section */}
      <EmailCapture />

      {/* Products Section */}
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
