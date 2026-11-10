// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      VitePWA({
        // New deploys activate on the next load; no prompt needed.
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        // workbox.globPatterns already precaches every icon; avoid duplicate entries.
        includeManifestIcons: false,
        manifest: {
          id: '/',
          name: 'Personal Photo Map',
          short_name: 'PhotoMap',
          description: 'Your travels on a map: photos, countries and timelines in one place.',
          lang: 'en',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'any',
          theme_color: '#0A0C11',
          background_color: '#0A0C11',
          icons: [
            { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          // App shell only. Photos and API data are never cached by the service worker.
          globPatterns: [
            '**/*.{js,css,html,svg,woff2}',
            'pwa-*.png',
            'maskable-icon-*.png',
            'apple-touch-icon-*.png',
            'favicon-*.png',
          ],
          // The ~22 MB countries GeoJSON chunk is too heavy to download on install;
          // it is cached on first use by the runtime rule below instead.
          globIgnores: ['**/countries-*.js'],
          // The main bundle is ~4.5 MB, above Workbox's 2 MiB default.
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          runtimeCaching: [
            {
              // Hashed filenames never change content, so cache-first is safe.
              urlPattern: ({ url }) => /\/assets\/countries-[\w-]+\.js$/.test(url.pathname),
              handler: 'CacheFirst',
              options: {
                cacheName: 'countries-geo',
                expiration: { maxEntries: 2 },
              },
            },
          ],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
        },
      }),
    ],
    
    // Configuração específica para build de produção
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },

    // ⚠️ NÃO "defina" VITE_BACKEND_URL aqui no dev (evita congelar valor)
    // define: {},

    server: {
      port: Number(env.VITE_PORT) || 5173,
      host: true,
      strictPort: true,
      watch: {
        usePolling: true,
        interval: 1000,
      },
      hmr: {
        overlay: true,
        clientPort: 5173,
      },
      proxy: {
        '/api': {
          target: 'http://backend:8092', // nome do serviço no docker-compose
          changeOrigin: true,
          secure: false,
          ws: true,
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('❌ Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('📤 Sending Request to the Target:', req.method, req.url);
              console.log('📤 Headers:', req.headers);
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('📥 Received Response from the Target:', proxyRes.statusCode, req.url);
              console.log('📥 Response headers:', proxyRes.headers);
            });
          },
        },
        // Proxy para imagens - permite acesso direto às imagens
        '/api/images/uploads': {
          target: 'http://backend:8092',
          changeOrigin: true,
          secure: false,
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('Image proxy error:', err);
            });
          },
        },
      },
    },
  }
})
