/**
 * Toast Context Provider
 * 
 * Provides toast notification functionality throughout the app
 * 
 * @module contexts/ToastContext
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer } from '../components/ui/Toast';

const ToastContext = createContext(null);

let toastIdCounter = 0;

/**
 * Toast Provider Component
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = ++toastIdCounter;
    const newToast = {
      id,
      ...toast,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (title, message, variant = 'info', duration = 5000) => {
      return addToast({ title, message, variant, duration });
    },
    [addToast]
  );

  const success = useCallback(
    (title, message, duration = 5000) => {
      return showToast(title, message, 'success', duration);
    },
    [showToast]
  );

  const error = useCallback(
    (title, message, duration = 7000) => {
      return showToast(title, message, 'error', duration);
    },
    [showToast]
  );

  const warning = useCallback(
    (title, message, duration = 6000) => {
      return showToast(title, message, 'warning', duration);
    },
    [showToast]
  );

  const info = useCallback(
    (title, message, duration = 5000) => {
      return showToast(title, message, 'info', duration);
    },
    [showToast]
  );

  const value = {
    toasts,
    addToast,
    removeToast,
    showToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

/**
 * useToast Hook
 * 
 * @returns {Object} Toast functions
 * @example
 * const { success, error } = useToast();
 * success('Success!', 'Operation completed');
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

