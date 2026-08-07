import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet } from 'react-router-dom';

import './AppLayout.css';

import logo from '@/assets/arogya-sakhi-logo.png';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { useLogoutMutation } from '@/features/auth/authApi';
import { useSessionRefresh } from '@/features/auth/useSessionRefresh';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { usePermissions } from '@/hooks/usePermissions';
import { logout } from '@/store/authSlice';

interface NavItem {
  to: string;
  labelKey: 'nav.dashboard' | 'nav.reports' | 'nav.admin';
  visible: (perms: ReturnType<typeof usePermissions>) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', labelKey: 'nav.dashboard', visible: () => true },
  { to: '/reports', labelKey: 'nav.reports', visible: (p) => p.hasAnyRole(['MANAGER', 'ANALYST']) },
  { to: '/admin/users', labelKey: 'nav.admin', visible: (p) => p.hasRole('ADMIN') },
];

/** Role-aware application shell: sidebar navigation plus a slim top bar. */
export function AppLayout() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const permissions = usePermissions();
  const refreshToken = useAppSelector((state) => state.auth.refreshToken);
  const [logoutMutation] = useLogoutMutation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useSessionRefresh();

  const handleLogout = () => {
    // Always clear local state, regardless of whether the server call
    // succeeds — auth-service's revoke is idempotent, and the user must be
    // able to log out even if the network is down or the token already expired.
    if (refreshToken) {
      void logoutMutation({ refreshToken }).catch(() => {
        /* no-op — local logout below always proceeds */
      });
    }
    dispatch(logout());
  };

  return (
    <div className="shell">
      <aside className={`shell__sidebar ${sidebarOpen ? 'shell__sidebar--open' : ''}`}>
        <div className="shell__brand">
          <img src={logo} alt={t('app.title')} className="shell__brand-logo" />
        </div>
        <nav className="shell__nav">
          {NAV_ITEMS.filter((item) => item.visible(permissions)).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `shell__nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="shell__main">
        <header className="shell__topbar">
          <button
            type="button"
            className="shell__menu-btn"
            aria-label={t('common.toggleMenu')}
            onClick={() => setSidebarOpen((open) => !open)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <div className="shell__topbar-actions">
            <LanguageSwitcher />
            <button type="button" className="shell__logout-btn" onClick={handleLogout}>
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
    </div>
  );
}
