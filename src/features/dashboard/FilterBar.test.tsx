import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FilterBar } from './FilterBar';

import { renderWithProviders } from '@/test/renderWithProviders';

describe('FilterBar', () => {
  it('renders the primary and secondary filter fields', () => {
    renderWithProviders(<FilterBar />);
    expect(screen.getByLabelText('Sponsor')).toBeInTheDocument();
    expect(screen.getByLabelText('Project')).toBeInTheDocument();
    expect(screen.getByLabelText('Select duration')).toBeInTheDocument();
    expect(screen.getByLabelText('State')).toBeInTheDocument();
    expect(screen.getByLabelText('District')).toBeInTheDocument();
    expect(screen.getByLabelText('Block')).toBeInTheDocument();
    expect(screen.getByLabelText('PHC')).toBeInTheDocument();
    expect(screen.getByLabelText('Subcentre')).toBeInTheDocument();
    expect(screen.getByLabelText('Village')).toBeInTheDocument();
  });

  it('invokes onFilterChange with the field name and new value', () => {
    const onFilterChange = vi.fn();
    renderWithProviders(<FilterBar onFilterChange={onFilterChange} />);
    fireEvent.change(screen.getByLabelText('Sponsor'), { target: { value: 'all' } });
    expect(onFilterChange).toHaveBeenCalledWith('sponsor', 'all');
  });
});
