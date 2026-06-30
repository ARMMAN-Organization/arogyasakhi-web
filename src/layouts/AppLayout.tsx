import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet } from 'react-router-dom';

import { useAppDispatch } from '@/hooks/redux';
import { usePermissions } from '@/hooks/usePermissions';
import { SUPPORTED_LANGUAGES } from '@/i18n';
import { logout } from '@/store/authSlice';

import './AppLayout.css';

/** Role-aware application shell. Nav items appear based on the user's roles. */
export function AppLayout() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { hasAnyRole, hasRole } = usePermissions();

  return (
    <div className="shell">
      <header className="shell__header">
        <span className="shell__title">{t('app.title')}</span>
        <nav className="shell__nav">
          <NavLink to="/">{t('nav.dashboard')}</NavLink>
          {hasAnyRole(['MANAGER', 'ANALYST']) && (
            <NavLink to="/reports">{t('nav.reports')}</NavLink>
          )}
          {hasRole('ADMIN') && <NavLink to="/admin/users">{t('nav.admin')}</NavLink>}
        </nav>
        <div className="shell__actions">
          <select
            aria-label="Language"
            value={i18n.language}
            onChange={(e) => void i18n.changeLanguage(e.target.value)}
          >
            {SUPPORTED_LANGUAGES.map((lng) => (
              <option key={lng} value={lng}>
                {lng.toUpperCase()}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => dispatch(logout())}>
            {t('common.logout')}
          </button>
        </div>
      </header>
      <main className="shell__content">
        <Suspense fallback={<p role="status">{t('common.loading')}</p>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
