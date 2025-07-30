import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  define: {
    'process.env': process.env
  },
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
  },
  resolve: {
    alias: {
      '@': '/src',
    }
  }
});