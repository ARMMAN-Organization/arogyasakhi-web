import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { ProtectedRoute } from './ProtectedRoute';

import { setCredentials } from '@/store/authSlice';
import { makeStore } from '@/store/store';

function renderAt(path: string, store = makeStore()) {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<p>protected content</p>} />
          </Route>
          <Route path="/login" element={<p>login screen</p>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe('ProtectedRoute', () => {
  it('redirects to /login when there is no token', () => {
    renderAt('/');
    expect(screen.getByText('login screen')).toBeInTheDocument();
  });

  it('renders the protected content when authenticated', () => {
    const store = makeStore();
    store.dispatch(
      setCredentials({
        token: 't',
        refreshToken: 'rt',
        user: { roles: [], projectId: null, geographyUnitId: null },
      }),
    );
    renderAt('/', store);
    expect(screen.getByText('protected content')).toBeInTheDocument();
  });
});
