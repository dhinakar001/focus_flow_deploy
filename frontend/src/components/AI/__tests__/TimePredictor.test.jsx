/**
 * TimePredictor Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TimePredictor from '../TimePredictor';
import { aiApi } from '@/services/aiApi';

// Mock AI API
vi.mock('@/services/aiApi', () => ({
  aiApi: {
    timePredictor: {
      batchPredictDurations: vi.fn(),
    },
  },
}));

describe('TimePredictor', () => {
  const mockTasks = [
    { id: 1, title: 'Task 1' },
    { id: 2, title: 'Task 2' },
  ];

  const mockPredictions = [
    {
      task_id: 1,
      predicted_minutes: 45,
      confidence_score: 0.85,
      base_estimate_minutes: 40,
      reasoning: 'Based on similar tasks',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders time predictor component', () => {
    render(<TimePredictor userId="user-123" tasks={mockTasks} />);
    expect(screen.getByText(/ai time predictor/i)).toBeInTheDocument();
  });

  it('disables predict button when no tasks', () => {
    render(<TimePredictor userId="user-123" tasks={[]} />);
    const button = screen.getByText(/predict all task durations/i);
    expect(button).toBeDisabled();
  });

  it('calls predict API when button clicked', async () => {
    aiApi.timePredictor.batchPredictDurations.mockResolvedValue(mockPredictions);
    const user = userEvent.setup();

    render(<TimePredictor userId="user-123" tasks={mockTasks} />);

    const predictButton = screen.getByText(/predict all task durations/i);
    await user.click(predictButton);

    await waitFor(() => {
      expect(aiApi.timePredictor.batchPredictDurations).toHaveBeenCalledWith('user-123', mockTasks);
    });
  });

  it('displays predictions when received', async () => {
    aiApi.timePredictor.batchPredictDurations.mockResolvedValue(mockPredictions);
    const user = userEvent.setup();

    render(<TimePredictor userId="user-123" tasks={mockTasks} />);

    const predictButton = screen.getByText(/predict all task durations/i);
    await user.click(predictButton);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText(/minutes/i)).toBeInTheDocument();
    });
  });

  it('displays error message on failure', async () => {
    aiApi.timePredictor.batchPredictDurations.mockRejectedValue(new Error('API Error'));
    const user = userEvent.setup();

    render(<TimePredictor userId="user-123" tasks={mockTasks} />);

    const predictButton = screen.getByText(/predict all task durations/i);
    await user.click(predictButton);

    await waitFor(() => {
      expect(screen.getByText(/api error/i)).toBeInTheDocument();
    });
  });
});

