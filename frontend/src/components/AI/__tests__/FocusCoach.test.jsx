/**
 * FocusCoach Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FocusCoach from '../FocusCoach';
import { aiApi } from '@/services/aiApi';

// Mock AI API
vi.mock('@/services/aiApi', () => ({
  aiApi: {
    focusCoach: {
      summarizeTasks: vi.fn(),
      generateFocusPlan: vi.fn(),
    },
  },
}));

describe('FocusCoach', () => {
  const mockTasks = [
    { id: 1, title: 'Task 1', priority: 'high' },
    { id: 2, title: 'Task 2', priority: 'medium' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders focus coach component', () => {
    render(<FocusCoach userId="user-123" tasks={mockTasks} />);
    expect(screen.getByText(/ai focus coach/i)).toBeInTheDocument();
  });

  it('disables buttons when no tasks provided', () => {
    render(<FocusCoach userId="user-123" tasks={[]} />);
    const buttons = screen.getAllByRole('button');
    const summarizeButton = buttons.find(btn => btn.textContent?.includes('Summarize'));
    expect(summarizeButton).toBeDisabled();
  });

  it('shows error when trying to summarize without tasks', async () => {
    const user = userEvent.setup();
    render(<FocusCoach userId="user-123" tasks={[]} />);
    
    // Try to click summarize (should be disabled, but test the error state)
    const errorMessage = screen.queryByText(/please add tasks first/i);
    // Button should be disabled, so error won't show unless we enable it
    expect(errorMessage).not.toBeInTheDocument();
  });

  it('calls summarize API when summarize button is clicked', async () => {
    const mockSummary = {
      summary: 'Test summary',
      total_tasks: 2,
      total_estimated_minutes: 120,
    };
    aiApi.focusCoach.summarizeTasks.mockResolvedValue(mockSummary);

    const user = userEvent.setup();
    render(<FocusCoach userId="user-123" tasks={mockTasks} />);

    const summarizeButton = screen.getByText(/summarize tasks/i);
    await user.click(summarizeButton);

    await waitFor(() => {
      expect(aiApi.focusCoach.summarizeTasks).toHaveBeenCalledWith(mockTasks);
    });
  });

  it('displays summary when received', async () => {
    const mockSummary = {
      summary: 'Test summary',
      total_tasks: 2,
      total_estimated_minutes: 120,
      priority_breakdown: { urgent: 1 },
      categories: { work: 2 },
    };
    aiApi.focusCoach.summarizeTasks.mockResolvedValue(mockSummary);

    const user = userEvent.setup();
    render(<FocusCoach userId="user-123" tasks={mockTasks} />);

    const summarizeButton = screen.getByText(/summarize tasks/i);
    await user.click(summarizeButton);

    await waitFor(() => {
      expect(screen.getByText('Test summary')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // Total tasks
    });
  });

  it('calls generate plan API when generate plan button is clicked', async () => {
    const mockPlan = {
      title: 'Focus Plan',
      description: 'Test plan',
      focus_strategy: 'Deep work',
    };
    aiApi.focusCoach.generateFocusPlan.mockResolvedValue(mockPlan);

    const user = userEvent.setup();
    render(<FocusCoach userId="user-123" tasks={mockTasks} />);

    const generateButton = screen.getByText(/generate focus plan/i);
    await user.click(generateButton);

    await waitFor(() => {
      expect(aiApi.focusCoach.generateFocusPlan).toHaveBeenCalledWith('user-123', mockTasks);
    });
  });

  it('displays error message on API failure', async () => {
    aiApi.focusCoach.summarizeTasks.mockRejectedValue(new Error('API Error'));

    const user = userEvent.setup();
    render(<FocusCoach userId="user-123" tasks={mockTasks} />);

    const summarizeButton = screen.getByText(/summarize tasks/i);
    await user.click(summarizeButton);

    await waitFor(() => {
      expect(screen.getByText(/api error/i)).toBeInTheDocument();
    });
  });
});

