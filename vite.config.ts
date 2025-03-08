import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['tests.setup.js'],
  },
  server: {
    proxy: {
      '/wp-json': {
        target: 'https://quartierdepot-april2024.local',
        changeOrigin: true
      },
    },
  },
});
