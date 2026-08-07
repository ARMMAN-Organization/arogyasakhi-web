import { fireEvent, render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { AppLayout } from './AppLayout';

import i18n from '@/i18n';
import { setCredentials, type Role } from '@/store/authSlice';
import { makeStore } from '@/store/store';

function renderLayout(roles: Role[]) {
  const store = makeStore();
  store.dispatch(
    setCredentials({
      token: 't',
      refreshToken: 'rt',
      expiresIn: 900,
      user: { roles, projectId: null, geographyUnitId: null },
    }),
  );
  const result = render(
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <AppLayout />
        </MemoryRouter>
      </I18nextProvider>
    </Provider>,
  );
  return { store, ...result };
}

describe('AppLayout', () => {
  afterEach(() => void i18n.changeLanguage('en'));

  it('shows reports and admin nav for an admin', () => {
    renderLayout(['ADMIN', 'MANAGER']);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Administration')).toBeInTheDocument();
  });

  it('hides admin nav for a non-admin', () => {
    renderLayout(['MANAGER']);
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.queryByText('Administration')).not.toBeInTheDocument();
  });

  it('changes language via the selector', () => {
    renderLayout(['MANAGER']);
    fireEvent.change(screen.getByRole('combobox', { name: 'Language' }), {
      target: { value: 'mr' },
    });
    expect(i18n.language).toBe('mr');
  });

  it('clears the session on logout', () => {
    const { store } = renderLayout(['ADMIN']);
    fireEvent.click(screen.getByRole('button', { name: /log out/i }));
    expect(store.getState().auth.token).toBeNull();
  });

  it('marks the Dashboard link as active on the index route', () => {
    renderLayout(['MANAGER']);
    expect(screen.getByText('Dashboard')).toHaveClass('active');
    expect(screen.getByText('Reports')).not.toHaveClass('active');
  });

  it('has an accessible sidebar toggle button', () => {
    renderLayout(['MANAGER']);
    expect(screen.getByRole('button', { name: 'Toggle navigation menu' })).toBeInTheDocument();
  });

  it('renders outlet content inside the shell content area', () => {
    renderLayout(['MANAGER']);
    expect(document.querySelector('.shell__content')).toBeInTheDocument();
  });
});
