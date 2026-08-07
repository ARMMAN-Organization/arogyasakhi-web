import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import './LoginPage.css';
import { authApi, useLoginMutation } from './authApi';
import { loginSchema, type LoginFormValues } from './authSchema';

import logo from '@/assets/arogya-sakhi-logo.png';
import { Button } from '@/components/shared/Button';
import { EyeIcon } from '@/components/shared/EyeIcon';
import { PasswordInput } from '@/components/shared/PasswordInput';
import { useAppDispatch } from '@/hooks/redux';
import { setCredentials, setProfile } from '@/store/authSlice';

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
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await login(values).unwrap();
      dispatch(setCredentials(result));
      navigate('/', { replace: true });
      // Profile fetch happens after navigation — a slow/failed /me call should
      // never block or reject an otherwise-successful login. usePermissions
      // and role-gated routing only need `roles`, already set above.
      dispatch(authApi.endpoints.getMe.initiate())
        .unwrap()
        .then((profile) => dispatch(setProfile(profile)))
        .catch(() => {
          /* no-op — dashboard renders with roles/scope only until a retry succeeds */
        });
    } catch {
      // Failure is surfaced to the user via the mutation's `isError` state below.
      // Swallow here so a rejected login never becomes an unhandled rejection.
    }
  });

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-card__logo">
          <img src={logo} alt={t('app.title')} />
        </div>
        <div className="login-card__heading">
          <h1>{t('auth.welcomeBack')}</h1>
          <p>{t('auth.signInSubtitle')}</p>
        </div>
        <form onSubmit={(e) => void onSubmit(e)} noValidate className="login-form">
          <div className="login-field">
            <label htmlFor="login-username">{t('auth.username')}</label>
            <div className="password-input">
              <input
                id="login-username"
                {...register('username')}
                autoComplete="username"
                aria-invalid={errors.username ? 'true' : 'false'}
              />
              <span
                className="password-input__toggle password-input__toggle--static"
                aria-hidden="true"
              >
                <EyeIcon />
              </span>
            </div>
            {errors.username?.message && (
              <span role="alert" className="login-field__error">
                {t(errors.username.message)}
              </span>
            )}
          </div>
          <div className="login-field">
            <label htmlFor="login-password">{t('auth.password')}</label>
            <PasswordInput
              id="login-password"
              {...register('password')}
              autoComplete="current-password"
              aria-invalid={errors.password ? 'true' : 'false'}
              toggleLabel={{ show: t('auth.showPassword'), hide: t('auth.hidePassword') }}
            />
            {errors.password?.message && (
              <span role="alert" className="login-field__error">
                {t(errors.password.message)}
              </span>
            )}
          </div>
          {isError && (
            <p role="alert" className="login-form__error">
              {t('common.error')}
            </p>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t('common.loading') : t('auth.signIn')}
          </Button>
        </form>
      </div>
    </div>
  );
}
