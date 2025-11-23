/**
 * FocusTimer Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FocusTimer from '../FocusTimer';

describe('FocusTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders timer component', () => {
    render(<FocusTimer />);
    expect(screen.getByText(/focus/i)).toBeInTheDocument();
  });

  it('displays initial time', () => {
    render(<FocusTimer />);
    expect(screen.getByText(/50:00/i)).toBeInTheDocument();
  });

  it('starts timer when play button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    render(<FocusTimer />);
    const playButton = screen.getByRole('button', { name: /start/i });
    
    await user.click(playButton);
    
    // Advance timer by 1 second
    vi.advanceTimersByTime(1000);
    
    // Timer should have decreased
    expect(screen.getByText(/49:59/i)).toBeInTheDocument();
  });

  it('pauses timer when pause button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    render(<FocusTimer />);
    
    // Start timer
    const playButton = screen.getByRole('button', { name: /start/i });
    await user.click(playButton);
    
    // Advance by 2 seconds
    vi.advanceTimersByTime(2000);
    
    // Pause timer
    const pauseButton = screen.getByRole('button', { name: /pause/i });
    await user.click(pauseButton);
    
    // Advance by another second (should not change)
    const timeBeforePause = screen.getByText(/49:58/i).textContent;
    vi.advanceTimersByTime(1000);
    const timeAfterPause = screen.getByText(/49:58/i).textContent;
    
    expect(timeBeforePause).toBe(timeAfterPause);
  });

  it('stops and resets timer when stop button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    render(<FocusTimer />);
    
    // Start timer
    const playButton = screen.getByRole('button', { name: /start/i });
    await user.click(playButton);
    
    // Advance by 5 seconds
    vi.advanceTimersByTime(5000);
    
    // Stop timer
    const stopButton = screen.getByRole('button', { name: /stop/i });
    await user.click(stopButton);
    
    // Timer should reset to 50:00
    expect(screen.getByText(/50:00/i)).toBeInTheDocument();
  });

  it('changes duration when duration button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<FocusTimer />);
    
    // Click 25 minute duration
    const durationButton = screen.getByRole('button', { name: /25/i });
    await user.click(durationButton);
    
    // Timer should show 25:00
    expect(screen.getByText(/25:00/i)).toBeInTheDocument();
  });
});

