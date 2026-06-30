import { api } from '@/services/api';
import type { ApiResponse } from '@/services/api';

export interface ReportSummary {
  id: string;
  name: string;
}

export const reportsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listReports: builder.query<ReportSummary[], void>({
      query: () => '/reports',
      transformResponse: (response: ApiResponse<ReportSummary[]>) => response.data,
      providesTags: ['Report'],
    }),
  }),
});

export const { useListReportsQuery } = reportsApi;
