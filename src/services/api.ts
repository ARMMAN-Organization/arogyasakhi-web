import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

import { env } from '@/config/env';
import { logout, setCredentials } from '@/store/authSlice';
import type { Role } from '@/store/authSlice';
import type { RootState } from '@/store/store';

/** Standard backend envelope. */
export interface ApiResponse<TData> {
  success: boolean;
  message: string;
  data: TData;
}

interface AuthTokensResponseData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  roles: Role[];
  projectId: string | null;
  geographyUnitId: string | null;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const { token } = (getState() as RootState).auth;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    headers.set('X-Request-Id', crypto.randomUUID());
    return headers;
  },
});

// Shared across concurrent 401s so simultaneous requests trigger one refresh call, not one each.
let refreshPromise: Promise<boolean> | null = null;

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  apiCtx,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, apiCtx, extraOptions);

  if (result.error && result.error.status === 401) {
    refreshPromise ??= (async () => {
      const { refreshToken } = (apiCtx.getState() as RootState).auth;
      if (!refreshToken) return false;

      const refreshResult = await rawBaseQuery(
        { url: '/auth/refresh', method: 'POST', body: { refreshToken } },
        apiCtx,
        extraOptions,
      );
      if (refreshResult.error) return false;

      const { data } = refreshResult.data as ApiResponse<AuthTokensResponseData>;
      apiCtx.dispatch(
        setCredentials({
          token: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
          user: {
            roles: data.roles,
            projectId: data.projectId,
            geographyUnitId: data.geographyUnitId,
          },
        }),
      );
      return true;
    })().finally(() => {
      refreshPromise = null;
    });

    const refreshed = await refreshPromise;
    if (refreshed) {
      result = await rawBaseQuery(args, apiCtx, extraOptions);
    } else {
      apiCtx.dispatch(logout());
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Report', 'User', 'DashboardStats'],
  endpoints: () => ({}),
});
