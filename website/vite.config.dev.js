import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Configuration Vite pour le développement sur le serveur
// Utilise des ports différents pour éviter les conflits avec staging

export default defineConfig({
  plugins: [vue()],
  clearScreen: false,
  server: {
    host: '0.0.0.0',  // Permet l'accès depuis l'extérieur
    port: 8091,       // Port différent de staging (8081)
    strictPort: true,
    cors: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
})

