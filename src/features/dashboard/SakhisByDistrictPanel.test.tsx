import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SakhisByDistrictPanel } from './SakhisByDistrictPanel';

import { renderWithProviders } from '@/test/renderWithProviders';

describe('SakhisByDistrictPanel', () => {
  it('renders one legend row per district with the correct name and value', () => {
    render(
      <SakhisByDistrictPanel
        entries={[
          { district: 'Pune', count: 142 },
          { district: 'Nagpur', count: 74 },
        ]}
      />,
    );
    expect(screen.getByText('Pune')).toBeInTheDocument();
    expect(screen.getByText('142')).toBeInTheDocument();
    expect(screen.getByText('Nagpur')).toBeInTheDocument();
    expect(screen.getByText('74')).toBeInTheDocument();
  });

  it('renders bar widths proportional to the max value', () => {
    render(
      <SakhisByDistrictPanel
        entries={[
          { district: 'Pune', count: 100 },
          { district: 'Nagpur', count: 50 },
        ]}
      />,
    );
    const bars = document.querySelectorAll('.legend-bar__fill');
    expect(bars[0]).toHaveStyle({ width: '100%' });
    expect(bars[1]).toHaveStyle({ width: '50%' });
  });

  it('renders the empty state for an empty list', () => {
    renderWithProviders(<SakhisByDistrictPanel entries={[]} />);
    expect(screen.getByText('No records found.')).toBeInTheDocument();
  });
});
