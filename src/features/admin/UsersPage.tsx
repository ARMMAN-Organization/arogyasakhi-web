import { useTranslation } from 'react-i18next';

import { Panel } from '@/components/shared/Panel';

export function UsersPage() {
  const { t } = useTranslation();

  return (
    <Panel title={t('admin.comingSoonTitle')}>
      <p>{t('admin.comingSoonBody')}</p>
    </Panel>
  );
}

export default UsersPage;
