import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';
import pkg from './package.json';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
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
