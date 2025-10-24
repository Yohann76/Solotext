import authService from './auth.js'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

class AdminService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/admin`
  }

  /**
   * Récupérer les en-têtes d'authentification
   */
  getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  /**
   * Gestion des erreurs API
   */
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Erreur HTTP: ${response.status}`)
    }
    return response.json()
  }

  // ========================================
  // GESTION DES UTILISATEURS
  // ========================================

  /**
   * Récupérer tous les utilisateurs avec pagination et filtres
   */
  async getUsers(params = {}) {
    const queryParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value)
      }
    })

    const url = `${this.baseURL}/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  /**
   * Récupérer un utilisateur spécifique
   */
  async getUser(userId) {
    const response = await fetch(`${this.baseURL}/users/${userId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  /**
   * Créer un nouvel utilisateur
   */
  async createUser(userData) {
    const response = await fetch(`${this.baseURL}/users`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    })

    return this.handleResponse(response)
  }

  /**
   * Modifier un utilisateur
   */
  async updateUser(userId, userData) {
    const response = await fetch(`${this.baseURL}/users/${userId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    })

    return this.handleResponse(response)
  }

  /**
   * Supprimer un utilisateur
   */
  async deleteUser(userId) {
    const response = await fetch(`${this.baseURL}/users/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  async getUserCosts() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseURL}/costs/users`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });
      return this.handleResponse(response);
    } catch (error) {
      // Assuming handleError is defined elsewhere or will be added
      // this.handleError(error); 
    }
  }

  // ========================================
  // GESTION DES ANALYSES
  // ========================================

  /**
   * Récupérer toutes les analyses avec pagination et filtres
   */
  async getAnalyses(params = {}) {
    const queryParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value)
      }
    })

    const url = `${this.baseURL}/analyses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  /**
   * Récupérer une analyse spécifique
   */
  async getAnalysis(analysisId) {
    const response = await fetch(`${this.baseURL}/analyses/${analysisId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  /**
   * Supprimer une analyse
   */
  async deleteAnalysis(analysisId) {
    const response = await fetch(`${this.baseURL}/analyses/${analysisId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  // ========================================
  // STATISTIQUES
  // ========================================

  /**
   * Récupérer les statistiques globales
   */
  async getStats() {
    const response = await fetch(`${this.baseURL}/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  // ========================================
  // MÉTHODES UTILITAIRES
  // ========================================

  /**
   * Vérifier si l'utilisateur actuel est admin
   */
  isAdmin() {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user.role === 'admin'
  }

  /**
   * Formater les données d'utilisateur pour l'affichage
   */
  formatUserForDisplay(user) {
    return {
      ...user,
      displayName: user.email ? user.email.split('@')[0] : 'Utilisateur',
      initials: user.email ? user.email.substring(0, 2).toUpperCase() : 'U',
      roleFormatted: user.role === 'admin' ? 'Administrateur' : 'Utilisateur',
      accountAge: user.created_at ? Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)) : 0
    }
  }

  /**
   * Formater les données d'analyse pour l'affichage
   */
  formatAnalysisForDisplay(analysis) {
    return {
      ...analysis,
      statusFormatted: this.getStatusFormatted(analysis.status),
      duplicatePercentFormatted: `${analysis.duplicate_percent || 0}%`,
      createdAtFormatted: new Date(analysis.created_at).toLocaleDateString('fr-FR'),
      analyzedAtFormatted: analysis.analyzed_at ? new Date(analysis.analyzed_at).toLocaleDateString('fr-FR') : 'Non analysé'
    }
  }

  /**
   * Obtenir le statut formaté
   */
  getStatusFormatted(status) {
    const statusMap = {
      'pending': 'En attente',
      'processing': 'En cours',
      'completed': 'Terminé',
      'error': 'Erreur'
    }
    return statusMap[status] || status
  }

  /**
   * Obtenir la couleur du statut
   */
  getStatusColor(status) {
    const colorMap = {
      'pending': '#faad14',
      'processing': '#1890ff',
      'completed': '#52c41a',
      'error': '#ff4d4f'
    }
    return colorMap[status] || '#d9d9d9'
  }

  /**
   * Obtenir la couleur du rôle
   */
  getRoleColor(role) {
    return role === 'admin' ? '#722ed1' : '#1890ff'
  }
}

// Instance singleton
export const adminService = new AdminService()
export default adminService
