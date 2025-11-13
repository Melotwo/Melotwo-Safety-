import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Loader2, Package, Save, AlertTriangle, ShieldCheck, Printer, FileDown, Copy } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Fix: Use relative paths for module imports to resolve module not found errors.
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
import MarkdownRenderer from './components/MarkdownRenderer.tsx';
import QuoteModal from './components/QuoteModal.tsx';
import SavedChecklistsModal from './components/SavedChecklistsModal.tsx';
import ProductCard from './components/ProductCard.tsx';
import Toast from './components/Toast.tsx';
import AiChatBot from './components/AiChatBot.tsx';
import QrCodeModal from './components/QrCodeModal.tsx';
import { PPE_PRODUCTS, exampleScenarios } from './constants.ts';
import { PpeProduct, SavedChecklist, ErrorState, ValidationErrors } from './types.ts';
import { getApiErrorState } from './services/errorHandler.ts';


const LOADING_MESSAGES = [
  'Assessing hazards...',
  'Compiling PPE recommendations...',
  'Finalizing procedure steps...',
  'Formatting your safety checklist...',
];

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
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
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
      // Adhere to API key guidelines by using process.env.API_KEY directly.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = `Act as a certified safety inspector. Your tone must be formal, professional, and authoritative. All responses must be structured as comprehensive safety checklists. At the end of every generated checklist, you MUST include the following disclaimer, formatted exactly as shown below:

