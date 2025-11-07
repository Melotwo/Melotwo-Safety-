
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Link, ChevronRight, Mail, History, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { ChatMessage, EmailContent } from '../types';
import { getAiBotResponse, generateEmailDraft } from '../services/geminiService';
import EmailQuoteModal from './EmailQuoteModal';

const CHAT_HISTORY_KEY = 'melotwo-chat-history';
const MAX_HISTORY_MESSAGES = 10;

const AiChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const storedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      return storedHistory ? JSON.parse(storedHistory) : [];
    } catch (error) {
      console.error('Error loading chat history from localStorage:', error);
      return [];
    }
  });
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; } | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailContent, setEmailContent] = useState<EmailContent | null>(null);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);


  const chatBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Save to localStorage whenever messages change
    try {
      const isInitialMessageOnly = messages.length === 1 && messages[0].id === 'initial';
      if (messages.length > 0 && !isInitialMessageOnly) {
        const historyToSave = messages.slice(-MAX_HISTORY_MESSAGES);
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(historyToSave));
      }
    } catch (error) {
      console.error('Error saving chat history to localStorage:', error);
    }
  }, [messages]);


  useEffect(() => {
    if (isOpen) {
        // Set initial message if chat is opened and has no history
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
  }, [isOpen]);

  useEffect(() => {
    chatBodyRef.current?.scrollTo(0, chatBodyRef.current.scrollHeight);
  }, [messages]);

  const submitQuery = useCallback(async (query: string) => {
    if (query.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Update query history with the new query
    setQueryHistory(prevHistory => {
        const updatedHistory = [query, ...prevHistory.filter(q => q !== query)];
        return updatedHistory.slice(0, 5); // Keep the last 5 unique queries
    });

    try {
      const modelResponse = await getAiBotResponse(query, location);
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
  }, [isLoading, location]);

  const handleSendMessage = useCallback(() => {
      submitQuery(userInput);
      setUserInput('');
  }, [submitQuery, userInput]);
  
  const handleHistoryClick = useCallback((query: string) => {
      submitQuery(query);
  }, [submitQuery]);

  const handleRating = (messageId: string, rating: 'up' | 'down') => {
    setMessages(prevMessages =>
      prevMessages.map(msg => {
        if (msg.id === messageId) {
          const newRating = msg.rating === rating ? null : rating;
          // In a real application, you would send this feedback to your backend.
          console.log(`Feedback submitted for message ID ${messageId}:`, {
            text: msg.text,
            rating: newRating,
          });
          return { ...msg, rating: newRating };
        }
        return msg;
      })
    );
  };

  const handleGenerateEmail = async () => {
    if (isGeneratingEmail || messages.length < 2) return;
    setIsGeneratingEmail(true);
    const draft = await generateEmailDraft(messages);
    if (draft) {
        setEmailContent(draft);
        setIsEmailModalOpen(true);
    } else {
        const errorMessage: ChatMessage = { id: crypto.randomUUID(), role: 'model', text: 'Sorry, I was unable to generate an email draft. Please try again later.' };
        setMessages(prev => [...prev, errorMessage]);
    }
    setIsGeneratingEmail(false);
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-amber-500 text-white rounded-full p-4 shadow-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-transform duration-200 ease-in-out hover:scale-110"
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
            <Bot className="w-6 h-6 text-amber-500 mr-2" />
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
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white">
                        <Bot size={20} />
                        </div>
                    )}
                    <div className={`max-w-xs md:max-w-sm rounded-lg px-4 py-2 ${
                        msg.role === 'user' ? 'bg-amber-500 text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'
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
                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-500 hover:underline truncate" title={source.uri}>
                                        {source.title}
                                </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                 {msg.role === 'model' && msg.id !== 'initial' && (
                    <div className="mt-2 pl-11 flex items-center gap-2">
                        <button onClick={() => handleRating(msg.id, 'up')} className={`p-1 rounded-full transition-colors ${msg.rating === 'up' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`} aria-label="Good response">
                            <ThumbsUp size={14} />
                        </button>
                        <button onClick={() => handleRating(msg.id, 'down')} className={`p-1 rounded-full transition-colors ${msg.rating === 'down' ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`} aria-label="Bad response">
                            <ThumbsDown size={14} />
                        </button>
                    </div>
                )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
               <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white">
                  <Bot size={20} />
                </div>
              <div className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-4 py-2 rounded-bl-none">
                <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
              </div>
            </div>
          )}
        </div>

        <footer className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-b-lg">
          {queryHistory.length > 0 && (
            <div className="mb-3 px-1">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center">
                    <History size={14} className="mr-1.5"/>
                    Recent Queries
                </h4>
                <div className="flex flex-wrap gap-2">
                    {queryHistory.map((query, index) => (
                        <button
                            key={index}
                            onClick={() => handleHistoryClick(query)}
                            disabled={isLoading}
                            className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full hover:bg-amber-100 dark:hover:bg-amber-500/20 hover:text-amber-700 dark:hover:text-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={`Re-submit: "${query}"`}
                        >
                            {query}
                        </button>
                    ))}
                </div>
            </div>
          )}
          <div className="relative">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about PPE..."
              className="w-full pl-3 pr-24 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition bg-transparent dark:text-slate-200"
              disabled={isLoading || isGeneratingEmail}
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
                <button
                    onClick={handleGenerateEmail}
                    disabled={isGeneratingEmail || messages.length < 2}
                    className="flex items-center justify-center h-full w-10 text-slate-500 dark:text-slate-400 hover:text-amber-500 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                    aria-label="Generate email draft"
                    title="Generate email draft from conversation"
                >
                    {isGeneratingEmail ? <Loader2 size={20} className="animate-spin" /> : <Mail size={20} />}
                </button>
                 <div className="h-2/3 self-center border-l border-slate-300 dark:border-slate-600"></div>
                <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !userInput.trim()}
                    className="flex items-center justify-center h-full w-12 text-slate-500 dark:text-slate-400 hover:text-amber-500 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                    aria-label="Send message"
                >
                    <Send size={20} />
                </button>
            </div>
          </div>
        </footer>
      </div>
      <EmailQuoteModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        emailContent={emailContent}
      />
    </>
  );
};

export default AiChatBot;
