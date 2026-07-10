import { useTranslation } from 'react-i18next';

interface ErrorFallbackProps {
  /** Optional recovery action. When omitted, a full page reload is offered. */
  onReset?: () => void;
}

/** Shared, presentational fallback shown when an unexpected error is caught. */
export function ErrorFallback({ onReset }: ErrorFallbackProps) {
  const { t } = useTranslation();
  const reset = onReset ?? (() => window.location.reload());

  return (
    <div
      role="alert"
      style={{ maxWidth: 420, margin: '15vh auto', textAlign: 'center', display: 'grid', gap: 12 }}
    >
      <h1>{t('common.errorTitle')}</h1>
      <p>{t('common.error')}</p>
      <button type="button" onClick={reset}>
        {t('common.reload')}
      </button>
    </div>
  );
}
