import { useTranslation } from 'react-i18next';

import { useListReportsQuery } from './reportsApi';

export function ReportsPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useListReportsQuery();

  if (isLoading) return <p role="status">{t('common.loading')}</p>;
  if (isError)
    return (
      <div role="alert">
        <p>{t('common.error')}</p>
        <button type="button" onClick={() => void refetch()}>{t('common.retry')}</button>
      </div>
    );
  if (!data || data.length === 0) return <p>{t('common.empty')}</p>;

  return (
    <ul>
      {data.map((report) => (
        <li key={report.id}>{report.name}</li>
      ))}
    </ul>
  );
}

export default ReportsPage;
