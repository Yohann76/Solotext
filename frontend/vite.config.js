import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// TODO: Use .env variable in this file for port and host
// The vite.config.js file is used to configure Vite’s behavior 
// plugins, dev server, build, variables, aliases

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 8080,
    strictPort: true,
    cors: true,
    watch: {
      usePolling: true,
      interval: 2000,
      // Réduire l'empreinte mémoire du watcher
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/.idea/**',
        '**/.vscode/**',
        '**/dist/**',
        '**/build/**',
        '**/coverage/**',
        '**/public/**'
      ]
    },
    hmr: {
      host: 'localhost',
      port: 8080,
      clientPort: 8080,
      protocol: 'ws'
    },
    proxy: {
      '/api': {
        target: 'http://backend:3000',
        changeOrigin: true
      }
    }
  }
})
