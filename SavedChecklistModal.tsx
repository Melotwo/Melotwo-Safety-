import React, { useState, useEffect, useRef } from 'react';
import { X, Bookmark, Eye, Trash2, ArrowLeft } from 'lucide-react';
// Fix: Use relative paths for imports to resolve module loading errors.
import { SavedChecklist } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

const SavedChecklistsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  savedChecklists: SavedChecklist[];
  onDelete: (id: number) => void;
}> = ({ isOpen, onClose, savedChecklists, onDelete }) => {
  const [viewingChecklist, setViewingChecklist] = useState<SavedChecklist | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement;

      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      setTimeout(() => firstElement.focus(), 100);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        triggerElementRef.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setViewingChecklist(null);
    }
  }, [isOpen]);

  useEffect(() => {
    // When a new checklist is viewed, reset the checked items for it.
    setCheckedItems(new Set());
  }, [viewingChecklist]);

  if (!isOpen) return null;

  const toggleItem = (key: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(key)) {
      newChecked.delete(key);
    } else {
      newChecked.add(key);
    }
    setCheckedItems(newChecked);
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="saved-modal-title" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-[fade-in_0.2s_ease-out]"></div>
      <div ref={modalRef} className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 transition-all animate-[scale-up_0.2s_ease-out] flex flex-col" style={{maxHeight: '85vh'}}>
        <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h3 id="saved-modal-title" className="text-lg font-semibold text-slate-900 dark:text-white">
            {viewingChecklist ? viewingChecklist.title : 'Saved Checklists'}
          </h3>
          {viewingChecklist && (
            <button onClick={() => setViewingChecklist(null)} className="flex items-center text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline">
              <ArrowLeft size={16} className="mr-1"/>
              Back to List
            </button>
          )}
          <button onClick={onClose} className="p-2 -mr-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto p-6">
          {viewingChecklist ? (
            <MarkdownRenderer text={viewingChecklist.content} checkedItems={checkedItems} onToggleItem={toggleItem} />
          ) : (
            savedChecklists.length > 0 ? (
              <ul className="space-y-3">
                {savedChecklists.map((checklist) => (
                  <li key={checklist.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{checklist.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Saved: {checklist.savedAt}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => setViewingChecklist(checklist)} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700" aria-label={`View ${checklist.title}`}>
                        <Eye size={18} />
                      </button>
                      <button onClick={() => onDelete(checklist.id)} className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50" aria-label={`Delete ${checklist.title}`}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <Bookmark size={48} className="mx-auto text-slate-400 dark:text-slate-500" />
                <p className="mt-4 text-slate-600 dark:text-slate-400">You haven't saved any checklists yet.</p>
                <p className="text-sm text-slate-500 dark:text-slate-500">Generate a checklist and click the "Save" button to store it here.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedChecklistsModal;
