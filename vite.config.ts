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
      host: true,
      proxy: {
        '/wp-json': {
          target: env.VITE_WOOCOMMERCE_URL,
          changeOrigin: true,
          auth: `${env.VITE_WOOCOMMERCE_CONSUMER_KEY}:${env.VITE_WOOCOMMERCE_CONSUMER_SECRET}`,
          secure: false
        },
      },
    },
  }
});
