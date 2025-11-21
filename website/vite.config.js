import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// Configuration Vite dynamique basée sur les variables d'environnement
// Fonctionne pour dev, staging et prod

export default defineConfig(({ mode }) => {
  // Charger les variables d'environnement selon le mode
  const env = loadEnv(mode, process.cwd(), '')

  // Déterminer si on est dans Docker ou en local
  const isDocker = env.VITE_ENV === 'docker' || process.env.DOCKER === 'true'

  // Configuration des ports
  const internalPort = parseInt(env.VITE_INTERNAL_PORT || '8081')
  const externalPort = parseInt(env.VITE_EXTERNAL_PORT || '8091')

  return {
    plugins: [vue()],
    clearScreen: false,
    server: {
      host: '0.0.0.0',
      port: internalPort,
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
          '**/Thumbs.db'
        ],
        atomic: true,
        ignorePermissionErrors: true
      },
      hmr: isDocker ? {
        host: 'localhost',
        port: externalPort,
        clientPort: externalPort
      } : true,
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false
    },
    assetsInclude: ['**/*.md']
  }
})

