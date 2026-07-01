import React, { createContext, useState, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let bgColor = 'bg-white dark:bg-gray-800';
          let borderColor = 'border-slate-200 dark:border-gray-700';
          let textColor = 'text-gray-800 dark:text-gray-200';
          let Icon = Info;
          let iconColor = 'text-indigo-500';

          if (toast.type === 'success') {
            borderColor = 'border-green-100 dark:border-green-950/30';
            iconColor = 'text-green-500';
            bgColor = 'bg-green-50 dark:bg-green-950/20';
            textColor = 'text-green-800 dark:text-green-200';
            Icon = CheckCircle;
          } else if (toast.type === 'error') {
            borderColor = 'border-red-100 dark:border-red-950/30';
            iconColor = 'text-red-500';
            bgColor = 'bg-red-50 dark:bg-red-950/20';
            textColor = 'text-red-800 dark:text-red-200';
            Icon = AlertCircle;
          } else if (toast.type === 'warning') {
            borderColor = 'border-yellow-100 dark:border-yellow-950/30';
            iconColor = 'text-yellow-500';
            bgColor = 'bg-yellow-50 dark:bg-yellow-950/20';
            textColor = 'text-yellow-800 dark:text-yellow-200';
            Icon = AlertTriangle;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-350 animate-fade-in ${bgColor} ${borderColor} ${textColor}`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
              <div className="flex-1 text-sm font-medium">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
