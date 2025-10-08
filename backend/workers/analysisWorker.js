const amqp = require('amqplib');
const { sequelize } = require('../config/database');
const Analysis = require('../models/Analysis');
const Sentence = require('../models/Sentence');
const axios = require('axios');

class AnalysisWorker {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.queueName = process.env.ANALYSIS_QUEUE || 'analysis_queue';
    // TODO: declare this env in docker-compose.yml and in .env file
    this.rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672';
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY;
  }

  async connect() {
    try {
      console.log('🔄 Connexion à RabbitMQ...');
      this.connection = await amqp.connect(this.rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      
      // Declare the queue
      await this.channel.assertQueue(this.queueName, {
        durable: true // Persistent even if RabbitMQ restarts
      });
      
      console.log('✅ Connecté à RabbitMQ');
      console.log(`📋 En attente de messages sur la queue: ${this.queueName}`);
    } catch (error) {
      console.error('❌ Erreur de connexion à RabbitMQ:', error);
      throw error;
    }
  }

  async processAnalysis(analysisData) {
    const { analysisId, sourceText } = analysisData;
    
    try {
      console.log(`🔍 Traitement de l'analyse #${analysisId}...`);
      
      // Update the status of the analysis
      await Analysis.update(
        { status: 'processing' },
        { where: { id: analysisId } }
      );
      
      // Split the text into sentences
      const sentences = this.splitIntoSentences(sourceText);
      console.log(`📝 ${sentences.length} phrases détectées`);
      
      // Save each sentence in the database
      const sentencePromises = sentences.map((sentence, index) => {
        return Sentence.create({
          analysis_id: analysisId,
          sentence_text: sentence.trim(),
          position: index + 1,
          status: 'pending'
        });
      });
      
      const savedSentences = await Promise.all(sentencePromises);
      console.log(`✅ ${sentences.length} phrases sauvegardées`);
      
      // Analyser chaque phrase avec l'IA
      console.log(`🤖 Début de l'analyse IA des phrases...`);
      let duplicateCount = 0;
      
      for (const sentence of savedSentences) {
        try {
          // D'abord, vérifier les patterns communs
          const patternResult = this.detectCommonPatterns(sentence.sentence_text);
          
          let analysisResult;
          if (patternResult) {
            console.log(`🎯 Pattern détecté: ${patternResult.reasoning}`);
            analysisResult = patternResult;
          } else {
            // Sinon, analyser avec Perplexity
            analysisResult = await this.analyzeSentenceWithPerplexity(sentence.sentence_text);
          }
          
          // Mettre à jour la phrase avec les résultats
          await sentence.update({
            is_duplicate: analysisResult.isDuplicate,
            source_url: analysisResult.sourceUrl,
            confidence: analysisResult.confidence
          });
          
          // Log du reasoning pour debug
          if (analysisResult.reasoning) {
            console.log(`💭 Raisonnement: ${analysisResult.reasoning}`);
          }
          
          if (analysisResult.isDuplicate) {
            duplicateCount++;
          }
          
          console.log(`✅ Phrase #${sentence.id} analysée: ${analysisResult.isDuplicate ? 'DUPLIQUÉE' : 'ORIGINALE'}`);
          
        } catch (error) {
          console.error(`❌ Erreur lors de l'analyse de la phrase #${sentence.id}:`, error);
          // Marquer la phrase comme non analysée
          await sentence.update({
            is_duplicate: false,
            source_url: null,
            confidence: 0
          });
        }
      }
      
      // Calculer le pourcentage de duplication
      const duplicatePercent = Math.round((duplicateCount / savedSentences.length) * 100);
      
      // Update the analysis with final duplicate percentage
      await Analysis.update(
        { 
          duplicate_percent: duplicatePercent
        },
        { where: { id: analysisId } }
      );
      
      console.log(`🎉 Analyse #${analysisId} terminée: ${duplicatePercent}% de duplication (${duplicateCount}/${savedSentences.length} phrases dupliquées)`);
      
    } catch (error) {
      console.error(`❌ Erreur lors du traitement de l'analyse #${analysisId}:`, error);
      
      // Mettre à jour le statut en cas d'erreur
      try {
        await Analysis.update(
          { status: 'error' }, // status is not in database?
          { where: { id: analysisId } }
        );
      } catch (updateError) {
        console.error('❌ Erreur lors de la mise à jour du statut:', updateError);
      }
    }
  }

  async analyzeSentenceWithPerplexity(sentenceText) {
    if (!this.perplexityApiKey) {
      console.warn('⚠️ PERPLEXITY_API_KEY non configurée, simulation d\'analyse...');
      // Simulation pour les tests
      // TODO: delete this testing simulation
      return {
        isDuplicate: Math.random() > 0.7, // 30% de chance d'être dupliqué
        sourceUrl: Math.random() > 0.7 ? 'https://example.com/source' : null,
        confidence: Math.random() * 0.3 + 0.7, // 70-100% de confiance
        reasoning: "Simulation - pas de clé API"
      };
    }

    try {
      console.log(`🔍 Recherche Perplexity pour: "${sentenceText.substring(0, 50)}..."`);
      
      // Recherche avec Perplexity Search API
      const response = await axios.post('https://api.perplexity.ai/search', {
        query: sentenceText,
        max_results: 5,
        max_tokens_per_page: 1024
      }, {
        headers: {
          'Authorization': `Bearer ${this.perplexityApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      // Analyser les résultats de recherche
      const searchResults = response.data.results || [];
      const result = this.analyzeSearchResults(sentenceText, searchResults);
      
      console.log(`✅ Recherche terminée: ${result.isDuplicate ? 'DUPLIQUÉE' : 'ORIGINALE'} (confiance: ${result.confidence})`);
      if (result.sourceUrl) {
        console.log(`🔗 Source: ${result.sourceUrl}`);
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Erreur lors de la recherche Perplexity:', error);
      
      // Log des détails de l'erreur
      if (error.response) {
        console.error('📊 Status:', error.response.status);
        console.error('📊 Data:', error.response.data);
      }
      
      // En cas d'erreur, retourner une analyse par défaut
      return {
        isDuplicate: false,
        sourceUrl: null,
        confidence: 0.0,
        reasoning: `Erreur API: ${error.response?.status || 'Unknown'}`
      };
    }
  }

  // Analyser les résultats de recherche Perplexity - Détection stricte à 100%
  analyzeSearchResults(sentenceText, searchResults) {
    if (!searchResults || searchResults.length === 0) {
      return {
        isDuplicate: false,
        sourceUrl: null,
        confidence: 0.9,
        reasoning: "Aucun résultat trouvé en ligne"
      };
    }

    // Chercher une correspondance EXACTE à 100%
    for (const result of searchResults) {
      const resultText = result.text || result.snippet || '';
      
      // Vérification exacte (insensible à la casse)
      if (resultText.toLowerCase().includes(sentenceText.toLowerCase())) {
        return {
          isDuplicate: true,
          sourceUrl: result.url || result.link,
          confidence: 1.0,
          reasoning: `Phrase trouvée exactement sur ${result.domain || 'site web'}`
        };
      }
    }

    // Aucune correspondance exacte trouvée
    return {
      isDuplicate: false,
      sourceUrl: null,
      confidence: 0.9,
      reasoning: "Aucune correspondance exacte trouvée"
    };
  }


  // Détection de phrases très communes (patterns connus)
  detectCommonPatterns(sentenceText) {
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

    return null; // Pas de pattern détecté
  }

  splitIntoSentences(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }

    // Clean the text
    const cleanedText = text
      .replace(/\s+/g, ' ') // Replace multiple spaces by one
      .trim();

    // Split into sentences using dots, exclamation marks, question marks
    // but avoiding common abbreviations
    const sentences = cleanedText
      .split(/(?<=[.!?])\s+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0);

    // Filter sentences too short (less than 3 characters)
    return sentences.filter(sentence => sentence.length >= 3); // TODO: clarify, why 3?
  }

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

  async start() {
    try {
      // Wait a bit for the database to be ready
      console.log('⏳ Attente de la base de données...');
      await this.waitForDatabase();
      
      // Connect to the database
      await sequelize.authenticate();
      console.log('✅ Connexion à la base de données établie');
      
      // Synchronize models
      await sequelize.sync();
      console.log('✅ Modèles synchronisés avec la base de données');
      
      // Connect to RabbitMQ
      await this.connect();
      
      // Configure the consumer
      await this.channel.prefetch(1); // Process one task at a time
      
      // Start listening to messages
      await this.channel.consume(this.queueName, async (msg) => {
        if (msg !== null) {
          try {
            const analysisData = JSON.parse(msg.content.toString());
            console.log(`📨 Nouveau message reçu:`, analysisData);
            
            await this.processAnalysis(analysisData);
            
            // Confirmer le traitement du message
            this.channel.ack(msg);
          } catch (error) {
            console.error('❌ Erreur lors du traitement du message:', error);
            // Reject the message and put it back in the queue
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

// Handle stop signals
const worker = new AnalysisWorker();

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

// Start the worker
worker.start().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
