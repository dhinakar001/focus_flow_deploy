/**
 * AnalyticsPanel Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AnalyticsPanel from '../AnalyticsPanel';

describe('AnalyticsPanel', () => {
  it('renders analytics panel', () => {
    render(<AnalyticsPanel />);
    expect(screen.getByText(/today's analytics/i)).toBeInTheDocument();
  });

  it('displays all stat cards', () => {
    render(<AnalyticsPanel />);
    expect(screen.getByText(/focus time today/i)).toBeInTheDocument();
    expect(screen.getByText(/sessions completed/i)).toBeInTheDocument();
    expect(screen.getByText(/messages blocked/i)).toBeInTheDocument();
    expect(screen.getByText(/productivity score/i)).toBeInTheDocument();
  });

  it('displays stat values', () => {
    render(<AnalyticsPanel />);
    expect(screen.getByText('3h 42m')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('23')).toBeInTheDocument();
    expect(screen.getByText('87')).toBeInTheDocument();
  });

  it('displays weekly overview section', () => {
    render(<AnalyticsPanel />);
    expect(screen.getByText(/weekly overview/i)).toBeInTheDocument();
    expect(screen.getByText(/focus time trends/i)).toBeInTheDocument();
  });
});

