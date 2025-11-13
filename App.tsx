import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Loader2, Package, Check, Copy, Printer, FileDown, Save, AlertTriangle, ClipboardCheck } from 'lucide-react';
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

// Vite exposes environment variables prefixed with `VITE_` on the `import.meta.env` object.
const apiKey = import.meta.env.VITE_API_KEY;


// ========= MAIN APP COMPONENT =========
const App: React.FC = () => {
  // FIX: Per @google/genai guidelines, UI for API key configuration has been removed.
  // The application assumes the API key is correctly configured in the environment.

  const [industry, setIndustry] = useState('');
  const [task, setTask] = useState('');
  const [equipment, setEquipment] = useState('');
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

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  }

  const generateChecklist = async () => {
    if (!industry || !task) {
      setError({
        title: 'Missing Information',
        message: 'Please fill in at least the Industry/Environment and Task fields to generate a checklist.',
      });
      return;
    }
    setIsLoading(true);
    setError(null);
    setChecklist(null);
    setRecommendedPpe([]);

    try {
      if (!apiKey) {
        throw new Error("VITE_API_KEY is not configured.");
      }
      const ai = new GoogleGenAI({ apiKey: apiKey as string });
      
      const systemInstruction = `Act as a certified safety inspector who is meticulous and thorough. Emphasize the importance of following every step precisely. You are a certified health and safety expert with decades of experience in occupational safety. Your tone must be formal, professional, and authoritative. All responses must be structured as comprehensive safety checklists. At the end of every generated checklist, you MUST include the following disclaimer, formatted exactly as shown below:

---
***Disclaimer:** This checklist is AI-generated and for informational purposes only. It is not a substitute for professional safety advice. Always consult with a qualified safety professional to ensure compliance with local regulations and site-specific conditions.*`;

      const prompt = `
        Create a comprehensive safety checklist for the following scenario. The output must be in markdown format.

        **Scenario Details:**
        - **Industry/Environment:** ${industry}
        - **Specific Task:** ${task}
        - **Equipment Involved:** ${equipment || 'Not specified'}

        **Instructions:**
        1.  Structure the checklist into logical sections using '##' for main headings. The sections must be: "Hazard Assessment", "Personal Protective Equipment (PPE)", "Safe Work Procedures", "Emergency Plan", and "Post-Task Actions & Review".
        2.  The "Post-Task Actions & Review" section should include checklist items for site cleanup, equipment storage, incident reporting, and a final point prompting a review of the safety procedures for future improvements.
        3.  Under each section, use '*' for individual checklist items.
        4.  The language must be clear, concise, and actionable.
        5.  In the "Personal Protective Equipment (PPE)" section, identify and list the essential PPE required.
        6.  At the very end of the entire response, BEFORE the mandatory disclaimer, add a special marker line: "---PPE_KEYWORDS:[keyword1, keyword2, ...]---" where the keywords are simple, lowercase, singular terms for the recommended PPE (e.g., hard hat, goggles, gloves, boots).
      `;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
        }
      });
      
      let fullText = response.text;

      const ppeMatch = fullText.match(/---PPE_KEYWORDS:\[(.*?)\]---/);
      if (ppeMatch && ppeMatch[1]) {
        const keywords = ppeMatch[1].split(',').map(k => k.trim().toLowerCase());
        setRecommendedPpe(keywords);
      }
      
      // Always remove the special marker line from the text to be displayed.
      fullText = fullText.replace(/---PPE_KEYWORDS:\[(.*?)\]---/, '').trim();

      setChecklist(fullText);

    } catch (err) {
      console.error("Error generating checklist:", err);
      let errorState: ErrorState = {
        title: 'An Unexpected Error Occurred',
        message: 'Something went wrong. Please try again later. If the problem persists, check the console for more details.',
      };

      if (!navigator.onLine) {
        errorState = {
            title: 'Network Connection Lost',
            message: 'You appear to be offline. Please check your internet connection and try again.',
        };
      } else if (err instanceof Error) {
        const lowerCaseMessage = err.message.toLowerCase();
        if (lowerCaseMessage.includes('api key') || lowerCaseMessage.includes('vite_api_key')) {
          errorState = {
            title: 'API Key Issue',
            message: (
                <>
                    There appears to be a problem with the API key. Please try the following:
                    <ul className="list-disc list-inside mt-2 text-sm">
                        {/* FIX: Corrected malformed `code` tag which caused a JSX parsing error. */}
                        <li>Verify the <code>VITE_API_KEY</code> is set correctly in your hosting environment (e.g., Vercel, Netlify).</li>
                        <li>Ensure the key is valid and has not expired in your Google AI Studio dashboard.</li>
                        <li>Check if billing is enabled for your project if you are on a paid plan.</li>
                    </ul>
                </>
            )
          };
        } else if (lowerCaseMessage.includes('quota')) {
          errorState = {
            title: 'API Quota Exceeded',
            message: 'You have exceeded your usage quota for the Gemini API. Please check your account dashboard for details on usage limits and billing.',
          };
        } else if (lowerCaseMessage.includes('blocked')) {
          errorState = {
            title: 'Content Blocked',
            message: 'Your request was blocked due to safety policies. Please modify your input and try again. Avoid submitting sensitive or inappropriate content.',
          };
        } else if (lowerCaseMessage.includes('network') || lowerCaseMessage.includes('fetch')) {
          errorState = {
            title: 'Network Error',
            message: 'A network error occurred while communicating with the API. Please check your internet connection and firewall settings, then try again.',
          };
        }
      }
      
      setError(errorState);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (checklist && checklistRef.current) {
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
    const checklistElement = document.getElementById('checklist-content');
    if (!checklistElement) return;
    
    const canvas = await html2canvas(checklistElement, { 
      scale: 2,
      backgroundColor: isDarkMode ? '#020617' : '#ffffff',
    });

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
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-colors"
              />
            </div>
            <div>
              <label htmlFor="task" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Specific Task</label>
              <textarea
                id="task"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="e.g., Welding steel beams. You can use markdown for lists, bolding, etc."
                rows={3}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm resize-y transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="equipment" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Equipment Involved (Optional)</label>
              <textarea
                id="equipment"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                placeholder="e.g., Arc welder, Scaffolding. You can use markdown for lists, bolding, etc."
                rows={3}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm resize-y transition-colors"
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={generateChecklist}
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-semibold text-slate-900 bg-amber-500 hover:bg-amber-600 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:scale-[1.01] focus:scale-[1.01]"
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
                  className="p-4 bg-white dark:bg-slate-800/50 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-md transition-all text-center transform hover:-translate-y-1"
                >
                  {scenario.icon}
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{scenario.title}</p>
                </button>
              ))}
            </div>
        </section>

        {error && (
          <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-500/30 rounded-lg" role="alert">
            <div className="flex">
                <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-bold text-red-800 dark:text-red-200">{error.title}</h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                        {typeof error.message === 'string' ? <p>{error.message}</p> : error.message}
                    </div>
                </div>
            </div>
          </div>
        )}

        {(isLoading || checklist) && (
          <section id="checklist-content" ref={checklistRef} className="print-area mt-12 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
            {isLoading ? (
              <div className="text-center py-12" role="status">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-amber-500" />
                <p className="mt-4 text-lg font-medium text-slate-700 dark:text-slate-300">Generating your checklist...</p>
                <p className="text-slate-500 dark:text-slate-400">This may take a moment.</p>
              </div>
            ) : checklist && (
              <>
                <header className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Generated Safety Checklist</h2>
                    <p className="mt-1 text-slate-500 dark:text-slate-400 max-w-lg">{industry} &raquo; {task}</p>
                  </div>
                  <div className="no-print print:hidden flex items-center space-x-2">
                     <button onClick={handleSaveChecklist} title="Save Checklist" aria-label="Save Checklist" className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
                        <Save size={18} />
                     </button>
                    <button onClick={handleCopy} title="Copy to Clipboard" aria-label="Copy checklist to clipboard" className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"><Copy size={18} /></button>
                    <button onClick={handleExportPdf} title="Export as PDF" aria-label="Export checklist as PDF" className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"><FileDown size={18} /></button>
                    <button onClick={handlePrint} title="Print Checklist" aria-label="Print checklist" className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"><Printer size={18} /></button>
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
      <Toast message={toastMessage} />
    </div>
  );
};

export default App;
