import React, { createContext, useState, useCallback, useContext } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext({});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(({ type, title, message, duration = 3000 }) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const toast = {
    success: (message, title = 'Sucesso') => addToast({ type: 'success', title, message }),
    error: (message, title = 'Erro') => addToast({ type: 'error', title, message }),
    info: (message, title = 'Informação') => addToast({ type: 'info', title, message }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-4 max-w-md w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`
              pointer-events-auto flex w-full transform rounded-lg bg-white p-4 shadow-lg ring-1 transition-all duration-300 ease-in-out
              ${t.type === 'success' ? 'ring-blue-500/20' : ''}
              ${t.type === 'error' ? 'ring-red-500/20' : ''}
              ${t.type === 'info' ? 'ring-blue-500/20' : ''}
            `}
          >
            <div className="flex-shrink-0">
              {t.type === 'success' && <CheckCircle className="h-6 w-6 text-blue-500" />}
              {t.type === 'error' && <AlertCircle className="h-6 w-6 text-red-500" />}
              {t.type === 'info' && <Info className="h-6 w-6 text-blue-500" />}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{t.title}</p>
              <p className="mt-1 text-sm text-gray-500">{t.message}</p>
            </div>
            <div className="ml-4 flex flex-shrink-0">
              <button
                type="button"
                className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={() => removeToast(t.id)}
              >
                <span className="sr-only">Fechar</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
