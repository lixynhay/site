import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    mimeTypes: {
      '.tsx': 'application/javascript',
      '.ts': 'application/javascript',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
