import { useTranslation } from 'react-i18next';

export function DashboardPage() {
  const { t } = useTranslation();
  return <h2>{t('nav.dashboard')}</h2>;
}

export default DashboardPage;
