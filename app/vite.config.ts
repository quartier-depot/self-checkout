import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';
import pkg from './package.json';
import { gunzipSync } from 'zlib';

const wpJsonCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHEABLE_PATHS = ['/products'];

function shouldCache(url: string | undefined) {
  return url && CACHEABLE_PATHS.some(path => url.includes(path));
}

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
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // Check cache BEFORE making the request
              if (req.method === 'GET' && shouldCache(req.url)) {
                const cacheKey = req.url;
                const cachedEntry = wpJsonCache.get(cacheKey);

                if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
                  console.log(`Cache HIT for ${req.url}`);
                  proxyReq.destroy();
                  res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'X-Cache': 'HIT',
                    'x-wp-totalpages': cachedEntry.totalPages,
                  });
                  res.end(cachedEntry.data);
                }
              }
            });

            proxy.on('proxyRes', (proxyRes, req, _res) => {
              // Populate cache on successful GET responses
              if (req.method === 'GET' && proxyRes.statusCode === 200 && shouldCache(req.url)) {
                const chunks: Buffer[] = [];

                proxyRes.on('data', (chunk) => {
                  chunks.push(chunk);
                });

                proxyRes.on('end', () => {
                  try {
                    const buffer = Buffer.concat(chunks);
                    
                    // Decompress if gzipped
                    let decompressed: Buffer;
                    const encoding = proxyRes.headers['content-encoding'];
                    
                    if (encoding === 'gzip') {
                      decompressed = gunzipSync(buffer);
                    } else {
                      decompressed = buffer;
                    }

                    const cacheKey = req.url;
                    wpJsonCache.set(cacheKey, {
                      data: decompressed.toString('utf-8'),
                      timestamp: Date.now(),
                      totalPages: proxyRes.headers['x-wp-totalpages'],
                    });
                    console.log(`Cache STORED for ${req.url} (${decompressed.length} bytes)`);
                  } catch (error) {
                    console.error('Error caching response:', error);
                  }
                });
              }
            });
          },
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