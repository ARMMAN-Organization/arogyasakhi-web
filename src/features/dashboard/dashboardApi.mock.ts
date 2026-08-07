import type { DashboardStats } from './dashboardApi';

/** Static stand-in for the real dashboard-stats endpoint until it exists. */
export const MOCK_DASHBOARD_STATS: DashboardStats = {
  sponsors: 15,
  projects: 21,
  sakhis: 350,
  villages: 1788,
  beneficiaries: 50337,
  registrationsSeries: [
    { month: 'Mar', count: 3200 },
    { month: 'Apr', count: 3900 },
    { month: 'May', count: 4600 },
    { month: 'Jun', count: 5400 },
    { month: 'Jul', count: 6100 },
    { month: 'Aug', count: 6800 },
  ],
  sakhisByDistrict: [
    { district: 'Pune', count: 142 },
    { district: 'Mumbai Suburban', count: 98 },
    { district: 'Nagpur', count: 74 },
    { district: 'Nashik', count: 36 },
  ],
};
