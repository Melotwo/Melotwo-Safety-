
import React, { useState, useEffect } from 'react';
import type { EmailContent } from '../types';
import { X, Send, Copy, Check, Info } from 'lucide-react';

interface EmailQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailContent: EmailContent | null;
}

const EmailQuoteModal: React.FC<EmailQuoteModalProps> = ({ isOpen, onClose, emailContent }) => {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && emailContent) {
      setSubject(emailContent.subject);
      setBody(emailContent.body);
      setRecipient('');
      setCopied(false);
    }
  }, [isOpen, emailContent]);

  if (!isOpen) return null;

  const handleCopyToClipboard = () => {
    const emailBodyForKlaviyo = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(emailBodyForKlaviyo).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSendMail = () => {
    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl m-4 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100" id="modal-title">
            Generated Email Draft
          </h2>
          <button
            type="button"
            className="text-slate-400 bg-transparent hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-600 dark:hover:text-white rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="recipient-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Recipient Email
            </label>
            <input
              type="email"
              id="recipient-email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="procurement@example.com"
              className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200"
            />
          </div>
          <div>
            <label htmlFor="email-subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Subject
            </label>
            <input
              type="text"
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200"
            />
          </div>
          <div>
            <label htmlFor="email-body" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Body
            </label>
            <textarea
              id="email-body"
              rows={10}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200"
            />
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Use 'Copy for Klaviyo' to easily paste this content into your marketing campaigns.
              </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={handleCopyToClipboard}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 border border-transparent rounded-md hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:ring-offset-slate-800"
          >
            {copied ? <Check className="w-5 h-5 mr-2 text-green-600" /> : <Copy className="w-5 h-5 mr-2" />}
            {copied ? 'Copied!' : 'Copy for Klaviyo'}
          </button>
          <div className="flex items-center space-x-3">
             <button
              type="button"
              className="px-5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSendMail}
              disabled={!recipient}
              className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white bg-amber-500 border border-transparent rounded-lg shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send via Email Client
              <Send className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailQuoteModal;
