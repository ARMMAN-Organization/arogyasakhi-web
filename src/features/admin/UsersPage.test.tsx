import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { UsersPage } from './UsersPage';

import { renderWithProviders } from '@/test/renderWithProviders';

describe('UsersPage', () => {
  it('shows a coming-soon message', () => {
    renderWithProviders(<UsersPage />);
    expect(screen.getByText('Coming soon')).toBeInTheDocument();
    expect(
      screen.getByText(
        'User administration is under construction and will be available in a future release.',
      ),
    ).toBeInTheDocument();
  });
});
