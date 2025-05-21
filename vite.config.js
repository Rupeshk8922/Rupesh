// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic'
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0', // ✅ Accept connections from anywhere
    open: true,
    https: false,     // ❌ Must be false; let Cloud Workstations handle HTTPS
    hmr: {
      protocol: 'wss',
      host: '3000-idx-empact-1746531438526.cluster-ejd22kqny5htuv5dfowoyipt52.cloudworkstations.dev',
      clientPort: 443
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
