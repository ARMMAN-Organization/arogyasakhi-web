import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as authApiModule from './authApi';
import { useSessionRefresh } from './useSessionRefresh';

import { setCredentials } from '@/store/authSlice';
import { makeStore } from '@/store/store';
import type { AppStore } from '@/store/store';

function wrapperFor(store: AppStore) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

const user = { roles: ['ADMIN' as const], projectId: null, geographyUnitId: null };

describe('useSessionRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('does nothing when there is no active session', () => {
    const refreshFn = vi.fn();
    vi.spyOn(authApiModule, 'useRefreshMutation').mockReturnValue([
      refreshFn,
      {} as ReturnType<typeof authApiModule.useRefreshMutation>[1],
    ]);
    const store = makeStore();

    renderHook(() => useSessionRefresh(), { wrapper: wrapperFor(store) });
    vi.advanceTimersByTime(15 * 60 * 1000);

    expect(refreshFn).not.toHaveBeenCalled();
  });

  it('schedules a refresh before the access token expires and re-arms on success', async () => {
    const unwrap = vi.fn().mockResolvedValue({
      token: 'access-2',
      refreshToken: 'refresh-2',
      expiresIn: 900,
      user,
    });
    const refreshFn = vi.fn().mockReturnValue({ unwrap });
    vi.spyOn(authApiModule, 'useRefreshMutation').mockReturnValue([
      refreshFn,
      {} as ReturnType<typeof authApiModule.useRefreshMutation>[1],
    ]);
    const store = makeStore();
    store.dispatch(
      setCredentials({ token: 'access-1', refreshToken: 'refresh-1', expiresIn: 900, user }),
    );

    renderHook(() => useSessionRefresh(), { wrapper: wrapperFor(store) });

    // Not yet due at 11 minutes (refresh fires at 80% of 15 min = 12 min).
    await vi.advanceTimersByTimeAsync(11 * 60 * 1000);
    expect(refreshFn).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(60 * 1000);
    expect(refreshFn).toHaveBeenCalledWith({ refreshToken: 'refresh-1' });
    expect(store.getState().auth.token).toBe('access-2');
    expect(store.getState().auth.refreshToken).toBe('refresh-2');
  });

  it('schedules the refresh from the real expiresIn rather than a fixed default', async () => {
    const unwrap = vi.fn().mockResolvedValue({
      token: 'access-2',
      refreshToken: 'refresh-2',
      expiresIn: 300,
      user,
    });
    const refreshFn = vi.fn().mockReturnValue({ unwrap });
    vi.spyOn(authApiModule, 'useRefreshMutation').mockReturnValue([
      refreshFn,
      {} as ReturnType<typeof authApiModule.useRefreshMutation>[1],
    ]);
    const store = makeStore();
    // expiresIn: 300s (5 min) — well under the old hardcoded 15-min default.
    store.dispatch(
      setCredentials({ token: 'access-1', refreshToken: 'refresh-1', expiresIn: 300, user }),
    );

    renderHook(() => useSessionRefresh(), { wrapper: wrapperFor(store) });

    // Not yet due at 3.9 minutes (refresh fires at 80% of 5 min = 4 min).
    await vi.advanceTimersByTimeAsync(3.9 * 60 * 1000);
    expect(refreshFn).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(0.2 * 60 * 1000);
    expect(refreshFn).toHaveBeenCalledWith({ refreshToken: 'refresh-1' });
  });

  it('logs out when the refresh call fails', async () => {
    const unwrap = vi.fn().mockRejectedValue(new Error('refresh token revoked'));
    const refreshFn = vi.fn().mockReturnValue({ unwrap });
    vi.spyOn(authApiModule, 'useRefreshMutation').mockReturnValue([
      refreshFn,
      {} as ReturnType<typeof authApiModule.useRefreshMutation>[1],
    ]);
    const store = makeStore();
    store.dispatch(
      setCredentials({ token: 'access-1', refreshToken: 'refresh-1', expiresIn: 900, user }),
    );

    renderHook(() => useSessionRefresh(), { wrapper: wrapperFor(store) });
    await vi.advanceTimersByTimeAsync(12 * 60 * 1000);

    expect(store.getState().auth.token).toBeNull();
    expect(store.getState().auth.refreshToken).toBeNull();
  });
});
