import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { MessageSquare, Send, X, Bot, User, AlertTriangle } from 'lucide-react';
// Fix: Use relative paths for imports to resolve module loading errors.
import { Message, ErrorState } from '../types.ts';
import { getApiErrorState } from '../services/errorHandler.ts';

const AiChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'model',
            content: "Hello! I'm your AI Safety Assistant. How can I help you with safety protocols or checklist questions today?",
        }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<ErrorState | null>(null);

    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);
    
    const initializeChat = () => {
        try {
            // Fix: Adhere to API key guidelines by using process.env.API_KEY directly.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            chatRef.current = ai.chats.create({
              model: 'gemini-2.5-flash',
              config: {
                systemInstruction: 'You are a friendly and professional AI Safety Assistant. Your primary role is to answer questions about workplace safety, clarify safety checklist items, and provide information on safety protocols. Keep your answers concise, helpful, and easy to understand. Do not generate checklists, only answer questions about them.',
              },
            });
        } catch (e) {
            console.error("Failed to initialize chat:", e);
            setError(getApiErrorState(e));
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = userInput.trim();
        if (!trimmedInput || isLoading) return;

        setError(null);
        setMessages(prev => [...prev, { role: 'user', content: trimmedInput }]);
        setUserInput('');
        setIsLoading(true);

        if (!chatRef.current) {
            initializeChat();
        }

        if (!chatRef.current) {
             setIsLoading(false);
             setError({
                 title: "Initialization Failed",
                 message: "Chat could not be initialized. Please check your API Key configuration and try again."
             });
             return;
        }

        try {
            const responseStream = await chatRef.current.sendMessageStream({ message: trimmedInput });
            
            let currentResponse = '';
            setMessages(prev => [...prev, { role: 'model', content: '' }]);

            for await (const chunk of responseStream) {
                currentResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    if (newMessages.length > 0) {
                      newMessages[newMessages.length - 1] = {...newMessages[newMessages.length-1], content: currentResponse};
                    }
                    return newMessages;
                });
            }

        } catch (err) {
            setError(getApiErrorState(err));
            // Remove the optimistic model response placeholder on error
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };
    
    return (
        <>
            <div className="no-print fixed bottom-6 right-6 z-40">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-amber-500 text-slate-900 rounded-full p-4 shadow-lg hover:bg-amber-600 transition-transform transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500"
                    aria-label={isOpen ? "Close chat" : "Open chat"}
                >
                    {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
                </button>
            </div>
            
            {isOpen && (
                <div role="dialog" aria-labelledby="chat-heading" className="no-print fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] max-w-sm h-[60vh] max-h-[700px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col animate-slide-in">
                    <header className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Bot className="w-6 h-6 text-amber-500" />
                           <h2 id="chat-heading" className="text-lg font-semibold text-slate-900 dark:text-white">AI Safety Assistant</h2>
                        </div>
                    </header>

                    <div className="flex-grow p-4 overflow-y-auto space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                {msg.role === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center"><Bot className="w-5 h-5 text-slate-500" /></div>}
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                                    msg.role === 'user'
                                        ? 'bg-amber-500 text-slate-900 rounded-br-none'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                                }`}>
                                    {msg.content}
                                </div>
                                {msg.role === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center"><User className="w-5 h-5 text-white" /></div>}
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center"><Bot className="w-5 h-5 text-slate-500" /></div>
                                <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none flex items-center space-x-1">
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-[pulse_1s_ease-in-out_infinite]"></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-[pulse_1s_ease-in-out_0.2s_infinite]"></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-[pulse_1s_ease-in-out_0.4s_infinite]"></span>
                                </div>
                            </div>
                        )}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30">
                                <div className="flex items-start">
                                    <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0 mr-2" />
                                    <div>
                                        <p className="text-sm font-semibold text-red-800 dark:text-red-200">{error.title}</p>
                                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error.message}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <footer className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-700">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="Ask a question..."
                                disabled={isLoading}
                                className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-full focus:border-amber-500 focus:outline-none transition-colors bg-white dark:bg-slate-800 disabled:opacity-60"
                                aria-label="Your message"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !userInput.trim()}
                                className="bg-amber-500 text-slate-900 rounded-full p-3 shadow-sm hover:bg-amber-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                aria-label="Send message"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </footer>
                </div>
            )}
        </>
    );
};

export default AiChatBot;
