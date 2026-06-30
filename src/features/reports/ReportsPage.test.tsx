import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';

import i18n from '@/i18n';
import { store } from '@/store/store';

import { ReportsPage } from './ReportsPage';

describe('ReportsPage', () => {
  it('shows the loading state first', () => {
    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <ReportsPage />
        </I18nextProvider>
      </Provider>,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
