const API_BASE_URL = 'http://localhost:3000/api'

class AnalysisService {
  constructor() {
    this.token = null
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token')
    }
  }

  // Méthode pour mettre à jour le token
  setToken(token) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
  }

  // Méthode pour obtenir les headers avec authentification
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    }
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }
    
    return headers
  }

  // Créer une nouvelle analyse
  async createAnalysis(sourceText) {
    try {
      const response = await fetch(`${API_BASE_URL}/analyses`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          source_text: sourceText
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la création de l\'analyse')
      }

      return data
    } catch (error) {
      console.error('Erreur AnalysisService.createAnalysis:', error)
      throw error
    }
  }

  // Récupérer les analyses de l'utilisateur
  async getAnalyses(page = 1, limit = 10) {
    try {
      const response = await fetch(`${API_BASE_URL}/analyses?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders()
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération des analyses')
      }

      return data
    } catch (error) {
      console.error('Erreur AnalysisService.getAnalyses:', error)
      throw error
    }
  }

  // Récupérer une analyse spécifique
  async getAnalysis(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/analyses/${id}`, {
        method: 'GET',
        headers: this.getHeaders()
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération de l\'analyse')
      }

      return data
    } catch (error) {
      console.error('Erreur AnalysisService.getAnalysis:', error)
      throw error
    }
  }

  // Mettre à jour une analyse
  async updateAnalysis(id, updateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/analyses/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updateData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la mise à jour de l\'analyse')
      }

      return data
    } catch (error) {
      console.error('Erreur AnalysisService.updateAnalysis:', error)
      throw error
    }
  }

  // Supprimer une analyse
  async deleteAnalysis(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/analyses/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la suppression de l\'analyse')
      }

      return data
    } catch (error) {
      console.error('Erreur AnalysisService.deleteAnalysis:', error)
      throw error
    }
  }
}

// Export d'une instance singleton
export default new AnalysisService()
