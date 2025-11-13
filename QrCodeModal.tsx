import React, { useState, useEffect, useRef } from 'react';
import { X, Copy, Check } from 'lucide-react';

const QrCodeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  const appUrl = window.location.href;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(appUrl)}&qzone=1&margin=10`;

  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement;
      setCopied(false);

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

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="qr-modal-title" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-[fade-in_0.2s_ease-out]"></div>
      <div ref={modalRef} className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 transition-all animate-[scale-up_0.2s_ease-out] text-center p-8">
        <button onClick={onClose} className="absolute top-2 right-2 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Close modal">
          <X size={20} />
        </button>
        <h3 id="qr-modal-title" className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Share Application</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Scan the QR code or copy the link below.</p>
        <div className="bg-white p-4 rounded-lg inline-block border border-slate-200 dark:border-slate-700">
            <img src={qrCodeUrl} alt="QR Code for application link" width="200" height="200" />
        </div>
        <div className="mt-4 flex rounded-md shadow-sm">
          <input
            type="text"
            readOnly
            value={appUrl}
            className="block w-full flex-1 rounded-none rounded-l-md border-0 py-2 pl-3 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-600 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-sm bg-slate-50 dark:bg-slate-700"
            aria-label="Application URL"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
          >
            {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-slate-500 dark:text-slate-400" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QrCodeModal;
