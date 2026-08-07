import { useEffect, useRef } from 'react';

import { useRefreshMutation } from './authApi';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { logout, setCredentials } from '@/store/authSlice';

/** Refresh 20% before actual expiry so a slow network doesn't cause a gap. */
const REFRESH_MARGIN_RATIO = 0.8;

/**
 * Schedules a silent token refresh before the access token expires, for as
 * long as the component using this hook stays mounted. Tokens are memory-only
 * (never persisted), so this only needs to cover a single continuous session
 * — a page reload already requires re-login and re-arms nothing.
 */
export function useSessionRefresh() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const refreshToken = useAppSelector((state) => state.auth.refreshToken);
  const [refresh] = useRefreshMutation();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!token || !refreshToken) return;

    // expiresIn isn't kept in Redux (it's only meaningful at the instant a
    // token is issued), so schedule from a fixed default matching the
    // documented 15-minute access token TTL. A future refresh response's
    // expiresIn re-arms this effect via the token/refreshToken dependency.
    const defaultTtlSeconds = 15 * 60;
    const delayMs = defaultTtlSeconds * 1000 * REFRESH_MARGIN_RATIO;

    timerRef.current = setTimeout(() => {
      void refresh({ refreshToken })
        .unwrap()
        .then((result) => {
          dispatch(
            setCredentials({
              token: result.token,
              refreshToken: result.refreshToken,
              user: result.user,
            }),
          );
        })
        .catch(() => {
          dispatch(logout());
        });
    }, delayMs);

    return () => clearTimeout(timerRef.current);
  }, [token, refreshToken, refresh, dispatch]);
}
