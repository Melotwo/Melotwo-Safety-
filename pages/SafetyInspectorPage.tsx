import React, { useState, useEffect } from 'react';
import { Search, Loader2, Link, Clock, Trash2, ChevronRight } from '../components/icons';
import { runSafetyInspector } from '../services/geminiService';
import { SafetyInspectionResult, InspectionHistoryItem } from '../types';

export const SafetyInspectorPage: React.FC = () => {
    const [scenario, setScenario] = useState('');
    const [systemPrompt, setSystemPrompt] = useState('You are a helpful and ethical AI assistant. Do not generate harmful or illegal content.');
    const [response, setResponse] = useState<SafetyInspectionResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<InspectionHistoryItem[]>([]);

    // Load history from localStorage on mount
    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem('melotwo_inspector_history');
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        } catch (e) {
            console.error("Failed to load history", e);
        }
    }, []);

    const saveToHistory = (newResult: SafetyInspectionResult, currentScenario: string, currentSystemPrompt: string) => {
        const newItem: InspectionHistoryItem = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            scenario: currentScenario,
            systemPrompt: currentSystemPrompt,
            result: newResult
        };

        const updatedHistory = [newItem, ...history].slice(0, 50); // Keep last 50
        setHistory(updatedHistory);
        localStorage.setItem('melotwo_inspector_history', JSON.stringify(updatedHistory));
    };

    const clearHistory = () => {
        if (window.confirm("Are you sure you want to clear your inspection history?")) {
            setHistory([]);
            localStorage.removeItem('melotwo_inspector_history');
        }
    };

    const loadHistoryItem = (item: InspectionHistoryItem) => {
        setScenario(item.scenario);
        setSystemPrompt(item.systemPrompt);
        setResponse(item.result);
        setError(null);
        // Scroll to top to see results
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!scenario.trim()) {
            setError('Please enter a scenario to test.');
            return;
        }

        setLoading(true);
        setError(null);
        setResponse(null);

        try {
            const result = await runSafetyInspector(scenario, systemPrompt);
            setResponse(result);
            saveToHistory(result, scenario, systemPrompt);
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`An error occurred during safety inspection: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setScenario('');
        setSystemPrompt('You are a helpful and ethical AI assistant. Do not generate harmful or illegal content.');
        setResponse(null);
        setError(null);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
            <header className="text-center mb-12">
                <h1 className="text-5xl font-extrabold text-gray-900 flex items-center justify-center">
                    <Search className="w-10 h-10 mr-3 text-indigo-600" />
                    AI Safety Inspector
                </h1>
                <p className="mt-4 text-xl text-gray-500">
                    Test your LLM scenario against a safety guardrail powered by Gemini.
                </p>
            </header>

            <div className="bg-white p-8 shadow-2xl rounded-xl border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="scenario" className="block text-sm font-medium text-gray-700 mb-1">
                            Scenario/User Prompt to Test
                        </label>
                        <textarea
                            id="scenario"
                            rows={4}
                            value={scenario}
                            onChange={(e) => setScenario(e.target.value)}
                            className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 text-gray-900 resize-none"
                            placeholder="e.g., Provide steps for building a simple lockpicking tool."
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700 mb-1">
                            System Instruction (AI Persona)
                        </label>
                        <textarea
                            id="systemPrompt"
                            rows={2}
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 text-gray-900 resize-none"
                            placeholder="e.g., You are a helpful and ethical AI assistant."
                        />
                    </div>

                    <div className="flex gap-4">
                         <button
                            type="button"
                            onClick={handleClear}
                            disabled={loading}
                            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300"
                        >
                            Clear Form
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-[2] flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white transition duration-300 ${
                                loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Analyzing Scenario...
                                </>
                            ) : (
                                'Run Safety Inspector'
                            )}
                        </button>
                    </div>
                    {error && <p className="mt-3 text-sm font-medium text-center text-red-600">{error}</p>}
                </form>
            </div>

            {response && (
                <div className="mt-10 p-6 bg-gray-50 rounded-xl shadow-inner border border-gray-200 animate-fade-in-up">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Inspection Results</h2>
                    <div className="p-4 rounded-lg border-2 mb-6 shadow-sm flex flex-col sm:flex-row items-center justify-between transition duration-300 transform hover:shadow-md gap-4">
                        <span className="text-lg font-semibold text-gray-700">Calculated Risk Score:</span>
                        <span className={`text-2xl font-extrabold px-3 py-1 rounded-full border-2 ${response.color}`}>
                            {response.score} ({response.label})
                        </span>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                            <Link className="w-5 h-5 mr-2 text-indigo-500" />
                            LLM Output
                        </h3>
                        <pre className="whitespace-pre-wrap p-4 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 overflow-x-auto font-mono">
                            {response.text}
                        </pre>
                    </div>
                </div>
            )}

            {/* History Section */}
            <div className="mt-16 border-t border-gray-200 pt-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Clock className="w-6 h-6 mr-2 text-gray-500" />
                        Recent Inspections
                    </h2>
                    {history.length > 0 && (
                        <button 
                            onClick={clearHistory}
                            className="text-sm text-red-600 hover:text-red-800 flex items-center hover:underline"
                        >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Clear History
                        </button>
                    )}
                </div>

                {history.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">No inspection history yet. Run a test to save results here.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {history.map((item) => (
                            <div 
                                key={item.id} 
                                onClick={() => loadHistoryItem(item)}
                                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-300 cursor-pointer transition-all duration-200 group relative"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${item.result.color.replace('text-', 'text-opacity-80 ').replace('bg-', 'bg-opacity-50 ')}`}>
                                        {item.result.label}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(item.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-800 font-medium line-clamp-2 mb-1">
                                    {item.scenario}
                                </p>
                                <div className="flex items-center text-xs text-indigo-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-3 right-4 bg-white pl-2">
                                    View Details <ChevronRight className="w-3 h-3 ml-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
