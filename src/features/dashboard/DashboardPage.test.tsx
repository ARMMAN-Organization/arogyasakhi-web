import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DashboardPage } from './DashboardPage';
import * as dashboardApi from './dashboardApi';
import { MOCK_DASHBOARD_STATS } from './dashboardApi.mock';

import { renderWithProviders } from '@/test/renderWithProviders';

vi.mock('./dashboardApi', async () => {
  const actual = await vi.importActual<typeof dashboardApi>('./dashboardApi');
  return { ...actual, useGetDashboardStatsQuery: vi.fn() };
});

const useGetDashboardStatsQuery = vi.mocked(dashboardApi.useGetDashboardStatsQuery);

describe('DashboardPage', () => {
  it('shows the loading state', () => {
    useGetDashboardStatsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<DashboardPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows the error state and retries on click', () => {
    const refetch = vi.fn();
    useGetDashboardStatsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });

    renderWithProviders(<DashboardPage />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows the empty state when all counts are zero', () => {
    useGetDashboardStatsQuery.mockReturnValue({
      data: {
        ...MOCK_DASHBOARD_STATS,
        sponsors: 0,
        projects: 0,
        sakhis: 0,
        villages: 0,
        beneficiaries: 0,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<DashboardPage />);
    expect(screen.getByText('No records found.')).toBeInTheDocument();
  });

  it('shows all stat tiles, filters and panels on success', () => {
    useGetDashboardStatsQuery.mockReturnValue({
      data: MOCK_DASHBOARD_STATS,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<DashboardPage />);

    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('Sponsors')).toBeInTheDocument();
    expect(screen.getByText('21')).toBeInTheDocument();
    expect(screen.getByText('350')).toBeInTheDocument();
    expect(screen.getByText('1,788')).toBeInTheDocument();
    expect(screen.getByText('50,337')).toBeInTheDocument();

    expect(screen.getByLabelText('Dashboard filters')).toBeInTheDocument();
    expect(screen.getByText('Registrations over time')).toBeInTheDocument();
    expect(screen.getByText('Sakhis by district')).toBeInTheDocument();
    expect(screen.getByText('Pune')).toBeInTheDocument();
  });
});
