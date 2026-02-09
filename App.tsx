
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Loader2, Check, Copy, Printer, FileDown, Save } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Fix module resolution errors by importing from functional source directory
import Navbar from './src/components/Navbar';
import Footer from './src/components/Footer';
import MarkdownRenderer from './src/components/MarkdownRenderer';
import QuoteModal from './src/components/QuoteModal';
import SavedChecklistsModal from './src/components/SavedChecklistsModal';
import ProductCard from './src/components/ProductCard';
import { PPE_PRODUCTS, exampleScenarios } from './src/constants';
import { PpeProduct, SavedChecklist } from './src/types';

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
      console.error("Failed to parse saved checklists", e);
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
      setError('Please fill in at least the Industry and Task fields.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setChecklist(null);
    setRecommendedPpe([]);
    setIsSaved(false);

    try {
      // Initialize Gemini API client correctly
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const systemInstruction = `You are a certified health and safety expert. Create a comprehensive, formal safety checklist. 
      Structure:
      ## Hazard Assessment
      ## Personal Protective Equipment (PPE)
      ## Safe Work Procedures
      ## Emergency Plan
      ## Post-Task Actions & Review
      
      At the end, add: "---PPE_KEYWORDS:[keyword1, keyword2]---" with singular lowercase terms.
      Mandatory disclaimer at bottom:
      ---
      ***Disclaimer:** This checklist is AI-generated and for informational purposes only. Consult with a professional for site-specific compliance.*`;

      // Use gemini-3-pro-preview for complex reasoning and safety precision
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Create a safety checklist for:\nEnvironment: ${industry}\nTask: ${task}\nEquipment: ${equipment || 'None'}`,
        config: {
          systemInstruction: systemInstruction,
        }
      });
      
      const fullText = response.text || '';

      const ppeMatch = fullText.match(/---PPE_KEYWORDS:\[(.*?)\]---/);
      let cleanedText = fullText;
      if (ppeMatch && ppeMatch[1]) {
        const keywords = ppeMatch[1].split(',').map(k => k.trim().toLowerCase());
        setRecommendedPpe(keywords);
        cleanedText = fullText.replace(/---PPE_KEYWORDS:\[(.*?)\]---/, '').trim();
      }

      setChecklist(cleanedText);
    } catch (err) {
      console.error("Error generating checklist:", err);
      setError('Failed to generate checklist. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (checklist) {
      navigator.clipboard.writeText(checklist).then(() => {
        alert('Checklist copied to clipboard!');
      });
    }
  };

  const handlePrint = () => window.print();

  const handleExportPdf = async () => {
    const element = document.getElementById('checklist-content');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('safety-checklist.pdf');
  };

  const openQuoteModal = (product: PpeProduct) => {
    setSelectedProduct(product);
    setIsQuoteModalOpen(true);
  };

  const handleSaveChecklist = () => {
    if (!checklist) return;
    const newChecklist: SavedChecklist = {
      id: Date.now(),
      title: `${industry} - ${task}`.substring(0, 50),
      content: checklist,
      savedAt: new Date().toLocaleDateString(),
    };
    const updated = [newChecklist, ...savedChecklists];
    setSavedChecklists(updated);
    localStorage.setItem('savedChecklists', JSON.stringify(updated));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleDeleteChecklist = (id: number) => {
    const updated = savedChecklists.filter(c => c.id !== id);
    setSavedChecklists(updated);
    localStorage.setItem('savedChecklists', JSON.stringify(updated));
  };

  const filteredPpeProducts = PPE_PRODUCTS.filter(product =>
    recommendedPpe.some(keyword => product.keywords.some(pk => pk.includes(keyword)))
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar onThemeToggle={toggleTheme} isDarkMode={isDarkMode} onOpenSaved={() => setIsSavedModalOpen(true)} savedCount={savedChecklists.length}/>

      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <header className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">AI Safety Checklist Generator</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
            Professional job-specific safety protocols generated in seconds.
          </p>
        </header>

        <section className="mt-12 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Industry / Environment</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g., Oil Rig, High-rise Construction"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Specific Task</label>
                <textarea
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="Describe the activity..."
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Equipment Involved</label>
                <textarea
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  placeholder="List tools or machinery..."
                  rows={7}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
          <button
            onClick={generateChecklist}
            disabled={isLoading}
            className="w-full mt-6 flex items-center justify-center py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
            {isLoading ? 'Generating...' : 'Generate Checklist'}
          </button>
        </section>

        <section className="mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {exampleScenarios.map((s) => (
              <button key={s.title} onClick={() => handleExampleClick(s)} className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-amber-500 transition-all text-left">
                <span className="text-2xl mb-2 block">{s.icon}</span>
                <span className="font-bold text-sm">{s.title}</span>
              </button>
            ))}
          </div>
        </section>

        {error && <div className="mt-8 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

        {checklist && (
          <section id="checklist-content" className="mt-12 bg-white dark:bg-slate-900 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6 no-print">
              <h2 className="text-2xl font-bold">Safety Checklist</h2>
              <div className="flex space-x-2">
                <button onClick={handleSaveChecklist} className={`p-2 rounded-lg ${isSaved ? 'bg-green-100 text-green-600' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {isSaved ? <Check size={20}/> : <Save size={20} />}
                </button>
                <button onClick={handleCopy} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg"><Copy size={20}/></button>
                <button onClick={handleExportPdf} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg"><FileDown size={20}/></button>
                <button onClick={handlePrint} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg"><Printer size={20}/></button>
              </div>
            </div>
            <MarkdownRenderer text={checklist} />
          </section>
        )}

        {filteredPpeProducts.length > 0 && (
          <section className="mt-12 no-print">
            <h2 className="text-2xl font-bold mb-6">Recommended PPE Gear</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredPpeProducts.map(p => (
                <ProductCard key={p.id} product={p} onGetQuote={openQuoteModal} />
              ))}
            </div>
          </section>
        )}
      </main>
      
      <Footer />
      <QuoteModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} product={selectedProduct} />
      <SavedChecklistsModal isOpen={isSavedModalOpen} onClose={() => setIsSavedModalOpen(false)} savedChecklists={savedChecklists} onDelete={handleDeleteChecklist}/>
    </div>
  );
};

export default App;
