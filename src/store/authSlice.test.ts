import { describe, expect, it } from 'vitest';

import { authReducer, setCredentials, logout, type AuthUser } from './authSlice';

const user: AuthUser = { id: 'u1', name: 'Asha', roles: ['ADMIN'] };

describe('authSlice', () => {
  it('starts with no token or user', () => {
    const state = authReducer(undefined, { type: '@@INIT' });
    expect(state).toEqual({ token: null, user: null });
  });

  it('stores credentials on setCredentials', () => {
    const state = authReducer(undefined, setCredentials({ token: 'tok', user }));
    expect(state.token).toBe('tok');
    expect(state.user).toEqual(user);
  });

  it('clears credentials on logout', () => {
    const seeded = authReducer(undefined, setCredentials({ token: 'tok', user }));
    const state = authReducer(seeded, logout());
    expect(state).toEqual({ token: null, user: null });
  });
});
