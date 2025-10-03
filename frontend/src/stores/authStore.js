import { ref, reactive } from 'vue'
import authService from '../services/auth.js'

// State global for authentication
const isAuthenticated = ref(false)
const user = ref(null)
const listeners = new Set()

// Function to notify all components of the change
const notifyListeners = () => {
  listeners.forEach(callback => callback())
}

// Function to subscribe to changes
const subscribe = (callback) => {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

// Function to check the authentication state
const checkAuth = () => {
  const wasAuthenticated = isAuthenticated.value
  isAuthenticated.value = authService.isAuthenticated()
  user.value = authService.getCurrentUser()
  
  // Notify if the state has changed
  if (wasAuthenticated !== isAuthenticated.value) {
    notifyListeners()
  }
  
  return { isAuthenticated: isAuthenticated.value, user: user.value }
}

// Function to login
const login = async (email, password) => {
  try {
    const result = await authService.login(email, password)
    if (result.success) {
      checkAuth()
      notifyListeners()
    }
    return result
  } catch (error) {
    console.error('Erreur de connexion:', error)
    return { success: false, message: 'Erreur de connexion' }
  }
}

// Function to register
const register = async (email, password) => {
  try {
    const result = await authService.register(email, password, 'user')
    if (result.success) {
      checkAuth()
      notifyListeners()
    }
    return result
  } catch (error) {
    console.error('Erreur d\'inscription:', error)
    return { success: false, message: 'Erreur d\'inscription' }
  }
}

// Function to logout
const logout = async () => {
  try {
    await authService.logout()
    checkAuth()
    notifyListeners()
  } catch (error) {
    console.error('Erreur de déconnexion:', error)
  }
}

// Function to force the synchronization
const sync = () => {
  checkAuth()
  notifyListeners()
}

// Initialize the state at loading
checkAuth()

export function useAuthStore() {
  return {
    // State
    isAuthenticated,
    user,
    
    // Actions
    login,
    register,
    logout,
    checkAuth,
    sync,
    
    // Utilities
    subscribe
  }
}
