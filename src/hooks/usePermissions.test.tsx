import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';

import { usePermissions } from './usePermissions';

import { setCredentials } from '@/store/authSlice';
import { makeStore } from '@/store/store';

function wrapperWithRoles(roles: ('MANAGER' | 'ADMIN' | 'ANALYST')[]) {
  const store = makeStore();
  store.dispatch(
    setCredentials({
      token: 't',
      refreshToken: 'rt',
      user: { roles, projectId: null, geographyUnitId: null },
    }),
  );
  return function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe('usePermissions', () => {
  it('reports roles the user has', () => {
    const { result } = renderHook(() => usePermissions(), { wrapper: wrapperWithRoles(['ADMIN']) });
    expect(result.current.hasRole('ADMIN')).toBe(true);
    expect(result.current.hasRole('MANAGER')).toBe(false);
    expect(result.current.hasAnyRole(['MANAGER', 'ADMIN'])).toBe(true);
  });

  it('returns an empty role set when unauthenticated', () => {
    const store = makeStore();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => usePermissions(), { wrapper });
    expect(result.current.roles).toEqual([]);
    expect(result.current.hasAnyRole(['ADMIN'])).toBe(false);
  });
});
