/**
 * ConfirmationModal — heavyweight, official-feeling confirmation dialog
 * Used for critical actions: approve/reject transfers, KYC decisions, etc.
 */
import { useEffect } from 'react';
import { X, AlertTriangle, ShieldCheck, ShieldX } from 'lucide-react';

const VARIANT_CONFIG = {
  approve: {
    Icon: ShieldCheck,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-700',
    confirmClass: 'btn-success',
    confirmLabel: 'Confirm Approval',
    borderTop: 'border-green-200',
  },
  reject: {
    Icon: ShieldX,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    confirmClass: 'btn-danger',
    confirmLabel: 'Confirm Rejection',
    borderTop: 'border-red-200',
  },
  warning: {
    Icon: AlertTriangle,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
    confirmClass: 'btn-gold',
    confirmLabel: 'Proceed',
    borderTop: 'border-amber-200',
  },
  default: {
    Icon: AlertTriangle,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-700',
    confirmClass: 'btn-primary',
    confirmLabel: 'Confirm',
    borderTop: 'border-blue-200',
  },
};

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  details,
  confirmLabel,
  variant = 'default',
  loading = false,
}) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cfg = VARIANT_CONFIG[variant] || VARIANT_CONFIG.default;
  const { Icon } = cfg;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md ll-card animate-fade-in-up overflow-hidden">
        {/* Top accent border */}
        <div className={`h-1 w-full border-t-4 ${cfg.borderTop}`} />

        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-0">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${cfg.iconBg}`}>
            <Icon className={`h-5 w-5 ${cfg.iconColor}`} />
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <h3 className="font-serif text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{message}</p>

          {details && (
            <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 p-3 space-y-1.5">
              {Object.entries(details).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">{key}</span>
                  <span className="text-gray-800 font-semibold">{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 pb-5 justify-end">
          <button onClick={onClose} className="btn-secondary text-sm">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`${cfg.confirmClass} text-sm`}
          >
            {loading ? 'Processing...' : (confirmLabel || cfg.confirmLabel)}
          </button>
        </div>
      </div>
    </div>
  );
}
