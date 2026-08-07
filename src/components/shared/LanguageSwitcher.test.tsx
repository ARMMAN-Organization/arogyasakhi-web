import { fireEvent, render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { afterEach, describe, expect, it } from 'vitest';

import { LanguageSwitcher } from './LanguageSwitcher';

import i18n from '@/i18n';

function renderSwitcher() {
  return render(
    <I18nextProvider i18n={i18n}>
      <LanguageSwitcher />
    </I18nextProvider>,
  );
}

describe('LanguageSwitcher', () => {
  afterEach(() => void i18n.changeLanguage('en'));

  it('renders with an accessible label and both language options', () => {
    renderSwitcher();
    const control = screen.getByLabelText('Language');
    expect(control).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'English' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'मराठी' })).toBeInTheDocument();
  });

  it('reflects the current active language as the selected value', () => {
    renderSwitcher();
    expect(screen.getByLabelText('Language')).toHaveValue('en');
  });

  it('calls i18n.changeLanguage when a different language is selected', () => {
    renderSwitcher();
    fireEvent.change(screen.getByLabelText('Language'), { target: { value: 'mr' } });
    expect(i18n.language).toBe('mr');
  });
});
