const amqp = require('amqplib');
const { sequelize } = require('../config/database');
const Analysis = require('../models/Analysis');
const Sentence = require('../models/Sentence');

// Import des bibliothèques
const TextProcessor = require('./lib/TextProcessor');
const SimilarityAnalyzer = require('./lib/SimilarityAnalyzer');
const PerplexityService = require('./lib/PerplexityService');

/**
 * WORKER D'ANALYSE DE DUPLICATION DE TEXTE
 * 
 * FLUX GLOBAL DU WORKER :
 * 1. CONNEXION → Se connecte à RabbitMQ et à la base de données
 * 2. ÉCOUTE → Attend les messages d'analyse dans la queue
 * 3. DÉCOUPAGE → Divise le texte en phrases individuelles
 * 4. SAUVEGARDE → Enregistre chaque phrase en base de données
 * 5. ANALYSE IA → Pour chaque phrase :
 *    a) Détection de patterns communs (rapide)
 *    b) Si pas de pattern → Recherche Perplexity (IA)
 * 6. CALCUL → Détermine le pourcentage de duplication global
 * 7. FINALISATION → Met à jour l'analyse avec les résultats
 */
class AnalysisWorker {
  constructor() {
    // Configuration des connexions
    this.connection = null;
    this.channel = null;
    this.queueName = process.env.ANALYSIS_QUEUE || 'analysis_queue';
    this.rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672';
    
    // Initialisation des services
    this.perplexityService = new PerplexityService(process.env.PERPLEXITY_API_KEY);
  }

  // ========================================
  // SECTION 1 : CONNEXIONS ET CONFIGURATION
  // ========================================

