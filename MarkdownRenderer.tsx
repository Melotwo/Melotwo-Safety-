import React from 'react';
import { HardHat, AlertTriangle, ListChecks, Siren, Check, ClipboardCheck } from 'lucide-react';

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      {lines.map((line, index) => {
        if (line.startsWith('### ')) {
          return <h3 key={index} className="font-semibold text-lg mt-4 mb-2">{line.substring(4)}</h3>;
        }
        if (line.startsWith('## ')) {
          const title = line.substring(3).trim();
          const lowerCaseTitle = title.toLowerCase();
          let icon = null;

          if (lowerCaseTitle.includes('personal protective equipment')) {
            icon = <HardHat className="w-5 h-5 mr-3 text-slate-500 dark:text-slate-400 flex-shrink-0" />;
          } else if (lowerCaseTitle.includes('hazard assessment')) {
            icon = <AlertTriangle className="w-5 h-5 mr-3 text-slate-500 dark:text-slate-400 flex-shrink-0" />;
          } else if (lowerCaseTitle.includes('safe work procedure')) {
            icon = <ListChecks className="w-5 h-5 mr-3 text-slate-500 dark:text-slate-400 flex-shrink-0" />;
          } else if (lowerCaseTitle.includes('emergency plan')) {
            icon = <Siren className="w-5 h-5 mr-3 text-slate-500 dark:text-slate-400 flex-shrink-0" />;
          } else if (lowerCaseTitle.includes('post-task actions')) {
            icon = <ClipboardCheck className="w-5 h-5 mr-3 text-slate-500 dark:text-slate-400 flex-shrink-0" />;
          }
          
          return (
             <div key={index} className="border-b border-slate-200 dark:border-slate-700 mt-6 mb-3 pb-2">
                <div className="flex items-center">
                    {icon}
                    <h2 className="font-bold text-xl">{title}</h2>
                </div>
            </div>
          )
        }
        if (line.startsWith('* ')) {
          return (
            <div key={index} className="flex items-start my-2">
              <Check className="w-4 h-4 text-green-500 mr-3 mt-1 flex-shrink-0" />
              <span>{line.substring(2)}</span>
            </div>
          );
        }
        return <p key={index} className="text-slate-700 dark:text-slate-300">{line}</p>;
      })}
    </div>
  );
};

export default MarkdownRenderer;
