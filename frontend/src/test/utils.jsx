/**
 * Test Utilities
 * 
 * Helper functions for testing React components
 */

import React from 'react';
import { render } from '@testing-library/react';
import { ToastProvider } from '../contexts/ToastContext';

/**
 * Render component with all providers
 */
export function renderWithProviders(ui, options = {}) {
  const { ...renderOptions } = options;

  const Wrapper = ({ children }) => {
    return (
      <ToastProvider>
        {children}
      </ToastProvider>
    );
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Mock API responses
 */
export const mockApiResponse = (data, status = 200) => {
  return {
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {},
    config: {},
  };
};

/**
 * Mock API error
 */
export const mockApiError = (message, status = 500) => {
  const error = new Error(message);
  error.response = {
    data: { error: { message } },
    status,
    statusText: 'Error',
  };
  return error;
};

