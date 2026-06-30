import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';

import { usePermissions } from '@/hooks/usePermissions';
import type { Role } from '@/store/authSlice';

interface RoleGuardProps {
  allowedRoles: Role[];
}

/** Renders children only if the user has one of the allowed roles (UX gating). */
export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { hasAnyRole } = usePermissions();
  const { t } = useTranslation();
  if (!hasAnyRole(allowedRoles)) {
    return <p role="alert">{t('common.forbidden')}</p>;
  }
  return <Outlet />;
}
