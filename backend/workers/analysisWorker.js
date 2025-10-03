const amqp = require('amqplib');
const { sequelize } = require('../config/database');
const Analysis = require('../models/Analysis');
const Sentence = require('../models/Sentence');

class AnalysisWorker {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.queueName = process.env.ANALYSIS_QUEUE || 'analysis_queue';
    // TODO: declare this env in docker-compose.yml and in .env file
    this.rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672';
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
      
      await Promise.all(sentencePromises);
      console.log(`✅ ${sentences.length} phrases sauvegardées`);
      
      // Update the status of the analysis
      await Analysis.update(
        { 
          status: 'completed', // status is not in database
          duplicate_percent: 0 // For now, set to 0
        },
        { where: { id: analysisId } }
      );
      
      console.log(`🎉 Analyse #${analysisId} traitée avec succès`);
      
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
