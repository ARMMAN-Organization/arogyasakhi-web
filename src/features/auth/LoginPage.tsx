import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/shared/Button';
import { useAppDispatch } from '@/hooks/redux';
import { setCredentials } from '@/store/authSlice';

import { useLoginMutation } from './authApi';

/** Login screen. On success, stores credentials in memory and routes to the app. */
export function LoginPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [login, { isLoading, isError }] = useLoginMutation();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    const result = await login({ mobile, password }).unwrap();
    dispatch(setCredentials(result));
    navigate('/', { replace: true });
  };

  return (
    <form onSubmit={(e) => void onSubmit(e)} style={{ maxWidth: 320, margin: '10vh auto', display: 'grid', gap: 12 }}>
      <h1>{t('app.title')}</h1>
      <label>
        {t('auth.mobile')}
        <input value={mobile} onChange={(e) => setMobile(e.target.value)} required autoComplete="username" />
      </label>
      <label>
        {t('auth.password')}
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
      </label>
      {isError && <p role="alert">{t('common.error')}</p>}
      <Button type="submit" disabled={isLoading}>
        {t('auth.signIn')}
      </Button>
    </form>
  );
}
