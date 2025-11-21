const amqp = require('amqplib');
const { sequelize } = require('../config/database');
const Analysis = require('../models/Analysis');
const Sentence = require('../models/Sentence');
const ApiCall = require('../models/ApiCall');
const AdminConfigProvider = require('../models/AdminConfigProvider');

// Import libraries and services
const TextProcessor = require('./lib/TextProcessor');
const SimilarityAnalyzer = require('./lib/SimilarityAnalyzer');
const PerplexityService = require('./lib/PerplexityService');
const ProviderService = require('./lib/ProviderService');

class AnalysisWorker {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.queueName = process.env.ANALYSIS_QUEUE || 'analysis_queue';
    // Note: In Docker, use service name (e.g., 'rabbitmq'), not 'localhost'
    const defaultHost = process.env.NODE_ENV === 'production' ? 'rabbitmq' : 'localhost';
    this.rabbitmqUrl = process.env.RABBITMQ_URL || `amqp://admin:admin123@${defaultHost}:5672`;
    this.perplexityService = new PerplexityService(process.env.PERPLEXITY_API_KEY);
    this.providerService = new ProviderService();
  }

  // ========================================
  // SECTION 1 : CONNECTIONS AND CONFIGURATION
  // ========================================

  /**
   * Record a Perplexity API call for a user
   * @param {number} userId - User ID
   * @param {string} endpoint - Endpoint of the API called
   */
  async recordPerplexityCall(userId) {
    try {
      const perplexityProvider = await AdminConfigProvider.findOne({
        where: { provider_name: 'perplexity_search' }
      });

      if (!perplexityProvider) {
        console.error('❌ Perplexity provider not found in configuration.');
        return;
      }

      await ApiCall.create({
        user_id: userId,
        admin_config_provider_id: perplexityProvider.id,
        call_date: new Date(),
        call_count: 1
      });

      console.log(`📊 New Perplexity call recorded for user ${userId}`);

    } catch (error) {
      console.error('❌ Error recording Perplexity call:', error);
    }
  }

  async connect() {
    try {
      console.log('🔄 Connecting to RabbitMQ...');
      this.connection = await amqp.connect(this.rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      
      // declare queue (persistent even after restart)
      await this.channel.assertQueue(this.queueName, {
        durable: true
      });
      
      console.log('✅ Connected to RabbitMQ');
      console.log(`📋 Waiting for messages on queue: ${this.queueName}`);
    } catch (error) {
      console.error('❌ Error connecting to RabbitMQ:', error);
      throw error;
    }
  }

  // ========================================
  // SECTION 2 : MAIN PROCESSING
  // ========================================

  async processAnalysis(analysisData) {
    const { analysisId, sourceText } = analysisData;
    
    try {
      console.log(`🔍 Processing analysis #${analysisId}...`);
      
      await Analysis.update(
        { status: 'sentence_segmentation_in_progress' },
        { where: { id: analysisId } }
      );
      
      // split text into sentences
      const sentences = TextProcessor.splitIntoSentences(sourceText);
      console.log(`📝 ${sentences.length} sentences detected`);
    
      // save each sentence to database
      const sentencePromises = sentences.map((sentence, index) => {
        return Sentence.create({
          analysis_id: analysisId,
          sentence_text: sentence.trim(),
          position: index + 1
        });
      });
      
      const savedSentences = await Promise.all(sentencePromises);
      console.log(`✅ ${sentences.length} sentences saved`);
      
      // get analysis to get user_id
      const analysis = await Analysis.findByPk(analysisId);
      if (!analysis) {
        throw new Error(`Analysis #${analysisId} not found`);
      }
      
      await Analysis.update(
        { status: 'sentence_segmentation_completed' },
        { where: { id: analysisId } }
      );
      
      console.log(`🤖 Start AI analysis of sentences...`);
      await Analysis.update(
        { status: 'sentence_analysis_in_progress' },
        { where: { id: analysisId } }
      );
      
      let duplicateCount = 0;
      
      for (const sentence of savedSentences) {
        try {
          // 4a) Détection rapide de patterns communs // TODO : why?
          const patternResult = SimilarityAnalyzer.detectCommonPatterns(sentence.sentence_text);
          
          let analysisResult;
          if (patternResult) {
            console.log(`🎯 Pattern detected: ${patternResult.reasoning}`);
            analysisResult = patternResult;
          } else {
            // Use ProviderService to decide which service to call
            const activeProviders = this.providerService.getActiveProviders();

            // Feature flagging logic
            if (this.providerService.isProviderActive('perplexity_search')) {
              console.log('🤖 Utilisation de Perplexity...');
              // TODO: define input/output for reproduct with different providers
              analysisResult = await this.perplexityService.analyzeSentenceWithPerplexity(sentence.sentence_text);
              // TODO: replace recordPerplexityCall with recordProviderCall or service (uncharge function in this worker file)
              await this.recordPerplexityCall(analysis.user_id);
            } 
            // You can add other providers here
            // else if (this.providerService.isProviderActive('bing_search')) {
            //   console.log('🤖 Using Bing...');
            //   // analysisResult = await this.bingService.analyze(...);
            //   // await this.recordBingCall(...);
            // } 

            // Bing, Apify, DataForSEO, Google content search, etc... (not implemented yet)
            else {
              console.warn('⚠️ No provider active. Using default provider (Perplexity).');
              console.log('⚠️ No provider active. Using default provider (Perplexity) for sentence #${sentence.id}');
              // perplexity is a default provider
              analysisResult = await this.perplexityService.analyzeSentenceWithPerplexity(sentence.sentence_text);
              await this.recordPerplexityCall(analysis.user_id);
            }
          }
          
          // Update sentence with results
          await sentence.update({
            is_duplicate: analysisResult.isDuplicate,
            source_url: analysisResult.sourceUrl,
            confidence: analysisResult.confidence,
            is_test: true  // Marquer comme testée car l'analyse est terminée
          });
          
          // Log reasoning for debug
          if (analysisResult.reasoning) {
            console.log(`💭 Reasoning: ${analysisResult.reasoning}`);
          }
          
          if (analysisResult.isDuplicate) {
            duplicateCount++;
          }
          
          console.log(`✅ Sentence #${sentence.id} analyzed: ${analysisResult.isDuplicate ? 'DUPLICATED' : 'ORIGINAL'}`);
          
        } catch (error) {
          console.error(`❌ Error analyzing sentence #${sentence.id}:`, error);
          // Mark sentence as tested but not analyzed in case of error
          await sentence.update({
            is_duplicate: false,
            source_url: null,
            confidence: 0,
            is_test: true  // Mark sentence as tested but not analyzed in case of error // ? 
          });
        }
      }
      
      // Calculate global duplication percentage
      const duplicatePercent = savedSentences.length > 0 
        ? Math.round((duplicateCount / savedSentences.length) * 100)
        : 0;
      
      // Finalization - Update analysis with results
      await Analysis.update(
        { 
          duplicate_percent: duplicatePercent,
          status: 'analysis_completed'
        },
        { where: { id: analysisId } }
      );
      
      console.log(`🎉 Analysis #${analysisId} completed: ${duplicatePercent}% of duplication (${duplicateCount}/${savedSentences.length} sentences duplicated)`);
      
    } catch (error) {
      console.error(`❌ Error processing analysis #${analysisId}:`, error);
      
      // Update status in case of error
      try {
        await Analysis.update(
          { status: 'sentence_analysis_error' },
          { where: { id: analysisId } }
        );
      } catch (updateError) {
        console.error('❌ Error updating status:', updateError);
      }
    }
  }

  // ========================================
  // SECTION 3 : CONNECTION UTILITIES
  // ========================================

  async waitForDatabase(maxRetries = 30, delay = 2000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await sequelize.authenticate();
        console.log('✅ Database ready');
        return;
      } catch (error) {
        console.log(`⏳ Attempt ${i + 1}/${maxRetries} - Database not ready...`);
        if (i === maxRetries - 1) {
          throw new Error(`Unable to connect to database after ${maxRetries} attempts`);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // ========================================
  // SECTION 4 : START AND MANAGEMENT
  // ========================================

  async start() {
    try {
      // ÉTAPE 1 : Attente de la base de données
      console.log('⏳ Waiting for database...');
      await this.waitForDatabase();
      
      // ÉTAPE 2 : Connexion à la base de données
      await sequelize.authenticate();
      console.log('✅ Database connection established');
      
      // ÉTAPE 3 : Synchronisation des modèles
      await sequelize.sync();
      console.log('✅ Models synchronized with database');

      // Load active providers
      await this.providerService.loadProviders();
      
      // Connect to RabbitMQ
      await this.connect();
      
      // Configure consumer (one task at a time)
      await this.channel.prefetch(1);
      
      // Start listening for messages
      await this.channel.consume(this.queueName, async (msg) => {
        if (msg !== null) {
          try {
            const analysisData = JSON.parse(msg.content.toString());
            console.log(`📨 New message received:`, analysisData);
            
            // Traitement de l'analyse
            await this.processAnalysis(analysisData);
            
            // Confirmation du traitement du message
            this.channel.ack(msg);
          } catch (error) {
            console.error('❌ Error processing message:', error);
            // Rejet du message et remise en queue
            this.channel.nack(msg, false, true);
          }
        }
      });
      
      console.log('🚀 Analysis Worker started and listening...');
      
    } catch (error) {
      console.error('❌ Error starting worker:', error);
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
      console.log('🛑 Analysis Worker stopped properly');
    } catch (error) {
      console.error('❌ Error stopping worker:', error);
    }
  }
}

// ========================================
// SECTION 5 : SIGNAL MANAGEMENT AND START
// ========================================

// Create instance of worker
const worker = new AnalysisWorker();

// Handle shutdown signals for proper shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutdown signal received...');
  await worker.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Termination signal received...');
  await worker.stop();
  process.exit(0);
});

// Start worker
worker.start().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
