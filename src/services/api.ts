import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

import { env } from '@/config/env';
import { logout } from '@/store/authSlice';
import type { RootState } from '@/store/store';

/** Standard backend envelope. */
export interface ApiResponse<TData> {
  success: boolean;
  message: string;
  data: TData;
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

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  apiCtx,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, apiCtx, extraOptions);
  if (result.error && result.error.status === 401) {
    apiCtx.dispatch(logout());
  }
  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Report', 'User', 'DashboardStats'],
  endpoints: () => ({}),
});
