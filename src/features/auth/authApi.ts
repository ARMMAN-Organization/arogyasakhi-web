import { api } from '@/services/api';
import type { ApiResponse } from '@/services/api';
import type { AuthUser } from '@/store/authSlice';

interface LoginRequest {
  username: string;
  password: string;
}

interface RefreshRequest {
  refreshToken: string;
}

interface LogoutRequest {
  refreshToken: string;
}

/** Shape of the `data` object shared by /auth/login and /auth/refresh responses. */
interface AuthTokensResponseData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  roles: AuthUser['roles'];
  projectId: string | null;
  geographyUnitId: string | null;
}

interface AuthTokensResult {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

/** Shape of the `data` object in GET /me's response. */
interface MeResponseData {
  id: string;
  username: string;
  displayName: string;
  projectName: string | null;
}

export function toAuthTokensResult(
  response: ApiResponse<AuthTokensResponseData>,
): AuthTokensResult {
  return {
    token: response.data.accessToken,
    refreshToken: response.data.refreshToken,
    expiresIn: response.data.expiresIn,
    user: {
      roles: response.data.roles,
      projectId: response.data.projectId,
      geographyUnitId: response.data.geographyUnitId,
    },
  };
}

export function toMeResult(
  response: ApiResponse<MeResponseData>,
): Pick<AuthUser, 'id' | 'username' | 'displayName' | 'projectName'> {
  return {
    id: response.data.id,
    username: response.data.username,
    displayName: response.data.displayName,
    projectName: response.data.projectName,
  };
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthTokensResult, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: toAuthTokensResult,
    }),
    refresh: builder.mutation<AuthTokensResult, RefreshRequest>({
      query: (body) => ({ url: '/auth/refresh', method: 'POST', body }),
      transformResponse: toAuthTokensResult,
    }),
    logout: builder.mutation<void, LogoutRequest>({
      query: (body) => ({ url: '/auth/logout', method: 'POST', body }),
    }),
    getMe: builder.query<Pick<AuthUser, 'id' | 'username' | 'displayName' | 'projectName'>, void>({
      query: () => '/me',
      transformResponse: toMeResult,
    }),
  }),
});

export const { useLoginMutation, useRefreshMutation, useLogoutMutation, useGetMeQuery } = authApi;
