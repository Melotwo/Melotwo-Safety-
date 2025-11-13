import React from 'react';

interface Category {
  name: string;
  items: string[];
}

const MarkdownRenderer: React.FC<{
  text: string;
  checkedItems: Set<string>;
  onToggleItem: (key: string) => void;
}> = ({ text, checkedItems, onToggleItem }) => {

  const parseTextToCategories = (): Category[] => {
    if (typeof text !== 'string') return [];

    const categories: Category[] = [];
    let currentCategory: Category | null = null;
    const lines = text.split('\n');

    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('## ')) {
        if (currentCategory) {
          categories.push(currentCategory);
        }
        currentCategory = { name: trimmedLine.substring(3).replace(/\*\*/g, ''), items: [] };
      } else if (trimmedLine.startsWith('* ') && currentCategory) {
        currentCategory.items.push(trimmedLine.substring(2));
      } else if (trimmedLine.length > 0 && !trimmedLine.startsWith('---') && !trimmedLine.toLowerCase().includes('disclaimer')) {
        // Handle cases where a list item might be wrapped onto a new line.
        if (currentCategory && currentCategory.items.length > 0) {
           currentCategory.items[currentCategory.items.length - 1] += ' ' + trimmedLine;
        }
      }
    });

    if (currentCategory) {
      categories.push(currentCategory);
    }
    
    // Add disclaimer as a separate category if it exists
    const disclaimerIndex = text.indexOf('***Disclaimer:');
    if (disclaimerIndex > -1) {
        categories.push({
            name: 'Disclaimer',
            items: [text.substring(disclaimerIndex).replace(/\*\*\*/g, '').replace('Disclaimer:', '').trim()]
        });
    }


    return categories;
  };

  const categories = parseTextToCategories();

  return (
    <div className="space-y-6">
      {categories.map((category, catIdx) => (
        <div key={catIdx} className={`rounded-xl ${category.name === 'Disclaimer' ? 'bg-slate-50 dark:bg-slate-800/50 p-3 sm:p-4' : 'border-2 border-slate-100 dark:border-slate-800 p-4 sm:p-6'}`}>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
             {category.name !== 'Disclaimer' && (
                <span className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {catIdx + 1}
                </span>
             )}
            {category.name}
          </h3>
          <div className="space-y-2">
            {category.items.map((item, itemIdx) => {
              const key = `${catIdx}-${itemIdx}`;
              const isChecked = checkedItems.has(key);
              if (category.name === 'Disclaimer') {
                  return <p key={itemIdx} className="text-xs text-slate-500 dark:text-slate-400 italic">{item}</p>
              }
              return (
                <label
                  key={key}
                  className="flex items-start gap-3 p-2 sm:p-3 rounded-lg cursor-pointer transition-colors border-2 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleItem(key)}
                    className="mt-1 w-5 h-5 text-amber-500 rounded-md border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-amber-400 cursor-pointer bg-white dark:bg-slate-900"
                  />
                  <span className={`flex-1 transition-colors ${isChecked ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>
                    {item}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MarkdownRenderer;
