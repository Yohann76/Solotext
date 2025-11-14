/**
 * BIBLIOTHÈQUE D'ANALYSE DE SIMILARITÉ
 * 
 * RESPONSABILITÉS :
 * - Calcul de similarité entre textes
 * - Détection de patterns communs de duplication
 * - Algorithmes de comparaison de texte
 * - Gestion des patterns évidents de duplication
 * 
 * ALGORITHMES INCLUS :
 * - Algorithme de Jaccard simplifié
 * - Détection de correspondance exacte
 * - Recherche de sous-chaînes longues
 * - Patterns de contenu web et marketing
 */

class SimilarityAnalyzer {
  /**
   * CALCUL DE SIMILARITÉ : Algorithme de Jaccard simplifié
   * 
   * PROCESSUS :
   * 1. Normalisation des textes (ponctuation, espaces)
   * 2. Vérification d'inclusion exacte
   * 3. Recherche de sous-chaînes longues communes
   * 4. Calcul de similarité basé sur les mots communs
   * 
   * @param {string} text1 - Premier texte à comparer
   * @param {string} text2 - Deuxième texte à comparer
   * @returns {number} - Score de similarité entre 0 et 1
   */
  static calculateSimilarity(text1, text2) {
    // Normalisation simple des textes pour comparaison
    const normalize = (text) => {
      return text.toLowerCase()
        .replace(/\s+/g, ' ')  // Normaliser les espaces
        .replace(/(\d)\s+(\d)/g, '$1$2')  // Supprimer espaces dans nombres (48 700 → 48700)
        .replace(/(\d+)[\s,]*%/g, '$1%')  // Normaliser pourcentages (48 700% → 48700%)
        .replace(/[^\w\s%()]/g, ' ')  // Supprimer ponctuation sauf parenthèses et %
        .replace(/\s+/g, ' ')  // Normaliser espaces après suppression ponctuation
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
   * DÉTECTION RAPIDE : Patterns de contenu très communs
   * 
   * AVANTAGES :
   * - Détection instantanée (pas d'appel API)
   * - Économise les coûts Perplexity
   * - Détecte les patterns évidents de duplication
   * 
   * TYPES DE PATTERNS :
   * - Contenu web (boutons, liens)
   * - Contenu de référence (dictionnaires, encyclopédies)
   * - Contenu factuel (définitions, études)
   * - Contenu marketing (promotions, publicités)
   * 
   * @param {string} sentenceText - Texte de la phrase à analyser
   * @returns {Object|null} - Résultat de l'analyse ou null si aucun pattern
   */
  static detectCommonPatterns(sentenceText) {
    const commonPatterns = [
      // Patterns de sites web
      { pattern: /abonnez-vous|découvrez|en savoir plus|cliquez ici/i, type: 'web_content', confidence: 0.9 },
      { pattern: /dictionnaire|encyclopédie|définition/i, type: 'reference_content', confidence: 0.8 },
      
      // Patterns de contenu factuel
      { pattern: /sont des.*que l'on trouve|appartiennent à la famille|font partie de/i, type: 'encyclopedic', confidence: 0.7 },
      { pattern: /selon.*étude|d'après.*recherche|il a été démontré/i, type: 'academic', confidence: 0.8 },
      
      // Patterns de marketing
      { pattern: /obtenez|gratuit|sans publicité|milliers de/i, type: 'marketing', confidence: 0.9 }
    ];

    // Test de chaque pattern
    for (const pattern of commonPatterns) {
      if (pattern.pattern.test(sentenceText)) {
        return {
          isDuplicate: true,
          sourceUrl: `${pattern.type}.com`,
          confidence: pattern.confidence,
          reasoning: `Détecté pattern: ${pattern.type}`
        };
      }
    }

    return null; // Aucun pattern détecté
  }

  /**
   * ANALYSE DE CORRESPONDANCE EXACTE : Vérification de correspondance stricte
   * 
   * @param {string} text1 - Premier texte
   * @param {string} text2 - Deuxième texte
   * @returns {boolean} - True si correspondance exacte
   */
  static isExactMatch(text1, text2) {
    if (!text1 || !text2) return false;
    
    const normalized1 = text1.toLowerCase().trim();
    const normalized2 = text2.toLowerCase().trim();
    
    return normalized1 === normalized2;
  }

  /**
   * ANALYSE DE CORRESPONDANCE PARTIELLE : Vérification d'inclusion
   * 
   * @param {string} text1 - Premier texte
   * @param {string} text2 - Deuxième texte
   * @returns {Object} - Résultat de l'analyse d'inclusion
   */
  static analyzePartialMatch(text1, text2) {
    if (!text1 || !text2) {
      return { isMatch: false, similarity: 0, reason: 'Textes vides' };
    }

    const normalized1 = text1.toLowerCase().trim();
    const normalized2 = text2.toLowerCase().trim();

    // Vérification d'inclusion directe
    if (normalized1.includes(normalized2)) {
      return {
        isMatch: true,
        similarity: 1.0,
        reason: 'Inclusion directe',
        longerText: text1,
        shorterText: text2
      };
    }

    if (normalized2.includes(normalized1)) {
      return {
        isMatch: true,
        similarity: 1.0,
        reason: 'Inclusion inverse',
        longerText: text2,
        shorterText: text1
      };
    }

    // Calcul de similarité si pas d'inclusion directe
    const similarity = this.calculateSimilarity(text1, text2);
    
    return {
      isMatch: similarity >= 0.92,
      similarity: similarity,
      reason: similarity >= 0.92 ? 'Similarité élevée' : 'Similarité faible'
    };
  }

  /**
   * DÉTECTION DE PATTERNS SPÉCIFIQUES : Patterns personnalisés
   * 
   * @param {string} text - Texte à analyser
   * @param {Array} customPatterns - Patterns personnalisés
   * @returns {Object|null} - Résultat de l'analyse ou null
   */
  static detectCustomPatterns(text, customPatterns) {
    if (!text || !Array.isArray(customPatterns)) {
      return null;
    }

    for (const pattern of customPatterns) {
      if (pattern.regex && pattern.regex.test(text)) {
        return {
          isDuplicate: pattern.isDuplicate || true,
          sourceUrl: pattern.sourceUrl || 'custom_pattern',
          confidence: pattern.confidence || 0.8,
          reasoning: pattern.reasoning || `Pattern personnalisé: ${pattern.name || 'inconnu'}`
        };
      }
    }

    return null;
  }

  /**
   * CALCUL DE SIMILARITÉ AVANCÉE : Avec seuils personnalisés
   * 
   * @param {string} text1 - Premier texte
   * @param {string} text2 - Deuxième texte
   * @param {Object} options - Options de calcul
   * @returns {Object} - Résultat détaillé de l'analyse
   */
  static calculateAdvancedSimilarity(text1, text2, options = {}) {
    const {
      minSimilarity = 0.92,
      checkExactMatch = true,
      checkPartialMatch = true,
      checkSubstrings = true
    } = options;

    const result = {
      similarity: 0,
      isMatch: false,
      matchType: 'none',
      confidence: 0,
      details: {}
    };

    // Correspondance exacte
    if (checkExactMatch && this.isExactMatch(text1, text2)) {
      result.similarity = 1.0;
      result.isMatch = true;
      result.matchType = 'exact';
      result.confidence = 1.0;
      result.details.exactMatch = true;
      return result;
    }

    // Correspondance partielle
    if (checkPartialMatch) {
      const partialResult = this.analyzePartialMatch(text1, text2);
      result.details.partialMatch = partialResult;
      
      if (partialResult.isMatch) {
        result.similarity = partialResult.similarity;
        result.isMatch = true;
        result.matchType = 'partial';
        result.confidence = partialResult.similarity;
        return result;
      }
    }

    // Calcul de similarité standard
    result.similarity = this.calculateSimilarity(text1, text2);
    result.isMatch = result.similarity >= minSimilarity;
    result.matchType = result.isMatch ? 'similarity' : 'none';
    result.confidence = result.similarity;

    return result;
  }

  /**
   * VALIDATION DE SEUIL : Vérification si la similarité dépasse un seuil
   * 
   * @param {string} text1 - Premier texte
   * @param {string} text2 - Deuxième texte
   * @param {number} threshold - Seuil de similarité (0-1)
   * @returns {boolean} - True si similarité >= seuil
   */
  static isSimilarityAboveThreshold(text1, text2, threshold = 0.92) {
    const similarity = this.calculateSimilarity(text1, text2);
    return similarity >= threshold;
  }
}

module.exports = SimilarityAnalyzer;
