import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';

import i18n from '@/i18n';
import { makeStore, type AppStore } from '@/store/store';

interface Options {
  /** Provide a pre-seeded store to control auth state per test. */
  store?: AppStore;
}

/** Renders a component wrapped in a fresh Redux store + i18n provider. */
export function renderWithProviders(ui: ReactElement, { store = makeStore() }: Options = {}) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
      </Provider>
    );
  }
  return { store, ...render(ui, { wrapper: Wrapper }) };
}
