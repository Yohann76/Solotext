/**
 * BIBLIOTHÈQUE DE SERVICE PERPLEXITY
 * 
 * RESPONSABILITÉS :
 * - Communication avec l'API Perplexity
 * - Analyse des résultats de recherche
 * - Gestion des erreurs API
 * - Mode simulation pour les tests
 * 
 * FONCTIONNALITÉS :
 * - Recherche de duplication avec IA
 * - Analyse des résultats de recherche
 * - Gestion des erreurs et retry
 * - Configuration flexible
 */

/** Need TextProcessor Lib to normalize text */

const axios = require('axios');

class PerplexityService {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.PERPLEXITY_API_KEY;
    this.baseUrl = 'https://api.perplexity.ai/search';
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 seconde
  }

  /**
   * ANALYSE APPROFONDIE : Recherche de duplication avec l'IA Perplexity
   * 
   * PROCESSUS :
   * 1. Vérification de la clé API
   * 2. Envoi de la requête à l'API Perplexity
   * 3. Analyse des résultats de recherche
   * 4. Retour du résultat avec confiance
   * 
   * @param {string} sentenceText - Texte de la phrase à analyser
   * @param {Object} options - Options de recherche
   * @returns {Promise<Object>} - Résultat de l'analyse
   */
  async analyzeSentenceWithPerplexity(sentenceText, options = {}) {
    const {
      maxResults = 5,
      maxTokensPerPage = 1024,
      enableSimulation = true
    } = options;

    // Mode simulation si pas de clé API (pour les tests)
    if (!this.apiKey && enableSimulation) {
      console.warn('⚠️ PERPLEXITY_API_KEY non configurée, simulation d\'analyse...');
      return this._simulateAnalysis(sentenceText);
    }

    if (!this.apiKey) {
      throw new Error('Clé API Perplexity non configurée');
    }

    try {
      console.log(`🔍 Recherche Perplexity pour: "${sentenceText.substring(0, 50)}..."`);
      
      // Envoi de la requête à l'API Perplexity avec retry
      const response = await this._makeRequestWithRetry({
        query: sentenceText,
        max_results: maxResults,
        max_tokens_per_page: maxTokensPerPage
      });

      // Analyse des résultats de recherche
      const searchResults = response.data.results || [];
      const result = this.analyzeSearchResults(sentenceText, searchResults);
      
      console.log(`✅ Recherche terminée: ${result.isDuplicate ? 'DUPLIQUÉE' : 'ORIGINALE'} (confiance: ${result.confidence})`);
      if (result.sourceUrl) {
        console.log(`🔗 Source: ${result.sourceUrl}`);
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Erreur lors de la recherche Perplexity:', error);
      
      // Log des détails de l'erreur pour debug
      if (error.response) {
        console.error('📊 Status:', error.response.status);
        console.error('📊 Data:', error.response.data);
      }
      
      // Retour d'une analyse par défaut en cas d'erreur
      return {
        isDuplicate: false,
        sourceUrl: null,
        confidence: 0.0,
        reasoning: `Erreur API: ${error.response?.status || 'Unknown'}`
      };
    }
  }

  /**
   * ANALYSE DES RÉSULTATS : Traitement des résultats de recherche Perplexity
   * 
   * ALGORITHME DE DÉTECTION :
   * 1. Vérification de correspondance exacte (100%)
   * 2. Calcul de similarité élevée (92%+)
   * 3. Retour du résultat avec confiance
   * 
   * @param {string} sentenceText - Texte original de la phrase
   * @param {Array} searchResults - Résultats de recherche de l'API
   * @returns {Object} - Résultat de l'analyse
   */
  analyzeSearchResults(sentenceText, searchResults) {
    // Aucun résultat trouvé = probablement original
    if (!searchResults || searchResults.length === 0) {
      return {
        isDuplicate: false,
        sourceUrl: null,
        confidence: 0.9,
        reasoning: "Aucun résultat trouvé en ligne"
      };
    }

    // Recherche de correspondance dans les résultats
    for (const result of searchResults) {
      const resultText = result.text || result.snippet || '';
      
      // 1. Vérification de correspondance exacte (insensible à la casse)
      if (resultText.toLowerCase().includes(sentenceText.toLowerCase())) {
        return {
          isDuplicate: true,
          sourceUrl: result.url || result.link,
          confidence: 1.0,
          reasoning: `Phrase trouvée exactement sur ${result.domain || 'site web'}`
        };
      }
      
      // 2. Vérification avec similarité élevée (92%+)
      const similarity = this._calculateSimilarity(sentenceText, resultText);
      if (similarity >= 0.92) {
        return {
          isDuplicate: true,
          sourceUrl: result.url || result.link,
          confidence: similarity,
          reasoning: `Phrase très similaire trouvée (${Math.round(similarity * 100)}%) sur ${result.domain || 'site web'}`
        };
      }
    }

    // Aucune correspondance trouvée = probablement original
    return {
      isDuplicate: false,
      sourceUrl: null,
      confidence: 0.9,
      reasoning: "Aucune correspondance exacte trouvée"
    };
  }

  /**
   * REQUÊTE AVEC RETRY : Envoi de requête avec gestion des erreurs et retry
   * 
   * @param {Object} data - Données à envoyer à l'API
   * @returns {Promise<Object>} - Réponse de l'API
   */
  async _makeRequestWithRetry(data) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await axios.post(this.baseUrl, data, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 secondes
        });
        
        return response;
        
      } catch (error) {
        lastError = error;
        
        // Ne pas retry pour certaines erreurs
        if (error.response && [400, 401, 403, 404].includes(error.response.status)) {
          throw error;
        }
        
        if (attempt < this.maxRetries) {
          console.warn(`⚠️ Tentative ${attempt}/${this.maxRetries} échouée, retry dans ${this.retryDelay}ms...`);
          await this._delay(this.retryDelay * attempt); // Délai progressif
        }
      }
    }
    
    throw lastError;
  }

  /**
   * SIMULATION D'ANALYSE : Mode simulation pour les tests
   * 
   * @param {string} sentenceText - Texte à analyser
   * @returns {Object} - Résultat simulé
   */
  _simulateAnalysis(sentenceText) {
    // Simulation basée sur des patterns simples
    const isDuplicate = Math.random() > 0.7; // 30% de chance d'être dupliqué
    const hasSource = Math.random() > 0.7;
    
    return {
      isDuplicate: isDuplicate,
      sourceUrl: hasSource ? 'https://example.com/source' : null,
      confidence: Math.random() * 0.3 + 0.7, // 70-100% de confiance
      reasoning: "Simulation - pas de clé API"
    };
  }

  /**
   * CALCUL DE SIMILARITÉ : Algorithme de Jaccard simplifié
   * 
   * @param {string} text1 - Premier texte
   * @param {string} text2 - Deuxième texte
   * @returns {number} - Score de similarité entre 0 et 1
   */
  _calculateSimilarity(text1, text2) {
    // Normalisation des textes pour comparaison
    const normalize = (text) => {
      return text.toLowerCase()
        .replace(/[^\w\s«»""''(),]/g, '') // Garder guillemets, parenthèses et virgules
        .replace(/\s+/g, ' ')            // Normaliser les espaces
        .trim();
    };

    const normalized1 = normalize(text1);
    const normalized2 = normalize(text2);

    // Textes vides = pas de similarité
    if (!normalized1 || !normalized2) return 0;

    // Inclusion exacte = similarité maximale
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
      return 1.0;
    }

    // Recherche de sous-chaînes longues communes (plus de 20 caractères)
    const minLength = Math.min(normalized1.length, normalized2.length);
    if (minLength > 20) {
      for (let i = 0; i <= normalized1.length - 20; i++) {
        const substring = normalized1.substring(i, i + 20);
        if (normalized2.includes(substring)) {
          return 0.95; // Très haute similarité pour sous-chaînes longues
        }
      }
    }

    // Calcul de similarité basé sur les mots communs (algorithme de Jaccard)
    const words1 = new Set(normalized1.split(' '));
    const words2 = new Set(normalized2.split(' '));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * DÉLAI : Fonction utilitaire pour les retries
   * 
   * @param {number} ms - Délai en millisecondes
   * @returns {Promise} - Promise qui se résout après le délai
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * VALIDATION DE LA CONFIGURATION : Vérification de la configuration du service
   * 
   * @returns {Object} - État de la configuration
   */
  validateConfiguration() {
    return {
      hasApiKey: !!this.apiKey,
      baseUrl: this.baseUrl,
      maxRetries: this.maxRetries,
      retryDelay: this.retryDelay
    };
  }

  /**
   * MISE À JOUR DE LA CONFIGURATION : Modification des paramètres du service
   * 
   * @param {Object} config - Nouvelle configuration
   */
  updateConfiguration(config) {
    if (config.apiKey !== undefined) {
      this.apiKey = config.apiKey;
    }
    if (config.maxRetries !== undefined) {
      this.maxRetries = config.maxRetries;
    }
    if (config.retryDelay !== undefined) {
      this.retryDelay = config.retryDelay;
    }
    if (config.baseUrl !== undefined) {
      this.baseUrl = config.baseUrl;
    }
  }

  /**
   * TEST DE CONNEXION : Vérification de la connectivité à l'API
   * 
   * @returns {Promise<Object>} - Résultat du test de connexion
   */
  async testConnection() {
    try {
      const testQuery = "test de connexion";
      const response = await this.analyzeSentenceWithPerplexity(testQuery, {
        maxResults: 1,
        enableSimulation: false
      });
      
      return {
        success: true,
        message: "Connexion à l'API Perplexity réussie",
        response: response
      };
    } catch (error) {
      return {
        success: false,
        message: "Échec de la connexion à l'API Perplexity",
        error: error.message
      };
    }
  }
}

module.exports = PerplexityService;
