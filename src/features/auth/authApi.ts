import { api } from '@/services/api';
import type { ApiResponse } from '@/services/api';
import type { AuthUser } from '@/store/authSlice';

interface LoginRequest {
  mobile: string;
  password: string;
}
interface LoginResult {
  token: string;
  user: AuthUser;
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResult, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: (response: ApiResponse<LoginResult>) => response.data,
    }),
  }),
});

export const { useLoginMutation } = authApi;
