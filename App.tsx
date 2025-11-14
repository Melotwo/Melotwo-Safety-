import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Package, Save, AlertTriangle, ShieldCheck, Printer, FileDown, Copy } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
import MarkdownRenderer from './components/MarkdownRenderer.tsx';
import QuoteModal from './components/QuoteModal.tsx';
import SavedChecklistsModal from './components/SavedChecklistsModal.tsx';
import ProductCard from './components/ProductCard.tsx';
import Toast from './components/Toast.tsx';
import AiChatBot from './components/AiChatBot.tsx';
import QrCodeModal from './components/QrCodeModal.tsx';
import MultiSelectDropdown from './components/MultiSelectDropdown.tsx';
import GenerationHistory from './components/GenerationHistory.tsx';
import { PPE_PRODUCTS, exampleScenarios, INDUSTRIES, TASKS_BY_INDUSTRY, EQUIPMENT_CATEGORIES } from './constants.ts';
import { PpeProduct, SavedChecklist, ErrorState, ValidationErrors, GenerationHistoryItem } from './types.ts';
import { getApiErrorState } from './services/errorHandler.ts';
import { generateChecklistFromApi } from './services/geminiService.ts';


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
  const [equipment, setEquipment] = useState<string[]>([]);
  const [specificDetails, setSpecificDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [checklist, setChecklist] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [recommendedPpe, setRecommendedPpe] = useState<string[]>([]);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PpeProduct | null>(null);
  const [savedChecklists, setSavedChecklists] = useState<SavedChecklist[]>([]);
  const [generationHistory, setGenerationHistory] = useState<GenerationHistoryItem[]>([]);
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
      const storedHistory = localStorage.getItem('generationHistory');
      if (storedHistory) {
        setGenerationHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to parse data from localStorage", e);
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

  const handleIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newIndustry = e.target.value;
    setIndustry(newIndustry);
    setTask(''); // Reset task when industry changes
  };

  const handleTaskTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTask(e.target.value);
  };

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
      const result = await generateChecklistFromApi({
        industry,
        task,
        equipment,
        specificDetails,
      });

      setRecommendedPpe(result.recommendedPpe);
      setTotalChecklistItems(result.totalChecklistItems);
      setChecklist(result.checklist);

      // Add to generation history
      const newHistoryItem: GenerationHistoryItem = {
        id: Date.now(),
        industry,
        task,
        equipment,
        specificDetails,
        timestamp: new Date().toLocaleString(),
      };
      setGenerationHistory(prev => {
        const updatedHistory = [newHistoryItem, ...prev].slice(0, 10);
        localStorage.setItem('generationHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
      });

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

  const handleHistoryItemClick = (item: GenerationHistoryItem) => {
    setIndustry(item.industry);
    setTask(item.task);
    setEquipment(item.equipment);
    setSpecificDetails(item.specificDetails);
    setChecklist(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    setGenerationHistory([]);
    localStorage.removeItem('generationHistory');
    showToast('Generation history cleared.');
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
              <select
                id="industry"
                value={industry}
                onChange={handleIndustryChange}
                aria-required="true"
                className="mt-1 block w-full px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="" disabled>Select an industry...</option>
                {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
              {validationErrors.industry && <p className="text-red-500 text-sm mt-1">{validationErrors.industry}</p>}
            </div>
            <div>
              <label htmlFor="task-type" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Task Type <span className="text-slate-400 font-normal">(Optional)</span></label>
              <select
                  id="task-type"
                  value={task}
                  onChange={handleTaskTypeChange}
                  disabled={!industry}
                  className="mt-1 block w-full px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-amber-500 focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <option value="" disabled>{industry ? 'Select a common task...' : 'Select industry first'}</option>
                  {(TASKS_BY_INDUSTRY[industry] || []).map(taskType => (
                      <option key={taskType} value={taskType}>{taskType}</option>
                  ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="task" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Specific Task Description <span className="text-red-500">*</span></label>
              <input type="text" id="task" value={task} onChange={e => setTask(e.target.value)} placeholder="e.g., Welding steel beams (or select a type above)" aria-required="true" className="mt-1 block w-full px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-amber-500 focus:border-amber-500" />
              {validationErrors.task && <p className="text-red-500 text-sm mt-1">{validationErrors.task}</p>}
            </div>
            <div className="md:col-span-2">
              <MultiSelectDropdown
                  options={EQUIPMENT_CATEGORIES}
                  selectedItems={equipment}
                  onChange={setEquipment}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="details" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Other Specific Details <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input type="text" id="details" value={specificDetails} onChange={e => setSpecificDetails(e.target.value)} placeholder="e.g., Working at height, windy..." className="mt-1 block w-full px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-amber-500 focus:border-amber-500" />
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Or try one of our examples:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {exampleScenarios.map(scenario => (
                <button key={scenario.title} onClick={() => handleExampleClick(scenario)} className="group text-left p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 border-2 border-slate-200 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-800 transition-all">
                  <div className="flex items-start gap-4">
                    <scenario.IconComponent className="w-8 h-8 text-amber-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-amber-700 dark:group-hover:text-amber-300">{scenario.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{scenario.task}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6 flex justify-center">
            <button
              onClick={generateChecklist}
              disabled={isLoading}
              className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-slate-900 bg-amber-500 border border-transparent rounded-lg shadow-sm hover:bg-amber-600 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-105 transition-transform"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <span>{loadingMessage}</span>
                </>
              ) : (
                'Generate Checklist'
              )}
            </button>
          </div>
        </section>
        
        <GenerationHistory
          history={generationHistory}
          onItemClick={handleHistoryItemClick}
          onClear={handleClearHistory}
        />

        {error && (
          <div role="alert" className="mt-8 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 animate-slide-in">
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 text-red-500 dark:text-red-400 flex-shrink-0 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">{error.title}</h3>
                <div className="text-sm text-red-700 dark:text-red-300 mt-1">{error.message}</div>
              </div>
            </div>
          </div>
        )}

        {checklist && !isLoading && (
          <section id="checklist-results" aria-live="polite" className="mt-12 animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <div className="bg-white dark:bg-slate-900/50 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                        <ShieldCheck className="w-7 h-7 mr-3 text-green-500" />
                        Your Safety Checklist
                    </h2>
                    <div className="flex items-center space-x-2">
                        <button onClick={saveChecklist} className="no-print p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="Save checklist">
                            <Save size={18} />
                        </button>
                        <button onClick={copyToClipboard} className="no-print p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="Copy checklist text">
                            <Copy size={18} />
                        </button>
                        <button onClick={downloadPdf} className="no-print p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="Download as PDF">
                            <FileDown size={18} />
                        </button>
                        <button onClick={() => window.print()} className="no-print p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="Print checklist">
                            <Printer size={18} />
                        </button>
                    </div>
                </div>

                <div className="p-2 sm:p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${completionPercentage}%`, transition: 'width 0.5s ease-in-out' }}></div>
                    </div>
                    <p className="text-xs text-right mt-1 text-slate-500 dark:text-slate-400">{Math.round(completionPercentage)}% Complete ({checkedItems.size}/{totalChecklistItems})</p>
                </div>

                <div ref={checklistRef} className="print-area p-4 sm:p-6 bg-white dark:bg-slate-900">
                    <MarkdownRenderer text={checklist} checkedItems={checkedItems} onToggleItem={handleToggleChecklistItem} />
                </div>
            </div>
          </section>
        )}

        {recommendedPpe.length > 0 && !isLoading && (
          <section className="mt-12 animate-slide-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center mb-6">
              <Package className="w-7 h-7 mr-3 text-amber-500" />
              Recommended PPE
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {PPE_PRODUCTS.filter(p => recommendedPpe.includes(p.id)).map(product => (
                <ProductCard key={product.id} product={product} onGetQuote={handleGetQuote} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />

      <QuoteModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} product={selectedProduct} />
      <SavedChecklistsModal isOpen={isSavedModalOpen} onClose={() => setIsSavedModalOpen(false)} savedChecklists={savedChecklists} onDelete={deleteChecklist} />
      <QrCodeModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} />
      <Toast message={toastMessage} onDismiss={() => setToastMessage('')} />
      <AiChatBot />
    </div>
  );
};

export default App;