---
***Disclaimer:** This checklist is AI-generated and for informational purposes only. It is not a substitute for professional safety advice. Always consult with a qualified safety professional to ensure compliance with local regulations and site-specific conditions.*`;

      const prompt = `
        Create a comprehensive safety checklist for the following scenario. The output must be in markdown format.

        **Scenario Details:**
        - **Industry/Environment:** ${industry}
        - **Specific Task:** ${task}
        - **Tools/Equipment Used:** ${equipment || 'Not specified'}
        - **Other Specific Details:** ${specificDetails || 'None'}

        The checklist should be broken down into logical sections using '##' for headings (e.g., ## Pre-Task Setup, ## During the Task, ## Post-Task Cleanup). Each item in the checklist should start with '* '.

        Based on the scenario, identify the top 4 most critical Personal Protective Equipment (PPE) items required. After generating the checklist, list the corresponding PPE product IDs from the following list in a separate section formatted EXACTLY as follows:

        ---
        **Recommended PPE IDs:** [ppe_id_1, ppe_id_2, ppe_id_3, ppe_id_4]
        ---

        Available PPE IDs:
        ${PPE_PRODUCTS.map(p => `- ${p.id}: ${p.name} (${p.keywords.join(', ')})`).join('\n')}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.3,
        },
      });

      const resultText = response.text;
      
      const ppeMatch = resultText.match(/\*\*Recommended PPE IDs:\*\*.*\[(.*)\]/);
      if (ppeMatch && ppeMatch[1]) {
        const ppeIds = ppeMatch[1].split(',').map(id => id.trim());
        setRecommendedPpe(ppeIds);
      }
      
      const checklistContent = resultText.split('---')[0].trim();
      const items = checklistContent.match(/^\s*\*\s/gm) || [];
      setTotalChecklistItems(items.length);
      setChecklist(checklistContent);

    } catch (e) {
      setError(getApiErrorState(e));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleChecklistItem = (key: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(key)) {
      newChecked.delete(key);
    } else {
      newChecked.add(key);
    }
    setCheckedItems(newChecked);
  };

  const completionPercentage = totalChecklistItems > 0 ? (checkedItems.size / totalChecklistItems) * 100 : 0;

  const handleGetQuote = (product: PpeProduct) => {
    setSelectedProduct(product);
    setIsQuoteModalOpen(true);
  };

  const saveChecklist = () => {
    if (!checklist) return;
    const title = `${industry}: ${task}`.substring(0, 50);
    const newChecklist: SavedChecklist = {
      id: Date.now(),
      title: title,
      content: checklist,
      savedAt: new Date().toLocaleDateString(),
    };
    const updatedChecklists = [newChecklist, ...savedChecklists];
    setSavedChecklists(updatedChecklists);
    localStorage.setItem('savedChecklists', JSON.stringify(updatedChecklists));
    showToast('Checklist saved successfully!');
  };

  const deleteChecklist = (id: number) => {
    const updatedChecklists = savedChecklists.filter(c => c.id !== id);
    setSavedChecklists(updatedChecklists);
    localStorage.setItem('savedChecklists', JSON.stringify(updatedChecklists));
    showToast('Checklist deleted.');
  };
  
  const downloadPdf = () => {
    const input = checklistRef.current;
    if (input) {
      const wasDark = document.documentElement.classList.contains('dark');
      if (wasDark) document.documentElement.classList.remove('dark');
  
      html2canvas(input, {
        scale: 2,
        backgroundColor: wasDark ? '#0f172a' : '#ffffff',
        useCORS: true,
        onclone: (doc) => {
          // FIX: Cast element to HTMLElement to access style property.
          doc.querySelectorAll('input[type=checkbox]').forEach(el => (el as HTMLElement).style.display = 'none');
          doc.querySelector('.print-area')?.classList.add('dark:bg-slate-900');
        }
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 10;
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        pdf.save('safety-checklist.pdf');
  
        if(wasDark) document.documentElement.classList.add('dark');
      });
    }
  };

  const copyToClipboard = () => {
    if (checklist) {
      navigator.clipboard.writeText(checklist)
        .then(() => showToast('Checklist copied to clipboard!'))
        .catch(err => console.error('Failed to copy: ', err));
    }
  };

  return (
    <div className={`flex flex-col min-h-screen font-sans antialiased ${isDarkMode ? 'dark' : ''}`}>
      <Navbar onThemeToggle={toggleTheme} isDarkMode={isDarkMode} onOpenSaved={() => setIsSavedModalOpen(true)} savedCount={savedChecklists.length} onOpenQrCode={() => setIsQrModalOpen(true)} />
      
      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <header className="text-center animate-slide-in" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            AI-Powered Safety Checklists
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
            Generate comprehensive job safety analyses in seconds. Describe your task, and let our AI identify hazards and recommend safety measures.
          </p>
        </header>

        <section aria-labelledby="checklist-generator" className="mt-12 bg-white dark:bg-slate-900/50 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 animate-slide-in" style={{ animationDelay: '0.2s' }}>
          <h2 id="checklist-generator" className="sr-only">Checklist Generator Form</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="industry" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Industry / Environment <span className="text-red-500">*</span></label>
              <input type="text" id="industry" value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g., Construction Site, Warehouse" aria-required="true" className="mt-1 block w-full px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-amber-500 focus:border-amber-500" />
              {validationErrors.industry && <p className="text-red-500 text-sm mt-1">{validationErrors.industry}</p>}
            </div>
            <div>
              <label htmlFor="task" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Specific Task <span className="text-red-500">*</span></label>
              <input type="text" id="task" value={task} onChange={e => setTask(e.target.value)} placeholder="e.g., Welding steel beams" aria-required="true" className="mt-1 block w-full px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-amber-500 focus:border-amber-500" />
              {validationErrors.task && <p className="text-red-500 text-sm mt-1">{validationErrors.task}</p>}
            </div>
            <div>
              <label htmlFor="equipment" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Tools / Equipment <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input type="text" id="equipment" value={equipment} onChange={e => setEquipment(e.target.value)} placeholder="e.g., Arc welder, forklift" className="mt-1 block w-full px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-amber-500 focus:border-amber-500" />
            </div>
            <div>
              <label htmlFor="details" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Other Details <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input type="text" id="details" value={specificDetails} onChange={e => setSpecificDetails(e.target.value)} placeholder="e.g., Working at height, windy" className="mt-1 block w-full px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-amber-500 focus:border-amber-500" />
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Or, try an example:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {exampleScenarios.map((scenario, index) => (
                <button key={index} onClick={() => handleExampleClick(scenario)} className="flex items-center text-left p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200">
                  {scenario.icon}
                  <span className="ml-3 font-semibold text-slate-700 dark:text-slate-300 text-sm">{scenario.title}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <button onClick={generateChecklist} disabled={isLoading} className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 px-8 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed">
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
              {isLoading ? 'Generating...' : 'Generate Safety Checklist'}
            </button>
          </div>
        </section>
        
        <div className="mt-12">
          {isLoading && (
            <div role="status" className="text-center p-8 bg-white dark:bg-slate-900/50 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
              <Loader2 className="mx-auto h-12 w-12 text-amber-500 animate-spin" />
              <p className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-200">Generating Your Checklist</p>
              <p className="mt-2 text-slate-500 dark:text-slate-400">{loadingMessage}</p>
            </div>
          )}
          
          {error && (
            <div role="alert" className="p-6 rounded-2xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50">
              <div className="flex items-start">
                <AlertTriangle className="h-6 w-6 text-red-500 dark:text-red-400 flex-shrink-0 mr-3 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-red-800 dark:text-red-200">{error.title}</h3>
                  <div className="text-red-700 dark:text-red-300 mt-2">{error.message}</div>
                </div>
              </div>
            </div>
          )}
          
          {checklist && (
            <section aria-labelledby="generated-checklist-heading" className="animate-slide-in" style={{ animationDelay: '0.1s' }}>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 id="generated-checklist-heading" className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Your Generated Checklist</h2>
                   <div className="mt-2 flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
                    <span className={`px-2 py-1 rounded-full text-xs mr-2 ${completionPercentage === 100 ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      {checkedItems.size} / {totalChecklistItems} Checked
                    </span>
                    <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden" role="progressbar" aria-valuenow={completionPercentage} aria-valuemin={0} aria-valuemax={100}>
                      <div className="h-full bg-amber-500" style={{ width: `${completionPercentage}%`, transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                </div>
                <div className="no-print flex items-center flex-wrap gap-2">
                  <button onClick={saveChecklist} className="action-button">
                    <Save size={16} className="mr-2" /> Save
                  </button>
                  <button onClick={() => window.print()} className="action-button">
                    <Printer size={16} className="mr-2" /> Print
                  </button>
                  <button onClick={downloadPdf} className="action-button">
                    <FileDown size={16} className="mr-2" /> PDF
                  </button>
                  <button onClick={copyToClipboard} className="action-button">
                    <Copy size={16} className="mr-2" /> Copy
                  </button>
                </div>
              </div>
              <div ref={checklistRef} className="print-area bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
                <MarkdownRenderer text={checklist} checkedItems={checkedItems} onToggleItem={handleToggleChecklistItem} />
              </div>
            </section>
          )}
          
          {recommendedPpe.length > 0 && (
            <section aria-labelledby="recommended-ppe-heading" className="mt-16 animate-slide-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3 mb-6">
                 <Package size={28} className="text-amber-500" />
                 <h2 id="recommended-ppe-heading" className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Recommended PPE</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendedPpe.map(ppeId => {
                  const product = PPE_PRODUCTS.find(p => p.id === ppeId);
                  return product ? <ProductCard key={product.id} product={product} onGetQuote={handleGetQuote} /> : null;
                })}
              </div>
            </section>
          )}
        </div>
      </main>
      
      <Footer />

      <QuoteModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} product={selectedProduct} />
      <SavedChecklistsModal 
        isOpen={isSavedModalOpen} 
        onClose={() => setIsSavedModalOpen(false)} 
        savedChecklists={savedChecklists}
        onDelete={deleteChecklist}
      />
      <QrCodeModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} />
      <Toast message={toastMessage} onDismiss={() => setToastMessage('')} />
      <AiChatBot />
    </div>
  );
};

export default App;
