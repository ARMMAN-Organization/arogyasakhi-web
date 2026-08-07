import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Select } from './Select';

const OPTIONS = [
  { value: 'all', label: 'All states' },
  { value: 'mp', label: 'Madhya Pradesh' },
];

describe('Select', () => {
  it('renders the label linked to the control and all options', () => {
    render(<Select label="State" options={OPTIONS} defaultValue="all" />);
    const control = screen.getByLabelText('State');
    expect(control).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Madhya Pradesh' })).toBeInTheDocument();
  });

  it('calls onChange with the newly selected value', () => {
    const onChange = vi.fn();
    render(<Select label="State" options={OPTIONS} defaultValue="all" onChange={onChange} />);
    const control: HTMLSelectElement = screen.getByLabelText('State');
    fireEvent.change(control, { target: { value: 'mp' } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(control.value).toBe('mp');
  });
});
