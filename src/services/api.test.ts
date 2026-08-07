import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { authApi } from '@/features/auth/authApi';
import { setCredentials } from '@/store/authSlice';
import { makeStore } from '@/store/store';
import type { AppStore } from '@/store/store';

function jsonResponse(status: number, body: unknown) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

const user = { roles: ['ADMIN' as const], projectId: null, geographyUnitId: null };

function seedSession(store: AppStore) {
  store.dispatch(
    setCredentials({ token: 'expired-token', refreshToken: 'refresh-1', expiresIn: 900, user }),
  );
}

const refreshSuccessBody = {
  success: true,
  message: 'OK',
  data: {
    accessToken: 'access-2',
    refreshToken: 'refresh-2',
    expiresIn: 900,
    roles: ['ADMIN'],
    projectId: null,
    geographyUnitId: null,
  },
};

describe('baseQueryWithReauth', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('refreshes the token and retries the original request once on a 401', async () => {
    fetchMock
      .mockImplementationOnce(() => jsonResponse(401, { success: false, message: 'expired' }))
      .mockImplementationOnce(() => jsonResponse(200, refreshSuccessBody))
      .mockImplementationOnce(() =>
        jsonResponse(200, {
          success: true,
          message: 'OK',
          data: { id: 'u1', username: 'a', displayName: 'A', projectName: null },
        }),
      );

    const store = makeStore();
    seedSession(store);

    const result = await store.dispatch(authApi.endpoints.getMe.initiate());

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect((fetchMock.mock.calls[1][0] as Request).url).toContain('/auth/refresh');
    expect(result.data).toEqual({ id: 'u1', username: 'a', displayName: 'A', projectName: null });
    expect(store.getState().auth.token).toBe('access-2');
    expect(store.getState().auth.refreshToken).toBe('refresh-2');
  });

  it('logs out without retrying when the refresh call itself fails', async () => {
    fetchMock
      .mockImplementationOnce(() => jsonResponse(401, { success: false, message: 'expired' }))
      .mockImplementationOnce(() =>
        jsonResponse(401, { success: false, message: 'refresh token revoked' }),
      );

    const store = makeStore();
    seedSession(store);

    const result = await store.dispatch(authApi.endpoints.getMe.initiate());

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.error).toBeDefined();
    expect(store.getState().auth.token).toBeNull();
    expect(store.getState().auth.refreshToken).toBeNull();
  });

  it('dedupes concurrent 401s across different requests into a single refresh call', async () => {
    fetchMock
      .mockImplementationOnce(() => jsonResponse(401, { success: false, message: 'expired' }))
      .mockImplementationOnce(() => jsonResponse(401, { success: false, message: 'expired' }))
      .mockImplementationOnce(() => jsonResponse(200, refreshSuccessBody))
      .mockImplementation(() =>
        jsonResponse(200, {
          success: true,
          message: 'OK',
          data: { id: 'u1', username: 'a', displayName: 'A', projectName: null },
        }),
      );

    const store = makeStore();
    seedSession(store);

    const [first, second] = await Promise.all([
      store.dispatch(authApi.endpoints.getMe.initiate()),
      store.dispatch(authApi.endpoints.login.initiate({ username: 'a', password: 'b' })),
    ]);

    const refreshCalls = fetchMock.mock.calls.filter((call: unknown[]) =>
      (call[0] as Request).url.includes('/auth/refresh'),
    );
    expect(refreshCalls).toHaveLength(1);
    expect(first.data).toBeDefined();
    expect('data' in second || 'error' in second).toBe(true);
  });
});
