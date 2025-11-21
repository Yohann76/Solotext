/**
 * Utilitaire de traitement de texte pour le frontend
 * Implémente le même algorithme que le backend TextProcessor
 * pour un comptage en temps réel des phrases
 */

/**
 * Découpage de texte en phrases (même algorithme que le backend)
 * 
 * RÈGLES SPÉCIFIQUES AU FRANÇAIS :
 * - Abréviations : M., Mme, Dr., Prof., etc.
 * - Nombres : 1.2, 1,2, 1er, 1ère, etc.
 * - Dates : 01.01.2024, 01/01/2024
 * - Points de suspension : ...
 * - Phrases minimum 3 caractères
 */
export function splitIntoSentences(text) {
  // Validation du texte d'entrée
  if (!text || typeof text !== 'string') {
    return []
  }

  // Nettoyage du texte (suppression des espaces multiples et normalisation)
  const cleanedText = text
    .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
    .replace(/\n+/g, ' ') // Remplacer les retours à la ligne par des espaces
    .replace(/\t+/g, ' ') // Remplacer les tabulations par des espaces
    .trim()

  // Map pour stocker le contenu original protégé
  const protectedContent = new Map()
  let protectCounter = 0

  // Fonction pour protéger du contenu
  const protect = (match) => {
    const key = `__PROTECTED_${protectCounter++}__`
    protectedContent.set(key, match)
    return key
  }

  // Gestion des abréviations françaises courantes
  let processedText = cleanedText.replace(
    /\b(M\.|Mme|Mlle|Dr\.|Prof\.|Pr\.|Mgr|St\.|Ste|Col\.|Gén\.|Lieut\.|Sgt\.|Cpt\.|Maj\.|etc\.|cf\.|ex\.|p\.|pp\.|vol\.|n°|N°|av\.|apr\.|env\.|envir\.|art\.|chap\.|fig\.|tabl\.|1er|1ère|2e|2ème|3e|3ème|4e|4ème|2nd|2nde)\b/gi,
    protect
  )

  // Gestion des nombres décimaux (1.2, 1,2)
  processedText = processedText.replace(/\b\d+[.,]\d+\b/g, protect)

  // Gestion des dates (01.01.2024, 01/01/2024)
  processedText = processedText.replace(/\b\d{1,2}[./]\d{1,2}[./]\d{2,4}\b/g, protect)

  // Gestion des heures (14:30, 14h30)
  processedText = processedText.replace(/\b\d{1,2}[:h]\d{2}\b/g, protect)

  // Gestion des points de suspension
  processedText = processedText.replace(/\.{3,}/g, protect)

  // Découpage intelligent par ponctuation
  // Découper après ., !, ? suivis d'un espace et d'une majuscule
  const sentences = processedText
    .split(/(?<=[.!?])\s+(?=[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß])/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 0)

  // Restauration du contenu protégé
  const restoredSentences = sentences.map(sentence => {
    let restored = sentence
    // Restaurer tous les éléments protégés
    for (const [key, value] of protectedContent.entries()) {
      restored = restored.replace(key, value)
    }
    return restored.trim()
  })

  // Filtrage des phrases trop courtes et validation
  return restoredSentences
    .filter(sentence => sentence.length >= 3)
    .filter(sentence => /[.!?]/.test(sentence)) // Doit contenir une ponctuation de fin
    .filter(sentence => !/^\s*$/.test(sentence)) // Ne doit pas être vide
}

/**
 * Comptage de mots dans un texte
 */
export function countWords(text) {
  if (!text || typeof text !== 'string') {
    return 0
  }

  const normalized = text
    .toLowerCase()
    .replace(/[^\w\s«»""''(),]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  const words = normalized.split(/\s+/).filter(word => word.length > 0)
  return words.length
}

/**
 * Calculer les statistiques d'un texte
 */
export function getTextStats(text) {
  const sentences = splitIntoSentences(text)
  const words = countWords(text)
  const characters = text ? text.length : 0

  return {
    sentences: sentences.length,
    words,
    characters,
    credits: sentences.length // 1 phrase = 1 crédit
  }
}

