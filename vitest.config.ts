import { resolve } from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  test: {
    environment: './src/test/jsdom-undici.ts',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // Keep tests hermetic: config/env.ts fails fast when VITE_API_BASE_URL is
    // unset, and .env is gitignored (absent in CI). Provide it here so any suite
    // whose import graph reaches services/api.ts loads without a real .env file.
    env: {
      VITE_API_BASE_URL: 'http://localhost:3000/api/v1',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      // Bootstrap/config and declaration-only files carry no unit-testable logic.
      exclude: [
        'src/main.tsx',
        'src/App.tsx',
        'src/app/router.tsx',
        'src/i18n/**',
        'src/test/**',
        'src/vite-env.d.ts',
        'src/**/*.test.{ts,tsx}',
      ],
      thresholds: { lines: 70, branches: 70, functions: 70, statements: 70 },
    },
  },
});
