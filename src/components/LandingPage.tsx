import React, { useState } from 'react';
import { ChefHat, Check, ArrowRight, Star, Clock, Brain, Zap, Quote, ChevronDown, ChevronUp, HelpCircle, Heart, AlignLeft, Sparkles, Share2, Linkedin, Twitter } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleShare = (platform: 'linkedin' | 'twitter') => {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent("Just launched CaterPro AI! It writes catering proposals and shopping lists automatically. Check it out:");
      
      if (platform === 'linkedin') {
          window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${text}%20${url}`, '_blank');
      } else {
          window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
      }
  };

  const faqs = [
    {
      question: "Is CaterPro AI really free to try?",
      answer: "Yes! You can generate your first 3 menus completely for free. No credit card required. We want you to see how much stress this saves you before you commit."
    },
    {
      question: "I struggle with spelling and formatting. Will this help?",
      answer: "100%. That is exactly why we built it. You don't need to worry about typos or making the layout look pretty. The AI does all the writing, spelling, and formatting for you automatically."
    },
    {
      question: "Can I use this for complex dietary requirements?",
      answer: "Absolutely. Whether it's Gluten-Free, Vegan, Halal, or specific hospital diets (Renal, Diabetic), our AI adjusts the entire menu and shopping list automatically."
    },
    {
      question: "Does it work on my phone?",
      answer: "Yes! CaterPro AI is designed to be used in the kitchen, on the go, or in the office. It works perfectly on your mobile phone."
    }
  ];

  const testimonials = [
    {
      name: "Chef Marcus",
      role: "Private Chef",
      text: "I used to spend my Sundays staring at a blank screen, anxious about writing proposals. Now I get them done in 10 minutes. It's a lifesaver.",
      stars: 5
    },
    {
      name: "Sarah J.",
      role: "Catering Owner",
      text: "I have ADHD and the admin side of my business was drowning me. CaterPro AI handles the boring stuff so I can focus on the food.",
      stars: 5
    },
    {
      name: "David K.",
      role: "Event Planner",
      text: "The shopping list feature alone is worth it. It breaks everything down by aisle. No more forgotten ingredients.",
      stars: 5
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* --- HERO SECTION --- */}
      <div className="relative overflow-hidden pt-16 pb-12 lg:pt-24 lg:pb-24">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-sm font-semibold mb-6 animate-fade-in border border-amber-200 dark:border-amber-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span>Public Beta</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
              You are a Chef. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-emerald-400">
                Not a Typist.
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0">
              The AI assistant designed for chefs who hate paperwork. Generate menus, shopping lists, and proposals in seconds—without the admin anxiety.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={onGetStarted}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-primary-600 rounded-full shadow-lg hover:bg-primary-700 hover:shadow-xl hover:scale-105 transition-all"
              >
                Write My Menu For Me
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button 
                onClick={onGetStarted}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-slate-700 dark:text-white bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                See How It Works
              </button>
            </div>
            <p className="mt-6 text-sm text-slate-500 dark:text-slate-400 font-medium">
              <span className="text-green-500 font-bold text-lg mr-1">✓</span> No credit card needed &bull; <span className="text-green-500 font-bold text-lg mx-1">✓</span> ADHD Friendly
            </p>
          </div>
          
          <div className="lg:w-1/2 mt-12 lg:mt-0 relative">
             <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl"></div>
             <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl"></div>
             {/* Abstract representation of "Paperwork vs Cooking" */}
             <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform rotate-1 hover:rotate-0 transition-duration-500">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="text-xs font-mono text-slate-400">proposal_final_v3.pdf</div>
                </div>
                <div className="p-8">
                    <div className="space-y-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse delay-75"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 animate-pulse delay-150"></div>
                        <div className="flex gap-4 mt-8">
                             <div className="flex-1 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg">
                                 <Check className="w-8 h-8 text-green-500 mb-2" />
                                 <p className="font-bold text-slate-800 dark:text-slate-200">Spelling Checked</p>
                             </div>
                             <div className="flex-1 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
                                 <AlignLeft className="w-8 h-8 text-blue-500 mb-2" />
                                 <p className="font-bold text-slate-800 dark:text-slate-200">Formatted</p>
                             </div>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* --- FOUNDER STORY SECTION (Personal Connection) --- */}
      <div className="bg-slate-900 text-white py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
             <ChefHat className="absolute -left-10 top-20 w-64 h-64 transform -rotate-12 text-slate-800" />
             <Brain className="absolute -right-10 bottom-20 w-64 h-64 transform rotate-12 text-slate-800" />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/3 relative group">
                    <div className="absolute inset-0 bg-primary-600 rounded-xl transform translate-x-3 translate-y-3 -z-10 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform"></div>
                    <img 
                        src="/founder.jpg"
                        onError={(e) => {
                            const target = e.currentTarget;
                            // Fallback logic: Try PNG, then Stock
                            if (target.src.endsWith('founder.jpg')) {
                                target.src = "/founder.png";
                            } else {
                                target.src = "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=80";
                            }
                        }}
                        alt="Chef Tumi" 
                        className="rounded-xl shadow-2xl border-slate-700 transform -rotate-2 hover:rotate-0 transition-transform duration-500 w-full object-cover aspect-[3/4]"
                    />
                </div>
                <div className="md:w-2/3">
                    <div className="inline-block px-4 py-1 rounded-full bg-primary-600 text-white text-xs font-bold tracking-wider mb-6">THE FOUNDER'S STORY</div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                        "I built this because I hated the paperwork."
                    </h2>
                    <div className="space-y-4 text-slate-300 text-lg leading-relaxed">
                        <p>
                            Growing up with <strong>Epilepsy, ADHD, and Dyslexia</strong>, school was always a battle. I found my home in the kitchen, where I could create with my hands and my tastebuds, not a pen and paper.
                        </p>
                        <p>
                            But as I advanced in my career, the "admin" work started piling up. Writing proposals, checking spelling, formatting menus—it was my nightmare. I'd procrastinate for days just to avoid opening a Word document.
                        </p>
                        <p>
                            I knew there had to be a better way. I built <strong>CaterPro AI</strong> for chefs like us. It does the writing, the math, and the formatting so we can stay where we belong: <strong>in the kitchen.</strong>
                        </p>
                    </div>
                    <div className="mt-8 pt-8 border-t border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-500">
                                <img 
                                    src="/founder.jpg"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    alt="Chef Tumi" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <p className="font-bold text-white">Chef Tumi</p>
                                <p className="text-slate-400 text-sm">Founder & Developer</p>
                            </div>
                         </div>
                         <div className="flex gap-2">
                            <button onClick={() => handleShare('linkedin')} className="flex items-center gap-2 px-4 py-2 bg-[#0077b5] text-white rounded-lg hover:bg-[#006097] transition-colors text-sm font-bold">
                                <Linkedin size={16} /> Share
                            </button>
                            <button onClick={() => handleShare('twitter')} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-bold">
                                <Twitter size={16} /> Post
                            </button>
                         </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* --- PAIN POINT SECTION (ADHD Focused) --- */}
      <div className="bg-white dark:bg-slate-950 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Does this sound familiar?
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
               The admin struggle is real. We fix it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
              <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm text-red-500 text-2xl">
                 🤯
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Blank Screen Paralysis</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Staring at a blinking cursor for 45 minutes, unable to start writing that quote for the wedding client.
              </p>
            </div>

            <div className="p-8 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
              <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm text-red-500 text-2xl">
                 📝
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">The "Spelling Fear"</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Worrying that a typo in "Hors d'oeuvres" or "Prosciutto" makes you look unprofessional to high-end clients.
              </p>
            </div>

            <div className="p-8 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
              <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm text-red-500 text-2xl">
                 😵‍💫
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Admin Overload</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Spending your one day off doing paperwork instead of resting or experimenting with new recipes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- SOLUTION SECTION --- */}
      <div className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                    How CaterPro AI saves your sanity
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <Zap className="w-10 h-10 text-amber-500 mb-4" />
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Instant Drafts</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Input "Wedding for 50, Italian Theme" and get a full menu in 10 seconds.</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <Check className="w-10 h-10 text-green-500 mb-4" />
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Perfect Spelling</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">The AI handles all the culinary terminology. No more Googling how to spell "Bourguignon".</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <AlignLeft className="w-10 h-10 text-blue-500 mb-4" />
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Auto-Formatting</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">It generates a clean, professional PDF layout automatically. No fighting with Word margins.</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <Heart className="w-10 h-10 text-red-500 mb-4" />
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Less Stress</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Reclaim your weekends. Get the paperwork done on the fly, straight from your phone.</p>
                </div>
            </div>
        </div>
      </div>
      
      {/* --- TESTIMONIALS --- */}
      <div className="bg-white dark:bg-slate-950 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Join the Kitchen Revolution</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((t, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 relative hover:shadow-lg transition-shadow">
                        <Quote className="absolute top-4 right-4 text-slate-200 dark:text-slate-800 w-10 h-10" />
                        <div className="flex text-amber-400 mb-4">
                            {[...Array(t.stars)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 italic mb-6 relative z-10 leading-relaxed">"{t.text}"</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center font-bold text-slate-600">{t.name.charAt(0)}</div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">{t.name}</p>
                                <p className="text-xs text-slate-500 uppercase tracking-wide">{t.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
      
      {/* --- FAQ SECTION --- */}
      <div className="bg-slate-50 dark:bg-slate-900 py-16 sm:py-24">
         <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                    <HelpCircle className="w-8 h-8 text-primary-500" />
                    Common Questions
                </h2>
            </div>
            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
                        <button 
                            onClick={() => toggleFaq(index)}
                            className="w-full flex justify-between items-center p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                            <span className="font-bold text-slate-900 dark:text-white">{faq.question}</span>
                            {openFaq === index ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
                        </button>
                        {openFaq === index && (
                            <div className="p-4 text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 animate-fade-in bg-slate-50/50 dark:bg-slate-800/50">
                                {faq.answer}
                            </div>
                        )}
                    </div>
                ))}
            </div>
         </div>
      </div>

      {/* --- CTA SECTION --- */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-black dark:to-slate-900 py-24 relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
         <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">Ready to stop stressing over menus?</h2>
            <p className="text-slate-300 mb-10 text-xl max-w-2xl mx-auto">Join the chefs who have traded their keyboards for knives. Give the AI a try today.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                    onClick={onGetStarted}
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-slate-900 bg-primary-500 rounded-full shadow-lg hover:bg-primary-400 transition-all transform hover:scale-105"
                >
                    Start Your Free Trial
                </button>
            </div>
            <p className="mt-6 text-sm text-slate-500">No credit card required • Cancel anytime</p>
         </div>
      </div>

    </div>
  );
};

export default LandingPage;
