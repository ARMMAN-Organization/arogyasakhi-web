import { resolve } from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Targets per SRS: Chrome 120+, Firefox 118+, Safari 16+, Edge 120+.
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  server: { port: 5173, strictPort: true },
  build: { outDir: 'dist', sourcemap: true, target: 'es2021' },
});
