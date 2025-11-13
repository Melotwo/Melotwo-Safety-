import React from 'react';

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  const elements: React.ReactNode[] = [];
  // Defensive check in case text is not a string
  const lines = typeof text === 'string' ? text.split('\n') : [];
  let currentList: React.ReactNode[] = [];

  const parseInline = (line: string): React.ReactNode => {
    // Regex to find ***word*** (bold+italic), **word** (bold), and *word* (italic)
    const parts = line.split(/(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('***') && part.endsWith('***')) {
        return <strong key={index}><em className="font-semibold">{part.slice(3, -3)}</em></strong>;
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-slate-900 dark:text-slate-100">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="space-y-3 list-none pl-2 mb-4">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, i) => {
    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={i} className="text-xl font-bold mt-6 mb-3 text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">
          {parseInline(line.substring(3))}
        </h2>
      );
    } else if (line.trim().startsWith('* ')) {
      currentList.push(
        <li key={i} className="flex items-start text-slate-700 dark:text-slate-300">
          <span className="mr-3 mt-1.5 block h-2 w-2 flex-shrink-0 rounded-full bg-amber-500"></span>
          <span>{parseInline(line.trim().substring(2))}</span>
        </li>
      );
    } else if (line.trim() === '---') {
      flushList();
      elements.push(<hr key={i} className="my-6 border-slate-200 dark:border-slate-700" />);
    } else if (line.trim().length > 0) {
      flushList();
      elements.push(
        <p key={i} className="mb-4 text-slate-600 dark:text-slate-400">
          {parseInline(line)}
        </p>
      );
    }
  });

  flushList(); // Flush any remaining list items

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
        {elements}
    </div>
  );
};

export default MarkdownRenderer;
