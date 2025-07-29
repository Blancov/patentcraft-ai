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
    // REMOVED the proxy section
  },
  resolve: {
    alias: {
      '@': '/src',
    }
  }
});