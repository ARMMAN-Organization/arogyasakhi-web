import { api } from '@/services/api';
import type { ApiResponse } from '@/services/api';

export interface ManagedUser {
  id: string;
  name: string;
}

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listUsers: builder.query<ManagedUser[], void>({
      query: () => '/admin/users',
      transformResponse: (response: ApiResponse<ManagedUser[]>) => response.data,
      providesTags: ['User'],
    }),
  }),
});

export const { useListUsersQuery } = usersApi;
