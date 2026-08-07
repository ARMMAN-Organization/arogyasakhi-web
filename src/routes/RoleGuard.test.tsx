import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { RoleGuard } from './RoleGuard';

import i18n from '@/i18n';
import { setCredentials, type Role } from '@/store/authSlice';
import { makeStore } from '@/store/store';

function renderWithRoles(roles: Role[]) {
  const store = makeStore();
  store.dispatch(
    setCredentials({
      token: 't',
      refreshToken: 'rt',
      user: { roles, projectId: null, geographyUnitId: null },
    }),
  );
  return render(
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
              <Route path="/admin" element={<p>admin area</p>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    </Provider>,
  );
}

describe('RoleGuard', () => {
  it('renders children for an allowed role', () => {
    renderWithRoles(['ADMIN']);
    expect(screen.getByText('admin area')).toBeInTheDocument();
  });

  it('blocks a user without the allowed role', () => {
    renderWithRoles(['MANAGER']);
    expect(screen.queryByText('admin area')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
