/**
 * QuickActions Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuickActions from '../QuickActions';

describe('QuickActions', () => {
  it('renders quick actions component', () => {
    render(<QuickActions />);
    expect(screen.getByText(/quick actions/i)).toBeInTheDocument();
  });

  it('displays all action buttons', () => {
    render(<QuickActions />);
    expect(screen.getByText(/focus 50min/i)).toBeInTheDocument();
    expect(screen.getByText(/break 10min/i)).toBeInTheDocument();
    expect(screen.getByText(/schedule/i)).toBeInTheDocument();
    expect(screen.getByText(/settings/i)).toBeInTheDocument();
  });

  it('calls action handler when button is clicked', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const user = userEvent.setup();

    render(<QuickActions />);
    const focusButton = screen.getByText(/focus 50min/i);
    await user.click(focusButton);

    expect(consoleSpy).toHaveBeenCalledWith('Start 50min focus');
    consoleSpy.mockRestore();
  });

  it('renders icons for each action', () => {
    render(<QuickActions />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });
});

