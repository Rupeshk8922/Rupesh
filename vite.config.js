import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Replace with your actual Cloud Workstation domain if needed
const host = '3000-idx-empact-1746531438526.cluster-ejd22kqny5htuv5dfowoyipt52.cloudworkstations.dev';

export default defineConfig({
  plugins: [react()],
  server: {
 hmbr: {
 protocol: 'wss',
 host: host,
    },
 proxy: {
 '/_workstation/': {
 target: 'https://3000-idx-empact-1746531438526.cluster-ejd22kqny5htuv5dfowoyipt52.cloudworkstations.dev',
 changeOrigin: true,
      },
    },
  },
 resolve: {
 alias: {
 '@': '/src',
    },
  }
});