  /**
   * ÉTAPE 1 : Connexion à RabbitMQ
   * Établit la connexion et configure la queue pour recevoir les messages d'analyse
   */
  async connect() {
    try {
      console.log('🔄 Connexion à RabbitMQ...');
      this.connection = await amqp.connect(this.rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      
      // Déclaration de la queue (persistante même après redémarrage)
      await this.channel.assertQueue(this.queueName, {
        durable: true
      });
      
      console.log('✅ Connecté à RabbitMQ');
      console.log(`📋 En attente de messages sur la queue: ${this.queueName}`);
    } catch (error) {
      console.error('❌ Erreur de connexion à RabbitMQ:', error);
      throw error;
    }
  }

  // ========================================
  // SECTION 2 : TRAITEMENT PRINCIPAL
  // ========================================

  /**
   * FONCTION PRINCIPALE : Traitement complet d'une analyse
   * 
   * FLUX DÉTAILLÉ :
   * 1. Mise à jour du statut → "processing"
   * 2. Découpage du texte → phrases individuelles
   * 3. Sauvegarde → chaque phrase en base de données
   * 4. Analyse IA → pour chaque phrase (patterns + Perplexity)
   * 5. Calcul → pourcentage de duplication global
   * 6. Finalisation → mise à jour de l'analyse
   */
  async processAnalysis(analysisData) {
    const { analysisId, sourceText } = analysisData;
    
    try {
      console.log(`🔍 Traitement de l'analyse #${analysisId}...`);
      
      // ÉTAPE 1 : Mise à jour du statut de l'analyse
      await Analysis.update(
        { status: 'sentence_segmentation_in_progress' },
        { where: { id: analysisId } }
      );
      
      // ÉTAPE 2 : Découpage du texte en phrases
      const sentences = TextProcessor.splitIntoSentences(sourceText);
      console.log(`📝 ${sentences.length} phrases détectées`);
      
      // ÉTAPE 3 : Sauvegarde de chaque phrase en base de données
      const sentencePromises = sentences.map((sentence, index) => {
        return Sentence.create({
          analysis_id: analysisId,
          sentence_text: sentence.trim(),
          position: index + 1
        });
      });
      
      const savedSentences = await Promise.all(sentencePromises);
      console.log(`✅ ${sentences.length} phrases sauvegardées`);
      
      // Mettre à jour le statut de l'analyse
      await Analysis.update(
        { status: 'sentence_segmentation_completed' },
        { where: { id: analysisId } }
      );
      
      // ÉTAPE 4 : Analyse IA de chaque phrase
      console.log(`🤖 Début de l'analyse IA des phrases...`);
      
      // Mettre à jour le statut pour indiquer que l'analyse des phrases commence
      await Analysis.update(
        { status: 'sentence_analysis_in_progress' },
        { where: { id: analysisId } }
      );
      
      let duplicateCount = 0;
      
      for (const sentence of savedSentences) {
        try {
          // 4a) Détection rapide de patterns communs
          const patternResult = SimilarityAnalyzer.detectCommonPatterns(sentence.sentence_text);
          
          let analysisResult;
          if (patternResult) {
            console.log(`🎯 Pattern détecté: ${patternResult.reasoning}`);
            analysisResult = patternResult;
          } else {
            // 4b) Analyse approfondie avec Perplexity IA
            analysisResult = await this.perplexityService.analyzeSentenceWithPerplexity(sentence.sentence_text);
          }
          
          // Mise à jour de la phrase avec les résultats
          await sentence.update({
            is_duplicate: analysisResult.isDuplicate,
            source_url: analysisResult.sourceUrl,
            confidence: analysisResult.confidence,
            is_test: true  // Marquer comme testée car l'analyse est terminée
          });
          
          // Log du raisonnement pour debug
          if (analysisResult.reasoning) {
            console.log(`💭 Raisonnement: ${analysisResult.reasoning}`);
          }
          
          if (analysisResult.isDuplicate) {
            duplicateCount++;
          }
          
          console.log(`✅ Phrase #${sentence.id} analysée: ${analysisResult.isDuplicate ? 'DUPLIQUÉE' : 'ORIGINALE'}`);
          
        } catch (error) {
          console.error(`❌ Erreur lors de l'analyse de la phrase #${sentence.id}:`, error);
          // Marquer la phrase comme testée mais non analysée en cas d'erreur
          await sentence.update({
            is_duplicate: false,
            source_url: null,
            confidence: 0,
            is_test: true  // Marquer comme testée même en cas d'erreur
          });
        }
      }
      
      // ÉTAPE 5 : Calcul du pourcentage de duplication global
      const duplicatePercent = savedSentences.length > 0 
        ? Math.round((duplicateCount / savedSentences.length) * 100)
        : 0;
      
      // ÉTAPE 6 : Finalisation - Mise à jour de l'analyse avec les résultats
      await Analysis.update(
        { 
          duplicate_percent: duplicatePercent,
          status: 'analysis_completed'
        },
        { where: { id: analysisId } }
      );
      
      console.log(`🎉 Analyse #${analysisId} terminée: ${duplicatePercent}% de duplication (${duplicateCount}/${savedSentences.length} phrases dupliquées)`);
      
    } catch (error) {
      console.error(`❌ Erreur lors du traitement de l'analyse #${analysisId}:`, error);
      
      // Mise à jour du statut en cas d'erreur
      try {
        await Analysis.update(
          { status: 'sentence_analysis_error' },
          { where: { id: analysisId } }
        );
      } catch (updateError) {
        console.error('❌ Erreur lors de la mise à jour du statut:', updateError);
      }
    }
  }

  // ========================================
  // SECTION 3 : UTILITAIRES DE CONNEXION
  // ========================================

  /**
   * ATTENTE DE LA BASE DE DONNÉES : Attente que la DB soit prête
   * 
   * UTILITÉ :
   * - Évite les erreurs de connexion au démarrage
   * - Permet au conteneur DB de s'initialiser
   * - Retry automatique avec délai
   */
  async waitForDatabase(maxRetries = 30, delay = 2000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await sequelize.authenticate();
        console.log('✅ Base de données prête');
        return;
      } catch (error) {
        console.log(`⏳ Tentative ${i + 1}/${maxRetries} - Base de données pas encore prête...`);
        if (i === maxRetries - 1) {
          throw new Error(`Impossible de se connecter à la base de données après ${maxRetries} tentatives`);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // ========================================
  // SECTION 4 : DÉMARRAGE ET GESTION
  // ========================================

  /**
   * DÉMARRAGE DU WORKER : Initialisation complète du système
   * 
   * SÉQUENCE DE DÉMARRAGE :
   * 1. Attente de la base de données
   * 2. Connexion à la base de données
   * 3. Synchronisation des modèles
   * 4. Connexion à RabbitMQ
   * 5. Configuration du consommateur
   * 6. Démarrage de l'écoute des messages
   */
  async start() {
    try {
      // ÉTAPE 1 : Attente de la base de données
      console.log('⏳ Attente de la base de données...');
      await this.waitForDatabase();
      
      // ÉTAPE 2 : Connexion à la base de données
      await sequelize.authenticate();
      console.log('✅ Connexion à la base de données établie');
      
      // ÉTAPE 3 : Synchronisation des modèles
      await sequelize.sync();
      console.log('✅ Modèles synchronisés avec la base de données');
      
      // ÉTAPE 4 : Connexion à RabbitMQ
      await this.connect();
      
      // ÉTAPE 5 : Configuration du consommateur (une tâche à la fois)
      await this.channel.prefetch(1);
      
      // ÉTAPE 6 : Démarrage de l'écoute des messages
      await this.channel.consume(this.queueName, async (msg) => {
        if (msg !== null) {
          try {
            const analysisData = JSON.parse(msg.content.toString());
            console.log(`📨 Nouveau message reçu:`, analysisData);
            
            // Traitement de l'analyse
            await this.processAnalysis(analysisData);
            
            // Confirmation du traitement du message
            this.channel.ack(msg);
          } catch (error) {
            console.error('❌ Erreur lors du traitement du message:', error);
            // Rejet du message et remise en queue
            this.channel.nack(msg, false, true);
          }
        }
      });
      
      console.log('🚀 Analysis Worker démarré et en écoute...');
      
    } catch (error) {
      console.error('❌ Erreur lors du démarrage du worker:', error);
      process.exit(1);
    }
  }

  /**
   * ARRÊT DU WORKER : Fermeture propre des connexions
   * 
   * PROCESSUS :
   * 1. Fermeture du canal RabbitMQ
   * 2. Fermeture de la connexion RabbitMQ
   * 3. Log de confirmation
   */
  async stop() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      console.log('🛑 Analysis Worker arrêté proprement');
    } catch (error) {
      console.error('❌ Erreur lors de l\'arrêt du worker:', error);
    }
  }
}

// ========================================
// SECTION 5 : GESTION DES SIGNAUX ET DÉMARRAGE
// ========================================

// Création de l'instance du worker
const worker = new AnalysisWorker();

// Gestion des signaux d'arrêt pour fermeture propre
process.on('SIGINT', async () => {
  console.log('\n🛑 Signal d\'arrêt reçu...');
  await worker.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Signal de terminaison reçu...');
  await worker.stop();
  process.exit(0);
});

// Démarrage du worker
worker.start().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
