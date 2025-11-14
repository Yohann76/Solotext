/**
 * Workers Directory
 * 
 * Ce dossier contient tous les workers de l'application.
 * Chaque worker est responsable du traitement asynchrone d'un type de tâche spécifique.
 * 
 * Workers disponibles :
 * - analysisWorker.js : Traite les analyses de texte (séparation en phrases, etc.)
 * 
 * Pour ajouter un nouveau worker :
 * 1. Créer un nouveau fichier worker dans ce dossier
 * 2. Exporter la classe du worker
 * 3. Ajouter le service dans docker-compose.yml
 * 4. Créer un Dockerfile dédié si nécessaire
 */

/**
 * Workers Reflex
 * 
 * 1er worker : cut texte in sentence and save in database
 * 2nd worker : test each sentence with AI and save in database (and update analysis status, %)
 */

/**
 * TODO
 * 
 * Rename AnalysisWorker to WorkerCutTextToSentence
 * Create Worker : WorkerAnalysisSentence
 */

const AnalysisWorker = require('./analysisWorker');

module.exports = {
  AnalysisWorker
};
