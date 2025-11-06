import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Link, ChevronRight } from 'lucide-react';
import type { ChatMessage } from '../types';
import { getAiBotResponse } from '../services/geminiService';

const AiChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; } | null>(null);


  const chatBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
        // Set initial message if chat is opened for the first time
        if (messages.length === 0) {
            setMessages([
              { id: 'initial', role: 'model', text: 'Hello! I am the Melotwo AI assistant. How can I help you with SABS-certified products or safety standards today?' }
            ]);
        }
        // Get user's location for Maps grounding
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                console.warn("Could not get user location:", error.message);
            }
        );
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    chatBodyRef.current?.scrollTo(0, chatBodyRef.current.scrollHeight);
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (userInput.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', text: userInput };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = userInput;
    setUserInput('');
    setIsLoading(true);

    try {
      const modelResponse = await getAiBotResponse(currentInput, location);
      const modelMessage: ChatMessage = { 
        id: crypto.randomUUID(), 
        role: 'model', 
        text: modelResponse.text,
        sources: modelResponse.sources.length > 0 ? modelResponse.sources : undefined,
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = { id: crypto.randomUUID(), role: 'model', text: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading, location]);

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-orange-600 text-white rounded-full p-4 shadow-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-transform duration-200 ease-in-out hover:scale-110"
          aria-label="Toggle AI Chat"
        >
          {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
        </button>
      </div>

      <div
        className={`fixed bottom-20 right-5 z-50 w-[calc(100vw-2.5rem)] max-w-sm h-[70vh] max-h-[600px] bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900 rounded-t-lg">
          <div className="flex items-center">
            <Bot className="w-6 h-6 text-orange-600 mr-2" />
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Safety Assistant</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100">
            <X size={20} />
          </button>
        </header>

        <div ref={chatBodyRef} className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col items-start w-full">
                <div className={`flex items-start gap-3 w-full ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'model' && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white">
                        <Bot size={20} />
                        </div>
                    )}
                    <div className={`max-w-xs md:max-w-sm rounded-lg px-4 py-2 ${
                        msg.role === 'user' ? 'bg-orange-600 text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'
                    }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    {msg.role === 'user' && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300">
                        <User size={20} />
                        </div>
                    )}
                </div>
                 {msg.sources && msg.sources.length > 0 && msg.role === 'model' && (
                    <div className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 pl-11 w-full max-w-sm">
                        <h4 className="font-semibold mb-1 flex items-center gap-1.5">
                            <Link className="w-3 h-3"/>
                            Sources
                        </h4>
                        <ul className="space-y-1">
                            {msg.sources.map((source, index) => (
                                <li key={index} className="flex items-start">
                                <ChevronRight className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0 text-slate-400"/>
                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-orange-600 dark:text-orange-500 hover:underline truncate" title={source.uri}>
                                        {source.title}
                                </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
               <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white">
                  <Bot size={20} />
                </div>
              <div className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-4 py-2 rounded-bl-none">
                <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
              </div>
            </div>
          )}
        </div>

        <footer className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-b-lg">
          <div className="relative">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about PPE..."
              className="w-full pl-3 pr-12 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition bg-transparent dark:text-slate-200"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !userInput.trim()}
              className="absolute inset-y-0 right-0 flex items-center justify-center w-10 h-full text-slate-500 dark:text-slate-400 hover:text-orange-600 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </div>
        </footer>
      </div>
    </>
  );
};

export default AiChatBot;