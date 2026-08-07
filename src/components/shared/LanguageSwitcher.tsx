import { useTranslation } from 'react-i18next';

import './LanguageSwitcher.css';
import { Select } from './Select';

import { SUPPORTED_LANGUAGES } from '@/i18n';

const LANGUAGE_LABELS: Record<(typeof SUPPORTED_LANGUAGES)[number], string> = {
  en: 'English',
  mr: 'मराठी',
};

/** Standard language dropdown, kept in sync with i18next's active language. */
export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="language-switcher">
      <svg
        className="language-switcher__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18" />
      </svg>
      <Select
        label="Language"
        hideLabel
        value={i18n.language}
        onChange={(event) => void i18n.changeLanguage(event.target.value)}
        options={SUPPORTED_LANGUAGES.map((lng) => ({ value: lng, label: LANGUAGE_LABELS[lng] }))}
      />
    </div>
  );
}
