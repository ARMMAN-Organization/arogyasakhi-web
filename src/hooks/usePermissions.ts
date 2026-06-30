import { useAppSelector } from './redux';

import type { Role } from '@/store/authSlice';

/** Reads the current user's roles for UX gating (not a security boundary). */
export function usePermissions() {
  const roles = useAppSelector((state) => state.auth.user?.roles ?? []);
  const hasRole = (role: Role): boolean => roles.includes(role);
  const hasAnyRole = (allowed: Role[]): boolean => allowed.some((role) => roles.includes(role));
  return { roles, hasRole, hasAnyRole };
}
