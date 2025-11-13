import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Loader2, Package, Save, AlertTriangle, ShieldCheck, Printer, FileDown, Copy } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MarkdownRenderer from './components/MarkdownRenderer';
import QuoteModal from './components/QuoteModal';
import SavedChecklistsModal from './components/SavedChecklistsModal';
import ProductCard from './components/ProductCard';
import Toast from './components/Toast';
import { PPE_PRODUCTS, exampleScenarios } from './constants';
import { PpeProduct, SavedChecklist } from './types';


// ========= TYPES =========
interface ErrorState {
  title: string;
  message: string | React.ReactNode;
}

interface ValidationErrors {
    industry?: string;
    task?: string;
}

const LOADING_MESSAGES = [
  'Assessing hazards...',
  'Compiling PPE recommendations...',
  'Finalizing procedure steps...',
  'Formatting your safety checklist...',
];

const apiKey = import.meta.env.VITE_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

if (!ai) {
  console.error("VITE_API_KEY environment variable not set. The application will not be able to generate checklists.");
}


// ========= MAIN APP COMPONENT =========
const App: React.FC = () => {
  const [industry, setIndustry] = useState('');
  const [task, setTask] = useState('');
  const [equipment, setEquipment] = useState('');
  const [specificDetails, setSpecificDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [checklist, setChecklist] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [recommendedPpe, setRecommendedPpe] = useState<string[]>([]);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PpeProduct | null>(null);
  const [savedChecklists, setSavedChecklists] = useState<SavedChecklist[]>([]);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [totalChecklistItems, setTotalChecklistItems] = useState(0);

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

  useEffect(() => {
    let messageInterval: number | undefined;
    if (isLoading) {
      setLoadingMessage(LOADING_MESSAGES[0]);
      let index = 0;
      messageInterval = window.setInterval(() => {
        index = (index + 1) % LOADING_MESSAGES.length;
        setLoadingMessage(LOADING_MESSAGES[index]);
      }, 2000);
    }
    return () => {
      if (messageInterval) clearInterval(messageInterval);
    };
  }, [isLoading]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const handleExampleClick = (scenario: typeof exampleScenarios[0]) => {
    setIndustry(scenario.industry);
    setTask(scenario.task);
    setEquipment(scenario.equipment);
    setSpecificDetails(scenario.details);
    setValidationErrors({});
  };

  const showToast = (message: string) => {
    setToastMessage(message);
  }

  const generateChecklist = async () => {
    const newValidationErrors: ValidationErrors = {};
    if (!industry.trim()) newValidationErrors.industry = "Industry / Environment is required.";
    if (!task.trim()) newValidationErrors.task = "A specific task description is required.";
    
    setValidationErrors(newValidationErrors);

    if (Object.keys(newValidationErrors).length > 0) {
        return;
    }

    setIsLoading(true);
    setError(null);
    setChecklist(null);
    setRecommendedPpe([]);
    setCheckedItems(new Set());
    setTotalChecklistItems(0);


    try {
      if (!ai) {
        throw new Error("The AI client is not configured due to a missing VITE_API_KEY.");
      }
      
      const systemInstruction = `Act as a certified safety inspector. Your tone must be formal, professional, and authoritative. All responses must be structured as comprehensive safety checklists. At the end of every generated checklist, you MUST include the following disclaimer, formatted exactly as shown below:

---
***Disclaimer:** This checklist is AI-generated and for informational purposes only. It is not a substitute for professional safety advice. Always consult with a qualified safety professional to ensure compliance with local regulations and site-specific conditions.*`;

      const prompt = `
        Create a comprehensive safety checklist for the following scenario. The output must be in markdown format.

        **Scenario Details:**
        - **Industry/Environment:** ${industry}
        - **Specific Task:** ${task}
        - **Equipment Involved:** ${equipment || 'Not specified'}
        - **Specific Details:** ${specificDetails || 'Not specified'}

        **Instructions:**
        1.  Structure the checklist into logical sections using '##' for main headings. The sections must be: "Hazard Assessment", "Personal Protective Equipment (PPE)", "Safe Work Procedures", "Emergency Plan", and "Post-Task Actions & Review".
        2.  Under each section, use '*' for individual checklist items.
        3.  The language must be clear, concise, and actionable.
        4.  In the "Personal Protective Equipment (PPE)" section, identify and list the essential PPE required.
        5.  At the very end of the entire response, BEFORE the mandatory disclaimer, add a special marker line: "---PPE_KEYWORDS:[keyword1, keyword2, ...]---" where the keywords are simple, lowercase, singular terms for the recommended PPE (e.g., hard hat, goggles, gloves, boots).
      `;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { systemInstruction }
      });
      
      let fullText = response.text;

      const ppeMatch = fullText.match(/---PPE_KEYWORDS:\[(.*?)\]---/);
      if (ppeMatch && ppeMatch[1]) {
        const keywords = ppeMatch[1].split(',').map(k => k.trim().toLowerCase());
        setRecommendedPpe(keywords);
      }
      
      fullText = fullText.replace(/---PPE_KEYWORDS:\[(.*?)\]---/, '').trim();
      const totalItems = (fullText.match(/^\s*\*/gm) || []).length;
      setTotalChecklistItems(totalItems);
      setChecklist(fullText);

    } catch (err) {
      console.error("Error generating checklist:", err);
      let errorState: ErrorState = {
        title: 'An Unexpected Error Occurred',
        message: 'Something went wrong. Please try again later.',
      };
      if (err instanceof Error && err.message.includes('API key')) {
          errorState = {
            title: 'API Key Issue',
            message: 'There might be an issue with your API key. Please ensure it is correctly configured in your environment variables.',
          };
      }
      setError(errorState);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (checklistRef.current) {
      const textToCopy = checklistRef.current.innerText;
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('Checklist copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy text: ', err);
        showToast('Failed to copy checklist.');
      });
    }
  };

  const handlePrint = () => window.print();

  const handleExportPdf = async () => {
    if (!checklistRef.current) return;
    showToast('Exporting PDF...');
    const canvas = await html2canvas(checklistRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
    pdf.save('safety-checklist.pdf');
  };

  const openQuoteModal = (product: PpeProduct) => {
    setSelectedProduct(product);
    setIsQuoteModalOpen(true);
  };
  
  const handleSaveChecklist = () => {
    if (!checklist) return;
    const title = `${industry} - ${task}`.substring(0, 50);
    const newChecklist: SavedChecklist = { id: Date.now(), title, content: checklist, savedAt: new Date().toLocaleDateString() };
    const updatedChecklists = [newChecklist, ...savedChecklists];
    setSavedChecklists(updatedChecklists);
    localStorage.setItem('savedChecklists', JSON.stringify(updatedChecklists));
    showToast('Checklist saved!');
  };

  const handleDeleteChecklist = (id: number) => {
    if (window.confirm('Are you sure you want to delete this checklist?')) {
        const updatedChecklists = savedChecklists.filter(c => c.id !== id);
        setSavedChecklists(updatedChecklists);
        localStorage.setItem('savedChecklists', JSON.stringify(updatedChecklists));
        showToast('Checklist deleted.');
    }
  };

  const toggleItem = (key: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(key)) {
      newChecked.delete(key);
    } else {
      newChecked.add(key);
    }
    setCheckedItems(newChecked);
  };

  const progress = totalChecklistItems > 0 ? (checkedItems.size / totalChecklistItems * 100) : 0;

  const filteredPpeProducts = PPE_PRODUCTS.filter(product =>
    recommendedPpe.some(keyword =>
      product.keywords.some(pk => pk.includes(keyword))
    )
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <Navbar onThemeToggle={toggleTheme} isDarkMode={isDarkMode} onOpenSaved={() => setIsSavedModalOpen(true)} savedCount={savedChecklists.length}/>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <header className="text-center mb-10 animate-slide-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded-2xl mb-4 shadow-lg">
              <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">AI Safety Checklist Generator</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Generate comprehensive safety checklists in seconds.</p>
        </header>

        <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 animate-slide-in" style={{ animationDelay: '100ms' }}>
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="industry" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Industry / Environment *</label>
                <input
                  type="text"
                  id="industry"
                  value={industry}
                  onChange={(e) => { setIndustry(e.target.value); setValidationErrors(p => ({ ...p, industry: undefined })) }}
                  placeholder="e.g., Construction, Warehouse"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors bg-white dark:bg-slate-800 ${validationErrors.industry ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-amber-500'}`}
                  aria-invalid={!!validationErrors.industry}
                />
                {validationErrors.industry && <p className="mt-1 text-sm text-red-600">{validationErrors.industry}</p>}
              </div>
              <div>
                <label htmlFor="task" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Specific Task *</label>
                <input
                  id="task"
                  value={task}
                  onChange={(e) => { setTask(e.target.value); setValidationErrors(p => ({ ...p, task: undefined })) }}
                  placeholder="e.g., Welding steel beams"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors bg-white dark:bg-slate-800 ${validationErrors.task ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-amber-500'}`}
                  aria-invalid={!!validationErrors.task}
                />
                {validationErrors.task && <p className="mt-1 text-sm text-red-600">{validationErrors.task}</p>}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="equipment" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Equipment Involved (Optional)</label>
                <input
                  id="equipment" value={equipment} onChange={(e) => setEquipment(e.target.value)}
                  placeholder="e.g., Arc welder, Scaffolding"
                  className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-amber-500 focus:outline-none transition-colors bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label htmlFor="details" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Other Details (Optional)</label>
                <input
                  id="details" value={specificDetails} onChange={(e) => setSpecificDetails(e.target.value)}
                  placeholder="e.g., working at height"
                  className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-amber-500 focus:outline-none transition-colors bg-white dark:bg-slate-800"
                />
              </div>
            </div>
            <button
              onClick={generateChecklist}
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center"
            >
              {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...</> : 'Generate Safety Checklist'}
            </button>
          </div>
        </section>

        <section className="mt-8 text-center animate-slide-in" style={{ animationDelay: '200ms' }}>
            <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400">Or, start with an example:</h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {exampleScenarios.map((scenario) => (
                <button
                  key={scenario.title}
                  onClick={() => handleExampleClick(scenario)}
                  className="p-4 bg-white dark:bg-slate-800/50 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-md transition-all text-center transform hover:-translate-y-1"
                >
                  {scenario.icon}
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{scenario.title}</p>
                </button>
              ))}
            </div>
        </section>

        {error && (
          <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-500/30 rounded-lg animate-slide-in" role="alert">
            <div className="flex">
                <div className="flex-shrink-0"><AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" /></div>
                <div className="ml-3">
                    <h3 className="text-sm font-bold text-red-800 dark:text-red-200">{error.title}</h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">{error.message}</div>
                </div>
            </div>
          </div>
        )}

        {isLoading && (
          <section className="print-area mt-12 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 animate-slide-in">
              <div className="text-center py-12" role="status">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-amber-500" />
                <p className="mt-4 text-lg font-medium text-slate-700 dark:text-slate-300">{loadingMessage}</p>
                <p className="text-slate-500 dark:text-slate-400">AI is crafting your document, please wait.</p>
              </div>
          </section>
        )}

        {checklist && (
           <div className="animate-slide-in" style={{ animationDelay: '100ms' }}>
            <section id="checklist-content" ref={checklistRef} className="print-area mt-12 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Progress</span>
                        <span className="text-sm font-bold text-amber-600">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{task}</h2>
                    <div className="grid md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div><span className="font-semibold text-slate-600 dark:text-slate-400">Environment:</span> <span className="ml-2 text-slate-700 dark:text-slate-300">{industry}</span></div>
                        {equipment && <div><span className="font-semibold text-slate-600 dark:text-slate-400">Equipment:</span> <span className="ml-2 text-slate-700 dark:text-slate-300">{equipment}</span></div>}
                    </div>
                </div>
                <MarkdownRenderer text={checklist} checkedItems={checkedItems} onToggleItem={toggleItem} />
            </section>
            
            <div className="no-print mt-8 flex gap-4">
                <button onClick={handleSaveChecklist} className="flex-1 bg-slate-700 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"><Save size={18} /> Save</button>
                <button onClick={handleCopy} className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"><Copy size={18} /> Copy</button>
                <button onClick={handleExportPdf} className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"><FileDown size={18} /> PDF</button>
                <button onClick={handlePrint} className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"><Printer size={18} /> Print</button>
            </div>
           </div>
        )}
        
        {filteredPpeProducts.length > 0 && (
          <section className="no-print mt-12 animate-slide-in">
            <div className="text-center">
              <Package className="w-10 h-10 mx-auto text-amber-500" />
              <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Recommended PPE for Your Task</h2>
              <p className="mt-2 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
                Based on your checklist, we recommend the following safety equipment.
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

      <QuoteModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} product={selectedProduct} />
      <SavedChecklistsModal isOpen={isSavedModalOpen} onClose={() => setIsSavedModalOpen(false)} savedChecklists={savedChecklists} onDelete={handleDeleteChecklist}/>
      <Toast message={toastMessage} onDismiss={() => setToastMessage('')}/>
    </div>
  );
};

export default App;
