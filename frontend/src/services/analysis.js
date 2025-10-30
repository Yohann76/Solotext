import { http, endpoints } from '../api/index.js'

class AnalysisService {
  constructor() {
    this.baseURL = ''
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
      const data = await http.post(endpoints.analyses.root, { source_text: sourceText })
      return data
    } catch (error) {
      console.error('Erreur AnalysisService.createAnalysis:', error)
      throw error
    }
  }

  // Récupérer les analyses de l'utilisateur
  async getAnalyses(page = 1, limit = 10) {
    try {
      const query = `?page=${page}&limit=${limit}`
      const data = await http.get(`${endpoints.analyses.root}${query}`)
      return data
    } catch (error) {
      console.error('Erreur AnalysisService.getAnalyses:', error)
      throw error
    }
  }

  // Récupérer une analyse spécifique
  async getAnalysis(id) {
    try {
      const data = await http.get(endpoints.analyses.byId(id))
      return data
    } catch (error) {
      console.error('Erreur AnalysisService.getAnalysis:', error)
      throw error
    }
  }

  // Mettre à jour une analyse
  async updateAnalysis(id, updateData) {
    try {
      const data = await http.put(endpoints.analyses.byId(id), updateData)
      return data
    } catch (error) {
      console.error('Erreur AnalysisService.updateAnalysis:', error)
      throw error
    }
  }

  // Supprimer une analyse
  async deleteAnalysis(id) {
    try {
      const data = await http.delete(endpoints.analyses.byId(id))
      return data
    } catch (error) {
      console.error('Erreur AnalysisService.deleteAnalysis:', error)
      throw error
    }
  }

  // Récupérer les phrases d'une analyse
  async getAnalysisSentences(analysisId) {
    try {
      const data = await http.get(endpoints.analyses.sentences(analysisId))
      return data.sentences || []
    } catch (error) {
      console.error('Erreur AnalysisService.getAnalysisSentences:', error)
      throw error
    }
  }
}

// Export d'une instance singleton
export default new AnalysisService()
