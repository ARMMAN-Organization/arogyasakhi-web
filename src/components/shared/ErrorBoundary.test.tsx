import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from './ErrorBoundary';

import i18n from '@/i18n';

function Boom(): never {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // React and reportError both log the caught error; silence during the test.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('renders children when there is no error', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ErrorBoundary>
          <p>all good</p>
        </ErrorBoundary>
      </I18nextProvider>,
    );
    expect(screen.getByText('all good')).toBeInTheDocument();
  });

  it('renders the fallback when a child throws', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ErrorBoundary>
          <Boom />
        </ErrorBoundary>
      </I18nextProvider>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
