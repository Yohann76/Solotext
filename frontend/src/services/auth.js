/**
 * Service d'authentification pour SoloText
 * Gère la connexion, déconnexion et la gestion des tokens
 */
import { http, endpoints } from '../api/index.js'

class AuthService {
  constructor() {
    // Vérifier si on est côté client avant d'accéder à localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token')
      this.user = JSON.parse(localStorage.getItem('user') || 'null')
    } else {
      this.token = null
      this.user = null
    }
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated() {
    return !!this.token && !!this.user
  }

  /**
   * Obtenir l'utilisateur actuel
   */
  getCurrentUser() {
    return this.user
  }

  /**
   * Obtenir le token d'authentification
   */
  getToken() {
    return this.token
  }

  /**
   * Connexion d'un utilisateur
   */
  async login(email, password) {
    try {
      const data = await http.post(endpoints.auth.login, { email, password })

      if (data.success) {
        this.token = data.data.token
        this.user = data.data.user
        
        // Stocker dans localStorage (côté client uniquement)
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', this.token)
          localStorage.setItem('user', JSON.stringify(this.user))
        }
        
        return { success: true, data: data.data }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Erreur de connexion:', error)
      // Propager le message d'erreur réel si disponible
      const errorMessage = error.message || 'Erreur de connexion au serveur'
      return { success: false, message: errorMessage }
    }
  }

  /**
   * Inscription d'un utilisateur
   */
  async register(email, password, role = 'user') {
    try {
      const data = await http.post(endpoints.auth.register, { email, password, role })

      if (data.success) {
        this.token = data.data.token
        this.user = data.data.user
        
        // Stocker dans localStorage (côté client uniquement)
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', this.token)
          localStorage.setItem('user', JSON.stringify(this.user))
        }
        
        return { success: true, data: data.data }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error)
      return { success: false, message: 'Erreur de connexion au serveur' }
    }
  }

  /**
   * Déconnexion
   */
  async logout() {
    try {
      // Appeler l'API de déconnexion si nécessaire
      if (this.token) {
        await http.post(endpoints.auth.logout, {})
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    } finally {
      // Nettoyer les données locales
      this.token = null
      this.user = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }

  /**
   * Vérifier les informations de l'utilisateur connecté
   */
  async getMe() {
    try {
      if (!this.token) {
        return { success: false, message: 'Non authentifié' }
      }

      const data = await http.get(endpoints.auth.me)

      if (data.success) {
        this.user = data.data.user
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(this.user))
        }
        return { success: true, data: data.data }
      } else {
        // Token invalide, déconnecter
        this.logout()
        return { success: false, message: 'Session expirée' }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error)
      return { success: false, message: 'Erreur de connexion au serveur' }
    }
  }

  /**
   * Changer le mot de passe
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const data = await http.post(endpoints.auth.changePassword, { currentPassword, newPassword })
      return { success: data.success, message: data.message }
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error)
      return { success: false, message: 'Erreur de connexion au serveur' }
    }
  }

  /**
   * Vérifier si l'utilisateur est admin
   */
  isAdmin() {
    return this.user && this.user.role === 'admin'
  }

  /**
   * Vérifier si l'utilisateur est un utilisateur normal
   */
  isUser() {
    return this.user && this.user.role === 'user'
  }

  /**
   * Obtenir les en-têtes d'authentification pour les requêtes API
   */
  getAuthHeaders() { return { 'Content-Type': 'application/json' } }

  /**
   * Faire une requête authentifiée
   */
  async authenticatedRequest(url, options = {}) { return http.get(url, options) }
}

// Créer une instance singleton
const authService = new AuthService()

export default authService
