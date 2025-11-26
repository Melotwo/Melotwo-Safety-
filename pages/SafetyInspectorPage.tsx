import React, { useState } from 'react';
import { Search, Loader2, Link } from '../components/icons';
import { runSafetyInspector } from '../services/geminiService';
import { SafetyInspectionResult } from '../types';

export const SafetyInspectorPage: React.FC = () => {
    const [scenario, setScenario] = useState('');
    const [systemPrompt, setSystemPrompt] = useState('You are a helpful and ethical AI assistant. Do not generate harmful or illegal content.');
    const [response, setResponse] = useState<SafetyInspectionResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                            Clear
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
                <div className="mt-10 p-6 bg-gray-50 rounded-xl shadow-inner border border-gray-200">
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
        </div>
    );
};
