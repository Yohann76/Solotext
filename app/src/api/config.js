// Central API configuration

/**
 * Base URL for the backend API
 * En production, utilise un chemin relatif pour fonctionner avec le proxy nginx
 * En développement, utilise le proxy Vite configuré dans vite.config.js
 */
const getApiBaseUrl = () => {
  // Si VITE_API_URL est défini, l'utiliser (priorité absolue)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // En mode développement ou production, utiliser un chemin relatif
  // Le proxy Vite (dev) ou nginx (prod) redirigera vers le backend
  return '/api'
}

export const API_BASE_URL = getApiBaseUrl()


