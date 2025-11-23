/**
 * Toast Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast } from '../Toast';

describe('Toast', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders toast with title and message', () => {
    render(
      <Toast
        id="1"
        title="Test Title"
        message="Test message"
        variant="info"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders toast with only message', () => {
    render(
      <Toast
        id="1"
        message="Test message only"
        variant="info"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Test message only')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    render(
      <Toast
        id="1"
        title="Test"
        message="Test message"
        variant="info"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByLabelText(/close notification/i);
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledWith('1');
  });

  it('auto-closes after duration', async () => {
    render(
      <Toast
        id="1"
        title="Test"
        message="Test message"
        variant="info"
        duration={1000}
        onClose={mockOnClose}
      />
    );

    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledWith('1');
    });
  });

  it('applies correct variant classes', () => {
    const { rerender } = render(
      <Toast
        id="1"
        title="Success"
        message="Success message"
        variant="success"
        onClose={mockOnClose}
      />
    );
    expect(screen.getByRole('alert')).toHaveClass('bg-success-50');

    rerender(
      <Toast
        id="2"
        title="Error"
        message="Error message"
        variant="error"
        onClose={mockOnClose}
      />
    );
    expect(screen.getByRole('alert')).toHaveClass('bg-danger-50');
  });
});

