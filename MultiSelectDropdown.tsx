import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';
import { EquipmentCategory } from '../types';

interface MultiSelectDropdownProps {
  options: EquipmentCategory[];
  selectedItems: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  selectedItems,
  onChange,
  placeholder = 'Select equipment...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);

  const handleToggle = (item: string) => {
    const newSelection = selectedItems.includes(item)
      ? selectedItems.filter(i => i !== item)
      : [...selectedItems, item];
    onChange(newSelection);
  };
  
  const filteredOptions = options.map(group => ({
      ...group,
      items: group.items.filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
  })).filter(group => group.items.length > 0);

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="w-full">
        <label htmlFor="equipment-multiselect-button" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Tools / Equipment <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <button
          id="equipment-multiselect-button"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="mt-1 flex items-center justify-between w-full min-h-[42px] px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg text-left"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className="flex flex-wrap gap-1">
            {selectedItems.length > 0 ? (
              selectedItems.map(item => (
                <span key={item} className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 text-xs font-medium px-2 py-0.5 rounded-full">
                  {item}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(item);
                    }}
                    className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
                    aria-label={`Remove ${item}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-slate-400">{placeholder}</span>
            )}
          </div>
          <ChevronDown size={16} className={`text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg max-h-60 flex flex-col">
          <div className="p-2 sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
             <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-3 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search equipment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 dark:bg-slate-700 dark:text-white sm:text-sm"
                />
             </div>
          </div>
          <div className="overflow-y-auto">
            {filteredOptions.length > 0 ? (
                filteredOptions.map(group => (
                <div key={group.category}>
                    <h3 className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{group.category}</h3>
                    <ul>
                    {group.items.map(item => (
                        <li
                        key={item}
                        onClick={() => handleToggle(item)}
                        className="px-3 py-2 cursor-pointer flex items-center hover:bg-slate-100 dark:hover:bg-slate-700"
                        role="option"
                        aria-selected={selectedItems.includes(item)}
                        >
                        <input
                            type="checkbox"
                            checked={selectedItems.includes(item)}
                            readOnly
                            className="w-4 h-4 text-amber-500 rounded border-slate-300 dark:border-slate-500 focus:ring-amber-500 cursor-pointer"
                        />
                        <span className="ml-3 text-sm text-slate-700 dark:text-slate-300">{item}</span>
                        </li>
                    ))}
                    </ul>
                </div>
                ))
            ) : (
                <p className="text-center py-4 text-sm text-slate-500">No equipment found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
