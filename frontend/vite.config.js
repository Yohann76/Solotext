import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// TODO: Use .env variable in this file for port and host
// The vite.config.js file is used to configure Vite’s behavior 
// plugins, dev server, build, variables, aliases

export default defineConfig({
  plugins: [vue()],
  // Désactiver le rechargement automatique de la configuration pour éviter les redémarrages constants
  clearScreen: false,
  server: {
    host: '0.0.0.0',
    port: 8080,
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
    hmr: false, // Désactiver HMR pour éviter les rechargements constants dans Docker
    // Le HMR cause des problèmes de connexion dans Docker avec des volumes montés
    // Les changements de fichiers seront détectés mais nécessiteront un rechargement manuel
    proxy: {
      '/api': {
        target: 'http://backend:3000',
        changeOrigin: true
      }
    }
  }
})
