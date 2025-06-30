import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
  server: {
    open: true,
    port: 5173,
    proxy: {
      // Proxy API requests to avoid CORS issues
      '/api': {
        target: 'https://api.deepseek.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true,
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src',
    }
  }
});