// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    
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
      watch: { usePolling: true },
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
