import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { authReducer } from './authSlice';

import { api } from '@/services/api';

/**
 * Builds a fresh store instance. Use in tests to keep each case isolated;
 * the app uses the shared `store` singleton exported below.
 */
export function makeStore() {
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer, auth: authReducer },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });
  setupListeners(store.dispatch);
  return store;
}

export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
