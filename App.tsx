
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ShieldCheck, Sun, Moon, Loader2, Copy, Printer, Building, Wrench, Package, ListChecks, Check, AlertTriangle, HardHat, Siren, Factory, ShoppingCart, X, Mail, User, FileDown, Save, Bookmark, Trash2, Eye, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ========= TYPES =========
interface PpeProduct {
  id: string;
  name: string;
  keywords: string[];
  description: string;
  image: string;
}

interface SavedChecklist {
  id: number;
  title: string;
  content: string;
  savedAt: string;
}

// ========= CONSTANTS =========
const PPE_PRODUCTS: PpeProduct[] = [
  {
    id: 'hh-001',
    name: 'Industrial Hard Hat',
    keywords: ['hard hat', 'head protection', 'helmet'],
    description: 'SABS approved for impact resistance. Comfortable and adjustable for all-day wear.',
    image: 'https://images.unsplash.com/photo-1581092570025-a5a4d6a1d1d8?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'sg-002',
    name: 'Safety Goggles',
    keywords: ['goggles', 'eye protection', 'safety glasses'],
    description: 'Anti-fog, scratch-resistant lenses with full UV protection. Wraparound design for maximum coverage.',
    image: 'https://images.unsplash.com/photo-1628882799342-31b2d433d832?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'gl-003',
    name: 'Heavy-Duty Work Gloves',
    keywords: ['gloves', 'hand protection'],
    description: 'Reinforced leather palm for high abrasion resistance. Ideal for handling rough materials.',
    image: 'https://images.unsplash.com/photo-1590390190363-356a5293a557?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'sb-004',
    name: 'Steel-Toed Safety Boots',
    keywords: ['boots', 'footwear', 'foot protection', 'steel-toed'],
    description: 'Puncture-proof sole and certified steel toe cap. Waterproof and slip-resistant.',
    image: 'https://images.unsplash.com/photo-1628813635741-f358e6503c5d?q=80&w=800&auto=format&fit=crop',
  },
];


const exampleScenarios = [
  {
    icon: <Building className="w-8 h-8 mx-auto mb-2 text-amber-500" />,
    title: 'Construction Welding',
    industry: 'High-rise Construction Site',
    task: 'Welding steel support beams on the 3rd floor',
    equipment: 'Arc Welder, Scaffolding, Fire Extinguisher',
  },
  {
    icon: <Factory className="w-8 h-8 mx-auto mb-2 text-amber-500" />,
    title: 'Warehouse Forklift',
    industry: 'Busy Distribution Warehouse',
    task: 'Operating a forklift to move pallets from receiving to storage racks',
    equipment: 'Propane Forklift, Pallet Jack',
  },
  {
    icon: <Wrench className="w-8 h-8 mx-auto mb-2 text-amber-500" />,
    title: 'Confined Space Entry',
    industry: 'Wastewater Treatment Plant',
    task: 'Entering a drainage tank for routine inspection and maintenance',
    equipment: 'Gas Detector, Harness, Winch, Ventilation Fan',
  }
];


// ========= HELPER COMPONENTS =========
const Navbar: React.FC<{
  onThemeToggle: () => void;
  isDarkMode: boolean;
  onOpenSaved: () => void;
  savedCount: number;
}> = ({ onThemeToggle, isDarkMode, onOpenSaved, savedCount }) => (
  <nav className="no-print bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center space-x-4">
          <ShieldCheck className="w-8 h-8 text-amber-500" />
          <span className="text-xl font-bold text-slate-800 dark:text-slate-200">AI Safety Checklist Generator</span>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={onOpenSaved} className="relative p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500 dark:focus-visible:ring-offset-slate-900" aria-label="View saved checklists">
            <Bookmark size={20} />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-xs font-medium text-white">{savedCount}</span>
            )}
            <span className="sr-only">View saved checklists</span>
          </button>
          <button onClick={onThemeToggle} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500 dark:focus-visible:ring-offset-slate-900" aria-label="Toggle theme">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span className="sr-only">Toggle theme</span>
          </button>
        </div>
      </div>
    </div>
  </nav>
);

