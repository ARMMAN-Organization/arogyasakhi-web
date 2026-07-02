import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { RouteErrorBoundary } from './RouteErrorBoundary';

import i18n from '@/i18n';

function renderWithRouter(router: ReturnType<typeof createMemoryRouter>) {
  return render(
    <I18nextProvider i18n={i18n}>
      <RouterProvider router={router} />
    </I18nextProvider>,
  );
}

describe('RouteErrorBoundary', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renders the generic fallback for a thrown error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const router = createMemoryRouter(
      [
        {
          path: '/',
          errorElement: <RouteErrorBoundary />,
          loader: () => {
            throw new Error('kaboom');
          },
          element: <p>never</p>,
        },
      ],
      { initialEntries: ['/'] },
    );
    renderWithRouter(router);
    expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders NotFound for a 404 response', async () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          errorElement: <RouteErrorBoundary />,
          loader: () => {
            // React Router signals HTTP errors by throwing a Response.
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw new Response('not found', { status: 404 });
          },
          element: <p>never</p>,
        },
      ],
      { initialEntries: ['/'] },
    );
    renderWithRouter(router);
    expect(await screen.findByText('Page not found')).toBeInTheDocument();
  });
});
