import { MOCK_DASHBOARD_STATS } from './dashboardApi.mock';

import { api } from '@/services/api';

export interface RegistrationsSeriesPoint {
  month: string;
  count: number;
}

export interface SakhisByDistrictEntry {
  district: string;
  count: number;
}

export interface DashboardStats {
  sponsors: number;
  projects: number;
  sakhis: number;
  villages: number;
  beneficiaries: number;
  registrationsSeries: RegistrationsSeriesPoint[];
  sakhisByDistrict: SakhisByDistrictEntry[];
}

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // TODO(backend): replace queryFn with `query: () => '/dashboard/stats'` once the
    // endpoint exists; the ApiResponse<DashboardStats> envelope and this hook's shape
    // will not need to change.
    getDashboardStats: builder.query<DashboardStats, void>({
      queryFn: () => ({ data: MOCK_DASHBOARD_STATS }),
      providesTags: ['DashboardStats'],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;
