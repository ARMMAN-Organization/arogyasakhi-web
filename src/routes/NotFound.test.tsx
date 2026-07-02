import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { NotFound } from './NotFound';

import i18n from '@/i18n';

describe('NotFound', () => {
  it('shows the not-found message and a link home', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <NotFound />
        </MemoryRouter>
      </I18nextProvider>,
    );
    expect(screen.getByText('Page not found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to dashboard' })).toHaveAttribute('href', '/');
  });
});
