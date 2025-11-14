import { http, endpoints } from '../api/index.js'

class AdminService {
  constructor() {
    this.baseURL = endpoints.admin.root
  }

  /**
   * Récupérer les en-têtes d'authentification
   */
  getAuthHeaders() { return {} }

  /**
   * Gestion des erreurs API
   */
  async handleResponse(response) { return response }

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

    const url = `${endpoints.admin.users.root}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return http.get(url)
  }

  /**
   * Récupérer un utilisateur spécifique
   */
  async getUser(userId) {
    return http.get(endpoints.admin.users.byId(userId))
  }

  /**
   * Créer un nouvel utilisateur
   */
  async createUser(userData) {
    return http.post(endpoints.admin.users.root, userData)
  }

  /**
   * Modifier un utilisateur
   */
  async updateUser(userId, userData) {
    return http.put(endpoints.admin.users.byId(userId), userData)
  }

  /**
   * Supprimer un utilisateur
   */
  async deleteUser(userId) {
    return http.delete(endpoints.admin.users.byId(userId))
  }

  async getUserCosts() {
    try {
      return await http.get(endpoints.admin.costs.userCosts)
    } catch (error) {
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

    const url = `${endpoints.admin.analyses.root}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return http.get(url)
  }

  /**
   * Récupérer une analyse spécifique
   */
  async getAnalysis(analysisId) {
    return http.get(endpoints.admin.analyses.byId(analysisId))
  }

  /**
   * Supprimer une analyse
   */
  async deleteAnalysis(analysisId) {
    return http.delete(endpoints.admin.analyses.byId(analysisId))
  }

  async getProviders() {
    try {
      return await http.get(endpoints.admin.providers.root)
    } catch (error) {
    }
  }

  async updateProvider(id, data) {
    try {
      return await http.put(endpoints.admin.providers.byId(id), data)
    } catch (error) {
    }
  }

  // ========================================
  // STATISTIQUES
  // ========================================

  /**
   * Récupérer les statistiques globales
   */
  async getStats() {
    return http.get(endpoints.admin.stats)
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
