import React from 'react';
import { Shield, Settings, Zap, ChevronRight } from '../components/icons';

export const HomePage: React.FC = () => (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-40">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-soft -z-10" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-indigo-100 shadow-sm mb-8 animate-fade-in-up">
                    <span className="flex h-2 w-2 relative mr-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    <span className="text-sm font-medium text-gray-600">Melotwo Safety Inspector 2.0 is live</span>
                </div>
                
                <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl md:text-7xl mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    Secure your AI <br />
                    <span className="text-gradient">Before Deployment</span>
                </h1>
                
                <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    The complete platform to analyze, test, and ensure your Large Language Models operate within ethical and regulatory guardrails.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <a href="/inspector" className="btn-primary w-full sm:w-auto text-lg px-8">
                        Start Inspection
                    </a>
                    <a href="#" className="btn-secondary w-full sm:w-auto text-lg px-8">
                        View Demo
                    </a>
                </div>
            </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Everything you need for AI Governance</h2>
                    <p className="mt-4 text-xl text-gray-500">Comprehensive tools to manage risk in the age of generative AI.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="group p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-indigo-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Shield className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Proactive Defense</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Stop adversarial attacks before they happen. Our advanced shield technology intercepts malicious prompts instantly.
                        </p>
                    </div>

                    <div className="group p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-purple-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Settings className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Custom Policies</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Define your own safety parameters. Control exactly what your model can and cannot say with granular precision.
                        </p>
                    </div>

                    <div className="group p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-pink-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <div className="w-14 h-14 bg-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Zap className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Instant Analysis</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Get real-time risk scores on every interaction. Monitor toxicity levels and drift with our live dashboard.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    </div>
);
