import { useTranslation } from 'react-i18next';

import { useListUsersQuery } from './usersApi';

export function UsersPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useListUsersQuery();

  if (isLoading) return <p role="status">{t('common.loading')}</p>;
  if (isError)
    return (
      <div role="alert">
        <p>{t('common.error')}</p>
        <button type="button" onClick={() => void refetch()}>
          {t('common.retry')}
        </button>
      </div>
    );
  if (!data || data.length === 0) return <p>{t('common.empty')}</p>;

  return (
    <ul>
      {data.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

export default UsersPage;
