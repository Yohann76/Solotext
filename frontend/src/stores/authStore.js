import { ref, reactive } from 'vue'
import authService from '../services/auth.js'

// État global de l'authentification
const isAuthenticated = ref(false)
const user = ref(null)
const listeners = new Set()

// Fonction pour notifier tous les composants du changement
const notifyListeners = () => {
  listeners.forEach(callback => callback())
}

// Fonction pour s'abonner aux changements
const subscribe = (callback) => {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

// Fonction pour vérifier l'état d'authentification
const checkAuth = () => {
  const wasAuthenticated = isAuthenticated.value
  isAuthenticated.value = authService.isAuthenticated()
  user.value = authService.getCurrentUser()
  
  // Notifier si l'état a changé
  if (wasAuthenticated !== isAuthenticated.value) {
    notifyListeners()
  }
  
  return { isAuthenticated: isAuthenticated.value, user: user.value }
}

// Fonction pour se connecter
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

// Fonction pour s'inscrire
const register = async (email, password, role = 'user') => {
  try {
    const result = await authService.register(email, password, role)
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

// Fonction pour se déconnecter
const logout = async () => {
  try {
    await authService.logout()
    checkAuth()
    notifyListeners()
  } catch (error) {
    console.error('Erreur de déconnexion:', error)
  }
}

// Fonction pour forcer la synchronisation
const sync = () => {
  checkAuth()
  notifyListeners()
}

// Initialiser l'état au chargement
checkAuth()

export function useAuthStore() {
  return {
    // État
    isAuthenticated,
    user,
    
    // Actions
    login,
    register,
    logout,
    checkAuth,
    sync,
    
    // Utilitaires
    subscribe
  }
}
