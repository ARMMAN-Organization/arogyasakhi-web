import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { UsersPage } from './UsersPage';

import { renderWithProviders } from '@/test/renderWithProviders';

describe('UsersPage', () => {
  it('shows the loading state first', () => {
    renderWithProviders(<UsersPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
