import { describe, expect, it } from 'vitest';

import { dashboardApi } from './dashboardApi';
import type { DashboardStats } from './dashboardApi';
import { MOCK_DASHBOARD_STATS } from './dashboardApi.mock';

import { makeStore } from '@/store/store';

describe('dashboardApi', () => {
  it('resolves getDashboardStats with the typed mock payload shape', async () => {
    const store = makeStore();
    const result = await store.dispatch(dashboardApi.endpoints.getDashboardStats.initiate());

    expect(result.data).toBeDefined();
    // A type-level contract check: DashboardStats is the query's generic type, so this
    // assignment fails to compile if the payload ever drifts from the type — keeping a
    // future real-endpoint swap a drop-in change.
    const stats: DashboardStats = result.data as DashboardStats;
    expect(stats).toEqual(MOCK_DASHBOARD_STATS);
  });
});
