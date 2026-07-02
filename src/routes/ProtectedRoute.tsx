import { Navigate, Outlet } from 'react-router-dom';

import { useAppSelector } from '@/hooks/redux';

/** Requires an authenticated session; otherwise redirects to login. */
export function ProtectedRoute() {
  const token = useAppSelector((state) => state.auth.token);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}
