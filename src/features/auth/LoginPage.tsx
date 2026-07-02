import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useLoginMutation } from './authApi';
import { loginSchema, type LoginFormValues } from './authSchema';

import { Button } from '@/components/shared/Button';
import { useAppDispatch } from '@/hooks/redux';
import { setCredentials } from '@/store/authSlice';

/**
 * Login screen and the reference implementation for forms in this app:
 * react-hook-form for state, zod (via zodResolver) for validation. On success,
 * stores credentials in memory and routes to the app.
 */
export function LoginPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [login, { isLoading, isError }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { mobile: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await login(values).unwrap();
      dispatch(setCredentials(result));
      navigate('/', { replace: true });
    } catch {
      // Failure is surfaced to the user via the mutation's `isError` state below.
      // Swallow here so a rejected login never becomes an unhandled rejection.
    }
  });

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      noValidate
      style={{ maxWidth: 320, margin: '10vh auto', display: 'grid', gap: 12 }}
    >
      <h1>{t('app.title')}</h1>
      <label>
        {t('auth.mobile')}
        <input
          {...register('mobile')}
          inputMode="numeric"
          autoComplete="username"
          aria-invalid={errors.mobile ? 'true' : 'false'}
        />
        {errors.mobile?.message && <span role="alert">{t(errors.mobile.message)}</span>}
      </label>
      <label>
        {t('auth.password')}
        <input
          type="password"
          {...register('password')}
          autoComplete="current-password"
          aria-invalid={errors.password ? 'true' : 'false'}
        />
        {errors.password?.message && <span role="alert">{t(errors.password.message)}</span>}
      </label>
      {isError && <p role="alert">{t('common.error')}</p>}
      <Button type="submit" disabled={isLoading}>
        {t('auth.signIn')}
      </Button>
    </form>
  );
}
