import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

/** Rendered for unknown routes (catch-all) and 404 responses. */
export function NotFound() {
  const { t } = useTranslation();
  return (
    <div style={{ textAlign: 'center', display: 'grid', gap: 12, padding: 'var(--space-xl)' }}>
      <h1>{t('common.notFoundTitle')}</h1>
      <p>{t('common.notFoundBody')}</p>
      <Link to="/">{t('common.backHome')}</Link>
    </div>
  );
}
