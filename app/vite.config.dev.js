import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Configuration Vite pour le développement sur le serveur
// Utilise des ports différents pour éviter les conflits avec staging

export default defineConfig({
  plugins: [vue()],
  clearScreen: false,
  server: {
    host: '0.0.0.0',  // Permet l'accès depuis l'extérieur
    port: 8090,       // Port différent de staging (8080)
    strictPort: true,
    cors: true,
    watch: {
      usePolling: true,
      interval: 2000,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/.idea/**',
        '**/.vscode/**',
        '**/dist/**',
        '**/build/**',
        '**/coverage/**',
        '**/public/**',
        '**/*.log',
        '**/.DS_Store',
        '**/Thumbs.db',
        '**/.dockerignore',
        '**/Dockerfile',
        '**/docker-compose.yml',
        '**/vite.config.js',
        '**/package*.json',
        '**/.env*',
        '**/README.md',
        '**/Makefile',
        '**/index.html'
      ],
      atomic: true,
      ignorePermissionErrors: true
    },
    hmr: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',  // Port API dev (3001 au lieu de 3000)
        changeOrigin: true
      }
    }
  }
})

