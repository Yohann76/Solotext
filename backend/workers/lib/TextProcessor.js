/**
 * BIBLIOTHÈQUE DE TRAITEMENT DE TEXTE
 * 
 * RESPONSABILITÉS :
 * - Découpage intelligent du texte en phrases
 * - Normalisation et nettoyage du texte
 * - Gestion des abréviations françaises
 * - Protection des patterns spéciaux (dates, nombres, etc.)
 * 
 * ALGORITHME AVANCÉ POUR LE FRANÇAIS :
 * - Protection des abréviations françaises
 * - Protection des nombres et dates
 * - Protection des points de suspension
 * - Découpage intelligent par ponctuation
 * - Filtrage et validation des phrases
 */

class TextProcessor {
  /**
   * DÉCOUPAGE DE TEXTE : Division en phrases individuelles
   * 
   * RÈGLES SPÉCIFIQUES AU FRANÇAIS :
   * - Abréviations : M., Mme, Dr., Prof., etc.
   * - Nombres : 1.2, 1,2, 1er, 1ère, etc.
   * - Dates : 01.01.2024, 01/01/2024
   * - Points de suspension : ...
   * - Phrases minimum 3 caractères
   */
  static splitIntoSentences(text) {
    // Validation du texte d'entrée
    if (!text || typeof text !== 'string') {
      return [];
    }

    // Nettoyage du texte (suppression des espaces multiples et normalisation)
    const cleanedText = text
      .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
      .replace(/\n+/g, ' ') // Remplacer les retours à la ligne par des espaces
      .replace(/\t+/g, ' ') // Remplacer les tabulations par des espaces
      .trim();

    // Map pour stocker le contenu original protégé
    const protectedContent = new Map();
    let protectCounter = 0;

    // Fonction pour protéger du contenu
    const protect = (match) => {
      const key = `__PROTECTED_${protectCounter++}__`;
      protectedContent.set(key, match);
      return key;
    };

    // Gestion des abréviations françaises courantes
    let processedText = cleanedText.replace(
      /\b(M\.|Mme|Mlle|Dr\.|Prof\.|Pr\.|Mgr|St\.|Ste|Col\.|Gén\.|Lieut\.|Sgt\.|Cpt\.|Maj\.|etc\.|cf\.|ex\.|p\.|pp\.|vol\.|n°|N°|av\.|apr\.|env\.|envir\.|art\.|chap\.|fig\.|tabl\.|1er|1ère|2e|2ème|3e|3ème|4e|4ème|2nd|2nde)\b/gi,
      protect
    );

    // Gestion des nombres décimaux (1.2, 1,2)
    processedText = processedText.replace(/\b\d+[.,]\d+\b/g, protect);

    // Gestion des dates (01.01.2024, 01/01/2024)
    processedText = processedText.replace(/\b\d{1,2}[./]\d{1,2}[./]\d{2,4}\b/g, protect);

    // Gestion des heures (14:30, 14h30)
    processedText = processedText.replace(/\b\d{1,2}[:h]\d{2}\b/g, protect);

    // Gestion des points de suspension
    processedText = processedText.replace(/\.{3,}/g, protect);

    // Découpage intelligent par ponctuation
    // Découper après ., !, ? suivis d'un espace et d'une majuscule
    const sentences = processedText
      .split(/(?<=[.!?])\s+(?=[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß])/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0);

    // Restauration du contenu protégé
    const restoredSentences = sentences.map(sentence => {
      let restored = sentence;
      // Restaurer tous les éléments protégés
      for (const [key, value] of protectedContent.entries()) {
        restored = restored.replace(key, value);
      }
      return restored.trim();
    });

    // Filtrage des phrases trop courtes et validation
    return restoredSentences
      .filter(sentence => sentence.length >= 3)
      .filter(sentence => /[.!?]/.test(sentence)) // Doit contenir une ponctuation de fin
      .filter(sentence => !/^\s*$/.test(sentence)); // Ne doit pas être vide
  }

  /**
   * NORMALISATION DU TEXTE : Préparation pour comparaison
   * 
   * PROCESSUS :
   * - Conversion en minuscules
   * - Suppression de la ponctuation non essentielle
   * - Normalisation des espaces
   * - Conservation des caractères spéciaux français
   */
  static normalizeText(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }

    return text.toLowerCase()
      .replace(/[^\w\s«»""''(),]/g, '') // Garder guillemets, parenthèses et virgules
      .replace(/\s+/g, ' ')            // Normaliser les espaces
      .trim();
  }


  /**
   * NETTOYAGE DU TEXTE : Suppression des éléments indésirables
   * 
   * SUPPRIME :
   * - Espaces multiples
   * - Retours à la ligne
   * - Tabulations
   * - Caractères de contrôle
   */
  static cleanText(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }

    return text
      .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
      .replace(/\n+/g, ' ') // Remplacer les retours à la ligne par des espaces
      .replace(/\t+/g, ' ') // Remplacer les tabulations par des espaces
      .replace(/[\x00-\x1F\x7F]/g, '') // Supprimer les caractères de contrôle
      .trim();
  }

  /**
   * VALIDATION DE PHRASE : Vérification de la validité d'une phrase
   * 
   * CRITÈRES :
   * - Longueur minimale
   * - Présence de ponctuation de fin
   * - Contenu non vide
   * - Pas uniquement des espaces
   */
  static isValidSentence(sentence) {
    if (!sentence || typeof sentence !== 'string') {
      return false;
    }

    const trimmed = sentence.trim();
    
    return trimmed.length >= 3 && // Longueur minimale
           /[.!?]/.test(trimmed) && // Ponctuation de fin
           !/^\s*$/.test(trimmed); // Pas uniquement des espaces
  }

  /**
   * COMPTAGE DE MOTS : Calcul du nombre de mots dans un texte
   * 
   * ALGORITHME :
   * - Normalisation du texte
   * - Découpage par espaces
   * - Filtrage des éléments vides
   */
  static countWords(text) {
    if (!text || typeof text !== 'string') {
      return 0;
    }

    const normalized = this.normalizeText(text);
    const words = normalized.split(/\s+/).filter(word => word.length > 0);
    return words.length;
  }

  /**
   * EXTRACTION DE MOTS : Récupération des mots uniques d'un texte
   * 
   * RETOURNE :
   * - Set des mots uniques
   * - Mots normalisés
   * - Sans doublons
   */
  static extractWords(text) {
    if (!text || typeof text !== 'string') {
      return new Set();
    }

    const normalized = this.normalizeText(text);
    const words = normalized.split(/\s+/).filter(word => word.length > 0);
    return new Set(words);
  }
}

module.exports = TextProcessor;
