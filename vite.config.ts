import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {

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
          changeOrigin: true,
          auth: `${env.VITE_WOOCOMMERCE_CONSUMER_KEY}:${env.VITE_WOOCOMMERCE_CONSUMER_SECRET}`,
          secure: false
        },
      },
    },
  }
});
