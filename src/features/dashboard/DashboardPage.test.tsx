import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DashboardPage } from './DashboardPage';

import { renderWithProviders } from '@/test/renderWithProviders';

describe('DashboardPage', () => {
  it('renders the dashboard heading', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });
});
