/**
 * StatsCard Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatsCard from '../StatsCard';
import { Clock } from 'lucide-react';

describe('StatsCard', () => {
  const defaultProps = {
    title: 'Test Stat',
    value: '100',
    icon: Clock,
  };

  it('renders stat card with title and value', () => {
    render(<StatsCard {...defaultProps} />);
    expect(screen.getByText('Test Stat')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('displays change indicator when provided', () => {
    render(<StatsCard {...defaultProps} change={10} changeType="up" />);
    expect(screen.getByText(/\+10/i)).toBeInTheDocument();
  });

  it('displays negative change', () => {
    render(<StatsCard {...defaultProps} change={-5} changeType="down" />);
    expect(screen.getByText(/-5/i)).toBeInTheDocument();
  });

  it('renders icon', () => {
    render(<StatsCard {...defaultProps} />);
    // Icon is rendered as SVG, check for the icon container
    const iconContainer = document.querySelector('.bg-primary-100');
    expect(iconContainer).toBeInTheDocument();
  });
});

