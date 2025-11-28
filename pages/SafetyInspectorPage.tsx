import React, { useState, useEffect } from 'react';
import { Search, Loader2, Link, Clock, Trash2, AlertTriangle, FileText, Zap, Settings } from '../components/icons';
import { runSafetyInspector } from '../services/geminiService';
import { SafetyInspectionResult, InspectionHistoryItem } from '../types';
import { INSPECTOR_TEMPLATES } from '../constants';

export const SafetyInspectorPage: React.FC = () => {
    // State initialization
    const [scenario, setScenario] = useState(() => localStorage.getItem('melotwo_inspector_scenario_draft') || '');
    const [systemPrompt, setSystemPrompt] = useState(() => localStorage.getItem('melotwo_inspector_system_prompt_draft') || 'You are a helpful and ethical AI assistant. Do not generate harmful or illegal content.');
    const [response, setResponse] = useState<SafetyInspectionResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<InspectionHistoryItem[]>([]);
    const [historySearchTerm, setHistorySearchTerm] = useState('');

    // Effects
    useEffect(() => { localStorage.setItem('melotwo_inspector_scenario_draft', scenario); }, [scenario]);
    useEffect(() => { localStorage.setItem('melotwo_inspector_system_prompt_draft', systemPrompt); }, [systemPrompt]);
    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem('melotwo_inspector_history');
            if (savedHistory) setHistory(JSON.parse(savedHistory));
        } catch (e) { console.error(e); }
    }, []);

    // Handlers
    const saveToHistory = (newResult: SafetyInspectionResult, currentScenario: string, currentSystemPrompt: string) => {
        const newItem: InspectionHistoryItem = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            scenario: currentScenario,
            systemPrompt: currentSystemPrompt,
            result: newResult
        };
        const updatedHistory = [newItem, ...history].slice(0, 50);
        setHistory(updatedHistory);
        localStorage.setItem('melotwo_inspector_history', JSON.stringify(updatedHistory));
    };

    const loadHistoryItem = (item: InspectionHistoryItem) => {
        setScenario(item.scenario);
        setSystemPrompt(item.systemPrompt);
        setResponse(item.result);
        setError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const template = INSPECTOR_TEMPLATES.find(t => t.id === e.target.value);
        if (template) {
            setScenario(template.scenario);
            setSystemPrompt(template.systemPrompt);
            setError(null);
            setResponse(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!scenario.trim()) { setError('Please enter a scenario.'); return; }
        setLoading(true); setError(null);
        
        setResponse({ text: '', score: '...', label: 'Analyzing...', color: 'text-gray-500 bg-gray-100 border-gray-500' });

        try {
            const finalResult = await runSafetyInspector(scenario, systemPrompt, (streamedText) => {
                setResponse(prev => prev ? { ...prev, text: streamedText } : null);
            });
            setResponse(finalResult);
            saveToHistory(finalResult, scenario, systemPrompt);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
            setResponse(null);
        } finally {
            setLoading(false);
        }
    };

    const filteredHistory = history.filter(item => 
        item.scenario.toLowerCase().includes(historySearchTerm.toLowerCase()) || 
        item.result.label.toLowerCase().includes(historySearchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">AI Safety Inspector</h1>
                <p className="mt-3 text-lg text-gray-500">Simulate adversarial attacks, verify guardrails, and audit model responses.</p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Input Form */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                            <h2 className="font-semibold text-gray-900 flex items-center">
                                <Settings className="w-5 h-5 mr-2 text-indigo-500"/> Configuration
                            </h2>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Load Template</label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        <select onChange={handleTemplateChange} defaultValue="" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer hover:bg-white hover:border-gray-300">
                                            <option value="" disabled>Select a predefined scenario...</option>
                                            {INSPECTOR_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">User Prompt / Scenario</label>
                                    <textarea 
                                        value={scenario}
                                        onChange={(e) => setScenario(e.target.value)}
                                        rows={5}
                                        className="input-field resize-none"
                                        placeholder="e.g. Write a phishing email pretending to be IT support..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">System Instructions (Guardrail)</label>
                                    <textarea 
                                        value={systemPrompt}
                                        onChange={(e) => setSystemPrompt(e.target.value)}
                                        rows={3}
                                        className="input-field resize-none"
                                        placeholder="Define the AI's persona and safety constraints..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => { setScenario(''); setResponse(null); setError(null); }} className="btn-secondary px-5 py-2.5 text-sm">Clear</button>
                                    <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5 text-sm">
                                        {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Zap className="w-5 h-5 mr-2" />}
                                        {loading ? 'Running Analysis...' : 'Run Inspector'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* History Panel */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-[400px]">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900 flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-indigo-500"/> Recent Tests
                            </h3>
                            {history.length > 0 && (
                                <button 
                                    onClick={() => { if(confirm('Clear history?')) {setHistory([]); localStorage.removeItem('melotwo_inspector_history');}}} 
                                    className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                                    title="Clear History"
                                >
                                    <Trash2 className="w-4 h-4"/>
                                </button>
                            )}
                        </div>
                        
                        <div className="p-4 border-b border-gray-100 bg-white">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search past results..." 
                                    value={historySearchTerm} 
                                    onChange={e => setHistorySearchTerm(e.target.value)} 
                                    className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {history.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                                    <Clock className="w-8 h-8 mb-2 opacity-20" />
                                    <p className="text-sm">No tests run yet.</p>
                                </div>
                            ) : (
                                filteredHistory.map(item => (
                                    <div key={item.id} onClick={() => loadHistoryItem(item)} className="p-3 rounded-xl border border-transparent hover:border-indigo-100 hover:bg-indigo-50/50 cursor-pointer transition-all group">
                                        <div className="flex justify-between items-start mb-1.5">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.result.color.replace('text-', 'text-opacity-90 ').replace('bg-', 'bg-opacity-60 ')}`}>
                                                {item.result.label}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-mono">{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <p className="text-xs text-gray-600 line-clamp-2 font-medium group-hover:text-indigo-900 transition-colors">{item.scenario}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Results */}
                <div className="lg:col-span-7">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6 flex items-start animate-fade-in-up shadow-sm">
                            <div className="p-2 bg-red-100 rounded-lg mr-4">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-red-900 font-bold mb-1">Analysis Failed</h3>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    {!response && !error && (
                        <div className="h-[600px] flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                            <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                                <Zap className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Inspect</h3>
                            <p className="text-gray-500 max-w-sm text-center">Select a template from the left or enter your own custom prompt to test the model's safety guardrails.</p>
                        </div>
                    )}

                    {response && (
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up ring-1 ring-black/5">
                            {/* Result Header */}
                            <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Analysis Report</h2>
                                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                                        <Zap className="w-3 h-3 mr-1 text-indigo-500" /> Powered by Gemini 2.5 Flash
                                    </p>
                                </div>
                                <div className={`flex items-center px-6 py-3 rounded-2xl border ${response.color} bg-white shadow-sm`}>
                                    <div className="text-center mr-6">
                                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-0.5">Risk Score</div>
                                        <div className="text-2xl font-black tracking-tight">{response.score}</div>
                                    </div>
                                    <div className="h-10 w-px bg-current opacity-10 mr-6"></div>
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-0.5">Assessment</div>
                                        <div className="text-lg font-bold whitespace-nowrap">{response.label}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Result Body */}
                            <div className="p-8">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2.5"></div>
                                    Model Response / Analysis
                                </h3>
                                <div className="bg-slate-900 rounded-2xl p-6 shadow-inner overflow-hidden relative group">
                                    <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(response.text)}
                                            className="text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                    <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto custom-scrollbar">
                                        {response.text}
                                        {loading && <span className="inline-block w-2 h-4 ml-1 bg-indigo-400 animate-pulse align-middle"/>}
                                    </pre>
                                </div>
                                
                                <div className="mt-6 flex items-center justify-end">
                                    <p className="text-xs text-gray-400 italic">
                                        * This analysis is AI-generated and may occasionally produce inaccurate results.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
