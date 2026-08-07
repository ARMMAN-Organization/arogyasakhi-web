import { useEffect, useRef } from 'react';

import { useRefreshMutation } from './authApi';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { logout, setCredentials } from '@/store/authSlice';

/** Refresh 20% before actual expiry so a slow network doesn't cause a gap. */
const REFRESH_MARGIN_RATIO = 0.8;

/** Used only if a session somehow has no expiresIn recorded (defensive; login/refresh always return one). */
const DEFAULT_TTL_SECONDS = 15 * 60;

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
  const expiresIn = useAppSelector((state) => state.auth.expiresIn);
  const [refresh] = useRefreshMutation();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!token || !refreshToken) return;

    const ttlSeconds = expiresIn ?? DEFAULT_TTL_SECONDS;
    const delayMs = ttlSeconds * 1000 * REFRESH_MARGIN_RATIO;

    timerRef.current = setTimeout(() => {
      void refresh({ refreshToken })
        .unwrap()
        .then((result) => {
          dispatch(
            setCredentials({
              token: result.token,
              refreshToken: result.refreshToken,
              expiresIn: result.expiresIn,
              user: result.user,
            }),
          );
        })
        .catch(() => {
          dispatch(logout());
        });
    }, delayMs);

    return () => clearTimeout(timerRef.current);
  }, [token, refreshToken, expiresIn, refresh, dispatch]);
}
