/**
 * ToastContext
 * Simple toast notification system for success/error/info feedback.
 * Renders a floating stack of auto-dismissing toasts.
 */
import { createContext, useContext, useState, useCallback } from 'react';
import { FiCheckCircle, FiAlertTriangle, FiXCircle, FiInfo, FiX } from 'react-icons/fi';

const ToastContext = createContext(null);

let toastIdCounter = 0;

const TOAST_CONFIG = {
  success: { icon: FiCheckCircle, bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  error:   { icon: FiXCircle,     bg: 'bg-red-500/15',     border: 'border-red-500/30',     text: 'text-red-400' },
  warning: { icon: FiAlertTriangle, bg: 'bg-amber-500/15', border: 'border-amber-500/30',   text: 'text-amber-400' },
  info:    { icon: FiInfo,         bg: 'bg-blue-500/15',    border: 'border-blue-500/30',    text: 'text-blue-400' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  /** Add a toast notification */
  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  /** Remove a specific toast */
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /** Convenience methods */
  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error', 6000),
    warning: (msg) => addToast(msg, 'warning'),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Stack */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm">
        {toasts.map((t) => {
          const config = TOAST_CONFIG[t.type] || TOAST_CONFIG.info;
          const Icon = config.icon;
          return (
            <div
              key={t.id}
              className={`flex items-start gap-3 rounded-xl border ${config.border} ${config.bg} px-4 py-3 shadow-lg backdrop-blur-xl animate-fade-in-up`}
            >
              <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${config.text}`} />
              <p className={`text-sm ${config.text} flex-1`}>{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className={`shrink-0 ${config.text} opacity-60 hover:opacity-100 transition-opacity`}
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Custom hook to use toast notifications.
 * @returns {{ success, error, warning, info }}
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastContext;
