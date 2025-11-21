import { API_BASE_URL } from './config.js'

/**
 * Build default headers, including Authorization if token exists.
 * @returns {Record<string,string>} headers
 */
function buildHeaders() {
  const headers = { 'Content-Type': 'application/json' }
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

/**
 * Normalize fetch responses with consistent error handling.
 * @param {Response} response
 * @returns {Promise<any>}
 */
async function handleResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const body = isJson ? await response.json().catch(() => ({})) : await response.text()
  if (!response.ok) {
    const message = (isJson && body && body.message) ? body.message : `HTTP ${response.status}`
    throw new Error(message)
  }
  return body
}

/**
 * Low-level request function with base URL and defaults.
 * @param {string} path - path starting with '/'
 * @param {RequestInit} options
 * @returns {Promise<any>}
 */
export async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`
  const headers = { ...buildHeaders(), ...(options.headers || {}) }
  
  try {
    const response = await fetch(url, { ...options, headers })
    return handleResponse(response)
  } catch (error) {
    // Gérer les erreurs de réseau (Failed to fetch, CORS, etc.)
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Impossible de se connecter au serveur. Vérifiez que le serveur est accessible à ${url}`)
    }
    throw error
  }
}

/**
 * Helper methods for common verbs.
 */
export const http = {
  get: (path, init = {}) => request(path, { ...init, method: 'GET' }),
  post: (path, data, init = {}) => request(path, { ...init, method: 'POST', body: JSON.stringify(data) }),
  put: (path, data, init = {}) => request(path, { ...init, method: 'PUT', body: JSON.stringify(data) }),
  patch: (path, data, init = {}) => request(path, { ...init, method: 'PATCH', body: JSON.stringify(data) }),
  delete: (path, init = {}) => request(path, { ...init, method: 'DELETE' })
}


