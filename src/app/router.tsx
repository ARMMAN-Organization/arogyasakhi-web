import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { AppLayout } from '@/layouts/AppLayout';
import { LoginPage } from '@/features/auth/LoginPage';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { RoleGuard } from '@/routes/RoleGuard';

// Lazy-load route pages to keep the initial bundle small.
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));
const ReportsPage = lazy(() => import('@/features/reports/ReportsPage'));
const UsersPage = lazy(() => import('@/features/admin/UsersPage'));

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          {
            element: <RoleGuard allowedRoles={['MANAGER', 'ANALYST']} />,
            children: [{ path: 'reports', element: <ReportsPage /> }],
          },
          {
            element: <RoleGuard allowedRoles={['ADMIN']} />,
            children: [{ path: 'admin/users', element: <UsersPage /> }],
          },
        ],
      },
    ],
  },
]);
