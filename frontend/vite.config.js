import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0', // Permet l'accès depuis l'extérieur du conteneur
    port: 8080,
    watch: {
      usePolling: true, // Nécessaire pour Docker sur Windows/Mac
      interval: 1000    // Vérifie les changements toutes les secondes
    },
    proxy: {
      '/api': {
        target: 'http://backend:3000', // Utilise le nom du service Docker
        changeOrigin: true
      }
    }
  }
})
