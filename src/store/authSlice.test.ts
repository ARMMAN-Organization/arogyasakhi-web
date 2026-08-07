import { describe, expect, it } from 'vitest';

import { authReducer, setCredentials, setProfile, logout, type AuthUser } from './authSlice';

const user: AuthUser = { roles: ['ADMIN'], projectId: null, geographyUnitId: null };

describe('authSlice', () => {
  it('starts with no token, refresh token, or user', () => {
    const state = authReducer(undefined, { type: '@@INIT' });
    expect(state).toEqual({ token: null, refreshToken: null, user: null });
  });

  it('stores credentials on setCredentials', () => {
    const state = authReducer(
      undefined,
      setCredentials({ token: 'tok', refreshToken: 'rt', user }),
    );
    expect(state.token).toBe('tok');
    expect(state.refreshToken).toBe('rt');
    expect(state.user).toEqual(user);
  });

  it('merges profile fields from setProfile without clobbering roles/scope', () => {
    const seeded = authReducer(
      undefined,
      setCredentials({ token: 'tok', refreshToken: 'rt', user }),
    );
    const state = authReducer(seeded, setProfile({ id: 'u1', displayName: 'Asha' }));
    expect(state.user).toEqual({ ...user, id: 'u1', displayName: 'Asha' });
  });

  it('a later setCredentials (e.g. token refresh) keeps existing profile fields', () => {
    const seeded = authReducer(
      undefined,
      setCredentials({ token: 'tok', refreshToken: 'rt', user }),
    );
    const withProfile = authReducer(seeded, setProfile({ id: 'u1', displayName: 'Asha' }));
    const refreshed = authReducer(
      withProfile,
      setCredentials({ token: 'tok2', refreshToken: 'rt2', user }),
    );
    expect(refreshed.token).toBe('tok2');
    expect(refreshed.user).toEqual({ ...user, id: 'u1', displayName: 'Asha' });
  });

  it('clears credentials on logout', () => {
    const seeded = authReducer(
      undefined,
      setCredentials({ token: 'tok', refreshToken: 'rt', user }),
    );
    const state = authReducer(seeded, logout());
    expect(state).toEqual({ token: null, refreshToken: null, user: null });
  });
});
