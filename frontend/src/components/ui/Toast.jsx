/**
 * Toast Notification Component
 * 
 * Displays temporary notifications (success, error, warning, info)
 * 
 * @module components/ui/Toast
 */

import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

const toastVariants = {
  success: {
    icon: CheckCircle,
    className: 'bg-success-50 border-success-200 text-success-900',
    iconClassName: 'text-success-600',
  },
  error: {
    icon: AlertCircle,
    className: 'bg-danger-50 border-danger-200 text-danger-900',
    iconClassName: 'text-danger-600',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-warning-50 border-warning-200 text-warning-900',
    iconClassName: 'text-warning-600',
  },
  info: {
    icon: Info,
    className: 'bg-primary-50 border-primary-200 text-primary-900',
    iconClassName: 'text-primary-600',
  },
};

/**
 * Toast Component
 */
export function Toast({ id, title, message, variant = 'info', duration = 5000, onClose }) {
  const variantConfig = toastVariants[variant] || toastVariants.info;
  const Icon = variantConfig.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4 shadow-lg animate-slide-up',
        variantConfig.className
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', variantConfig.iconClassName)} />
      <div className="flex-1 min-w-0">
        {title && <div className="font-semibold text-sm">{title}</div>}
        {message && (
          <div className={cn('text-sm', title ? 'mt-1' : '')}>{message}</div>
        )}
      </div>
      <button
        onClick={() => onClose?.(id)}
        className="flex-shrink-0 rounded-md p-1 hover:bg-black/5 transition-colors"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Toast Container Component
 */
export function ToastContainer({ toasts, onClose }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none"
      aria-live="assertive"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}

