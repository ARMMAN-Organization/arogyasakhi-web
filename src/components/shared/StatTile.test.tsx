import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StatTile } from './StatTile';

describe('StatTile', () => {
  it('renders the label and formatted value', () => {
    render(<StatTile variant="village" label="Villages" value={1788} />);
    expect(screen.getByText('Villages')).toBeInTheDocument();
    expect(screen.getByText('1,788')).toBeInTheDocument();
  });

  it('applies the color variant class for the given variant', () => {
    render(<StatTile variant="sponsor" label="Sponsors" value={15} />);
    expect(screen.getByText('15').closest('.stat-tile')).toHaveClass('stat-tile--sponsor');
  });
});
