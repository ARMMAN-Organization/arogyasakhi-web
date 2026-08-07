import { fireEvent, render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { LoginPage } from './LoginPage';

import i18n from '@/i18n';
import { makeStore } from '@/store/store';

function renderLogin() {
  return render(
    <Provider store={makeStore()}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </I18nextProvider>
    </Provider>,
  );
}

describe('LoginPage validation', () => {
  it('shows validation errors when submitting an empty form', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Username is required.')).toBeInTheDocument();
    expect(await screen.findByText('Password is required.')).toBeInTheDocument();
  });
});
