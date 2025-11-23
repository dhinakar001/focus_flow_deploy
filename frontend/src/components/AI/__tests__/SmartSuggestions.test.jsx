/**
 * SmartSuggestions Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SmartSuggestions from '../SmartSuggestions';
import { aiApi } from '@/services/aiApi';

// Mock AI API
vi.mock('@/services/aiApi', () => ({
  aiApi: {
    smartSuggestions: {
      generateSuggestions: vi.fn(),
    },
  },
}));

describe('SmartSuggestions', () => {
  const mockSuggestions = [
    {
      title: 'Take a break',
      description: 'You\'ve been working for 2 hours',
      severity: 'medium',
      rationale: 'Based on your activity patterns',
      expected_benefit: 'Improved focus',
      action_items: ['Step away for 5 minutes', 'Drink water'],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders smart suggestions component', () => {
    render(<SmartSuggestions userId="user-123" />);
    expect(screen.getByText(/smart suggestions/i)).toBeInTheDocument();
  });

  it('loads suggestions on mount when userId provided', async () => {
    aiApi.smartSuggestions.generateSuggestions.mockResolvedValue(mockSuggestions);

    render(<SmartSuggestions userId="user-123" />);

    await waitFor(() => {
      expect(aiApi.smartSuggestions.generateSuggestions).toHaveBeenCalledWith('user-123');
    });
  });

  it('displays loading state', () => {
    aiApi.smartSuggestions.generateSuggestions.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<SmartSuggestions userId="user-123" />);
    // Loading spinner should be visible
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('displays suggestions when loaded', async () => {
    aiApi.smartSuggestions.generateSuggestions.mockResolvedValue(mockSuggestions);

    render(<SmartSuggestions userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByText('Take a break')).toBeInTheDocument();
      expect(screen.getByText(/you've been working/i)).toBeInTheDocument();
    });
  });

  it('displays empty state when no suggestions', async () => {
    aiApi.smartSuggestions.generateSuggestions.mockResolvedValue([]);

    render(<SmartSuggestions userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByText(/no suggestions available/i)).toBeInTheDocument();
    });
  });

  it('refreshes suggestions when refresh button clicked', async () => {
    aiApi.smartSuggestions.generateSuggestions.mockResolvedValue(mockSuggestions);
    const user = userEvent.setup();

    render(<SmartSuggestions userId="user-123" />);

    await waitFor(() => {
      expect(aiApi.smartSuggestions.generateSuggestions).toHaveBeenCalledTimes(1);
    });

    const refreshButton = screen.getByText(/refresh/i);
    await user.click(refreshButton);

    await waitFor(() => {
      expect(aiApi.smartSuggestions.generateSuggestions).toHaveBeenCalledTimes(2);
    });
  });

  it('displays error message on failure', async () => {
    aiApi.smartSuggestions.generateSuggestions.mockRejectedValue(new Error('API Error'));

    render(<SmartSuggestions userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByText(/api error/i)).toBeInTheDocument();
    });
  });
});

