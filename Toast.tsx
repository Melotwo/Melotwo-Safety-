import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

const Toast: React.FC<{ message: string, onDismiss: () => void }> = ({ message, onDismiss }) => {
  const [visible, setVisible] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      setAnimatingOut(false);
      const timer = setTimeout(() => {
        setAnimatingOut(true);
        setTimeout(() => {
            setVisible(false);
            onDismiss();
        }, 300); 
      }, 2700);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
      setAnimatingOut(false);
    }
  }, [message, onDismiss]);

  if (!visible) {
    return null;
  }

  const animationClass = animatingOut ? 'animate-toast-out' : 'animate-toast-in';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center p-4 space-x-4 text-slate-800 bg-white dark:bg-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg ${animationClass}`}
    >
      <CheckCircle className="w-5 h-5 text-green-500" />
      <div className="text-sm font-medium">{message}</div>
    </div>
  );
};

export default Toast;