const Footer: React.FC = () => (
  <footer className="no-print bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-16">
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500 dark:text-slate-400">
      <p>&copy; {new Date().getFullYear()} Melotwo Digital Solutions. All rights reserved.</p>
      <p className="mt-1">Empowering safer workplaces with intelligent tools.</p>
    </div>
  </footer>
);

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      {lines.map((line, index) => {
        if (line.startsWith('### ')) {
          return <h3 key={index} className="font-semibold text-lg mt-4 mb-2">{line.substring(4)}</h3>;
        }
        if (line.startsWith('## ')) {
          const title = line.substring(3).trim();
          const lowerCaseTitle = title.toLowerCase();
          let icon = null;

          if (lowerCaseTitle.includes('personal protective equipment')) {
            icon = <HardHat className="w-5 h-5 mr-3 text-slate-500 dark:text-slate-400 flex-shrink-0" />;
          } else if (lowerCaseTitle.includes('hazard assessment')) {
            icon = <AlertTriangle className="w-5 h-5 mr-3 text-slate-500 dark:text-slate-400 flex-shrink-0" />;
          } else if (lowerCaseTitle.includes('safe work procedure')) {
            icon = <ListChecks className="w-5 h-5 mr-3 text-slate-500 dark:text-slate-400 flex-shrink-0" />;
          } else if (lowerCaseTitle.includes('emergency plan')) {
            icon = <Siren className="w-5 h-5 mr-3 text-slate-500 dark:text-slate-400 flex-shrink-0" />;
          }
          
          return (
             <div key={index} className="border-b border-slate-200 dark:border-slate-700 mt-6 mb-3 pb-2">
                <div className="flex items-center">
                    {icon}
                    <h2 className="font-bold text-xl">{title}</h2>
                </div>
            </div>
          )
        }
        if (line.startsWith('* ')) {
          return (
            <div key={index} className="flex items-start my-2">
              <Check className="w-4 h-4 text-green-500 mr-3 mt-1 flex-shrink-0" />
              <span>{line.substring(2)}</span>
            </div>
          );
        }
        return <p key={index} className="text-slate-700 dark:text-slate-300">{line}</p>;
      })}
    </div>
  );
};

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


const SavedChecklistsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  savedChecklists: SavedChecklist[];
  onDelete: (id: number) => void;
}> = ({ isOpen, onClose, savedChecklists, onDelete }) => {
  const [viewingChecklist, setViewingChecklist] = useState<SavedChecklist | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setViewingChecklist(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="saved-modal-title" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-[fade-in_0.2s_ease-out]"></div>
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 transition-all animate-[scale-up_0.2s_ease-out] flex flex-col" style={{maxHeight: '85vh'}}>
        <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h3 id="saved-modal-title" className="text-lg font-semibold text-slate-900 dark:text-white">
            {viewingChecklist ? viewingChecklist.title : 'Saved Checklists'}
          </h3>
          {viewingChecklist && (
            <button onClick={() => setViewingChecklist(null)} className="flex items-center text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline">
              <ArrowLeft size={16} className="mr-1"/>
              Back to List
            </button>
          )}
          <button onClick={onClose} className="p-2 -mr-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto p-6">
          {viewingChecklist ? (
            <MarkdownRenderer text={viewingChecklist.content} />
          ) : (
            savedChecklists.length > 0 ? (
              <ul className="space-y-3">
                {savedChecklists.map((checklist) => (
                  <li key={checklist.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{checklist.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Saved: {checklist.savedAt}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => setViewingChecklist(checklist)} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700" aria-label={`View ${checklist.title}`}>
                        <Eye size={18} />
                      </button>
                      <button onClick={() => onDelete(checklist.id)} className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50" aria-label={`Delete ${checklist.title}`}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <Bookmark size={48} className="mx-auto text-slate-400 dark:text-slate-500" />
                <p className="mt-4 text-slate-600 dark:text-slate-400">You haven't saved any checklists yet.</p>
                <p className="text-sm text-slate-500 dark:text-slate-500">Generate a checklist and click the "Save" button to store it here.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

const ProductCard: React.FC<{
  product: PpeProduct;
  onGetQuote: (product: PpeProduct) => void;
}> = ({ product, onGetQuote }) => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col">
    <img src={product.image} alt={product.name} className="h-48 w-full object-cover" />
    <div className="p-4 flex flex-col flex-grow">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{product.name}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 flex-grow">{product.description}</p>
      <button
        onClick={() => onGetQuote(product)}
        className="mt-4 w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:outline-none"
      >
        <ShoppingCart size={16} className="mr-2" />
        Get a Quote
      </button>
    </div>
  </div>
);

// ========= MAIN APP COMPONENT =========
const App: React.FC = () => {
  const [industry, setIndustry] = useState('');
  const [task, setTask] = useState('');
  const [equipment, setEquipment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [recommendedPpe, setRecommendedPpe] = useState<string[]>([]);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PpeProduct | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savedChecklists, setSavedChecklists] = useState<SavedChecklist[]>([]);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);

  const checklistRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark';
    setIsDarkMode(isDark);
  }, []);
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    try {
      const storedChecklists = localStorage.getItem('savedChecklists');
      if (storedChecklists) {
        setSavedChecklists(JSON.parse(storedChecklists));
      }
    } catch (e) {
      console.error("Failed to parse saved checklists from localStorage", e);
    }
  }, []);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const handleExampleClick = (scenario: typeof exampleScenarios[0]) => {
    setIndustry(scenario.industry);
    setTask(scenario.task);
    setEquipment(scenario.equipment);
  };

  const generateChecklist = async () => {
    if (!industry || !task) {
      setError('Please fill in at least the Industry/Environment and Task fields.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setChecklist(null);
    setRecommendedPpe([]);
    setIsSaved(false);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const prompt = `
        You are a certified health and safety expert. Create a comprehensive safety checklist for the following scenario. The output must be in markdown format.

        **Scenario Details:**
        - **Industry/Environment:** ${industry}
        - **Specific Task:** ${task}
        - **Equipment Involved:** ${equipment || 'Not specified'}

        **Instructions:**
        1.  Structure the checklist into logical sections using '##' for main headings. Include these four sections: "Hazard Assessment", "Personal Protective Equipment (PPE)", "Safe Work Procedures", and "Emergency Plan".
        2.  Under each section, use '*' for individual checklist items.
        3.  The language should be clear, concise, and actionable.
        4.  In the "Personal Protective Equipment (PPE)" section, identify and list the essential PPE required.
        5.  At the very end of the entire response, add a special marker line: "---PPE_KEYWORDS:[keyword1, keyword2, ...]---" where the keywords are simple, lowercase, singular terms for the recommended PPE (e.g., hard hat, goggles, gloves, boots).
      `;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      let fullText = response.text;

      const ppeMatch = fullText.match(/---PPE_KEYWORDS:\[(.*?)\]---/);
      if (ppeMatch && ppeMatch[1]) {
        const keywords = ppeMatch[1].split(',').map(k => k.trim().toLowerCase());
        setRecommendedPpe(keywords);
        fullText = fullText.replace(/---PPE_KEYWORDS:\[(.*?)\]---/, '').trim();
      }

      setChecklist(fullText);

    } catch (err: any) {
      console.error(err);
      setError('An error occurred while generating the checklist. Please check your connection or API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (checklist && checklistRef.current) {
      const textToCopy = checklistRef.current.innerText;
      navigator.clipboard.writeText(textToCopy).then(() => {
        alert('Checklist copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    }
  };

  const handlePrint = () => window.print();

  const handleExportPdf = async () => {
    const checklistElement = document.getElementById('checklist-content');
    if (!checklistElement) return;

    const actionButtons = checklistElement.querySelector('.no-print-in-pdf');
    if (actionButtons) actionButtons.classList.add('hidden');
    
    const canvas = await html2canvas(checklistElement, { 
      scale: 2,
      backgroundColor: isDarkMode ? '#020617' : '#ffffff',
    });

    if (actionButtons) actionButtons.classList.remove('hidden');

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgWidth / imgHeight;
    const imgHeightPdf = pdfWidth / ratio;
    
    let heightLeft = imgHeightPdf;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightPdf);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightPdf);
      heightLeft -= pdfHeight;
    }
    
    pdf.save('safety-checklist.pdf');
  };

  const openQuoteModal = (product: PpeProduct) => {
    setSelectedProduct(product);
    setIsQuoteModalOpen(true);
  };
  
  const closeQuoteModal = () => setIsQuoteModalOpen(false);

  const handleSaveChecklist = () => {
    if (!checklist) return;
    const title = `${industry} - ${task}`.substring(0, 50);
    const newChecklist: SavedChecklist = {
      id: Date.now(),
      title: title,
      content: checklist,
      savedAt: new Date().toLocaleDateString(),
    };

    const updatedChecklists = [newChecklist, ...savedChecklists];
    setSavedChecklists(updatedChecklists);
    localStorage.setItem('savedChecklists', JSON.stringify(updatedChecklists));
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleDeleteChecklist = (id: number) => {
    if (window.confirm('Are you sure you want to delete this checklist?')) {
        const updatedChecklists = savedChecklists.filter(c => c.id !== id);
        setSavedChecklists(updatedChecklists);
        localStorage.setItem('savedChecklists', JSON.stringify(updatedChecklists));
    }
  };


  const filteredPpeProducts = PPE_PRODUCTS.filter(product =>
    recommendedPpe.some(keyword =>
      product.keywords.some(pk => pk.includes(keyword))
    )
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <Navbar onThemeToggle={toggleTheme} isDarkMode={isDarkMode} onOpenSaved={() => setIsSavedModalOpen(true)} savedCount={savedChecklists.length}/>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <header className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Generate a Custom Safety Checklist in Seconds</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
            Leverage AI to create detailed, job-specific safety protocols. Just describe the task, and we'll handle the rest.
          </p>
        </header>

        <section className="mt-12 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Industry / Environment</label>
              <input
                type="text"
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., Construction Site, Warehouse"
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="task" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Specific Task</label>
              <input
                type="text"
                id="task"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="e.g., Welding steel beams, Operating forklift"
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="equipment" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Equipment Involved (Optional)</label>
              <input
                type="text"
                id="equipment"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                placeholder="e.g., Arc welder, Scaffolding, Gas detector"
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={generateChecklist}
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-amber-500 hover:bg-amber-600 focus:outline-none disabled:bg-amber-300 dark:disabled:bg-amber-800 dark:disabled:text-slate-400"
            >
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {isLoading ? 'Generating Checklist...' : 'Generate Checklist'}
            </button>
          </div>
        </section>

        <section className="mt-8 text-center">
            <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400">Or, start with an example:</h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {exampleScenarios.map((scenario) => (
                <button
                  key={scenario.title}
                  onClick={() => handleExampleClick(scenario)}
                  className="p-4 bg-white dark:bg-slate-800/50 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-md transition-all text-center"
                >
                  {scenario.icon}
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{scenario.title}</p>
                </button>
              ))}
            </div>
        </section>

        {error && (
          <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/50 border-l-4 border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded-r-lg">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {(isLoading || checklist) && (
          <section id="checklist-content" ref={checklistRef} className="print-area mt-12 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-amber-500" />
                <p className="mt-4 text-lg font-medium text-slate-700 dark:text-slate-300">Generating your checklist...</p>
                <p className="text-slate-500 dark:text-slate-400">This may take a moment.</p>
              </div>
            ) : checklist && (
              <>
                <header className="flex justify-between items-start mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Generated Safety Checklist</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-lg">{industry} &raquo; {task}</p>
                  </div>
                  <div className="no-print no-print-in-pdf flex items-center space-x-2">
                     <button onClick={handleSaveChecklist} className={`p-2 rounded-full ${isSaved ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                        {isSaved ? <Check size={18}/> : <Save size={18} />}
                        <span className="sr-only">{isSaved ? 'Saved!' : 'Save'}</span>
                     </button>
                    <button onClick={handleCopy} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"><Copy size={18} /><span className="sr-only">Copy</span></button>
                    <button onClick={handleExportPdf} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"><FileDown size={18} /><span className="sr-only">Export PDF</span></button>
                    <button onClick={handlePrint} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"><Printer size={18} /><span className="sr-only">Print</span></button>
                  </div>
                </header>
                <MarkdownRenderer text={checklist} />
              </>
            )}
          </section>
        )}

        {filteredPpeProducts.length > 0 && (
          <section className="no-print mt-12">
            <div className="text-center">
              <Package className="w-10 h-10 mx-auto text-amber-500" />
              <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Recommended PPE for Your Task</h2>
              <p className="mt-2 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
                Based on your checklist, we recommend the following safety equipment, available from Melotwo Digital Solutions.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredPpeProducts.map(product => (
                <ProductCard key={product.id} product={product} onGetQuote={openQuoteModal} />
              ))}
            </div>
          </section>
        )}
      </main>
      
      <Footer />

      <QuoteModal isOpen={isQuoteModalOpen} onClose={closeQuoteModal} product={selectedProduct} />
      <SavedChecklistsModal isOpen={isSavedModalOpen} onClose={() => setIsSavedModalOpen(false)} savedChecklists={savedChecklists} onDelete={handleDeleteChecklist}/>
    </div>
  );
};

export default App;
