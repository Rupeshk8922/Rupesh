import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/securetoken.googleapis.com': {
        target: 'http://127.0.0.1:9098',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/securetoken.googleapis.com/, ''),
      },
      '/identitytoolkit.googleapis.com': {
        target: 'http://127.0.0.1:9098',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/identitytoolkit.googleapis.com/, ''),
      },
    },
  },
})
