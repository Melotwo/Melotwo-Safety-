
import React, { useEffect } from 'react';
import type { Toast as ToastType } from '../types.ts';
import { X, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

interface ToastProps {
  toast: ToastType;
  onClose: () => void;
}

const ICONS = {
  warning: <AlertTriangle className="h-6 w-6 text-amber-500" />,
  success: <CheckCircle className="h-6 w-6 text-green-500" />,
  info: <Info className="h-6 w-6 text-blue-500" />,
  error: <XCircle className="h-6 w-6 text-red-500" />,
};

const BG_COLORS = {
  warning: 'bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700',
  success: 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700',
  info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
  error: 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700',
}

const TEXT_COLORS = {
    warning: 'text-amber-800 dark:text-amber-200',
    success: 'text-green-800 dark:text-green-200',
    info: 'text-blue-800 dark:text-blue-200',
    error: 'text-red-800 dark:text-red-200',
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [toast, onClose]);

  const icon = ICONS[toast.type];
  const bgColor = BG_COLORS[toast.type];
  const textColor = TEXT_COLORS[toast.type];

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md p-4 rounded-lg shadow-2xl border ${bgColor} animate-toast-in`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${textColor}`}>
            {toast.message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={onClose}
            className={`inline-flex rounded-md p-1.5 ${textColor} hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-black`}
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      <style>{`
        @keyframes toast-in {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-toast-in {
          animation: toast-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Toast;
