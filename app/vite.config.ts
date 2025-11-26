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
      {
        name: 'availability-endpoint',
        configureServer(server) {
          server.middlewares.use('/api/availability', (_, res) => {
            console.log('Availability endpoint hit at:', new Date().toISOString());
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'Availability endpoint hit' }));
          });
        },
      },
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
          secure: false,
        },
        '/docs-google-com': {
          target: 'https://docs.google.com',
          changeOrigin: true,
          followRedirects: true,
          rewrite: (path) => path.replace(/^\/docs-google-com/, '')
        },
        '/payrexx': {
          target: 'https://api.payrexx.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/payrexx/, ''),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              proxyReq.setHeader('X-API-KEY', env.VITE_PAYREXX_API_KEY);
              const separator = req?.url?.includes('?') ? '&' : '?';
              proxyReq.path += `${separator}instance=${env.VITE_PAYREXX_INSTANCE}`;
            });
          },
        }
      },
    },
  };
});
