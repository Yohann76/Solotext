const amqp = require('amqplib');

class QueueService {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.queueName = process.env.ANALYSIS_QUEUE || 'analysis_queue';
    this.rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin123@rabbitmq:5672';
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) {
      return;
    }

    try {
      console.log('🔄 Connexion du service de queue à RabbitMQ...');
      this.connection = await amqp.connect(this.rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      
      // Declare the queue
      await this.channel.assertQueue(this.queueName, {
        durable: true // Persistent even if RabbitMQ restarts
      });
      
      this.isConnected = true;
      console.log('✅ Service de queue connecté à RabbitMQ');
    } catch (error) {
      console.error('❌ Erreur de connexion du service de queue à RabbitMQ:', error);
      throw error;
    }
  }

  async sendAnalysisTask(analysisId, sourceText) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const message = {
        analysisId,
        sourceText,
        timestamp: new Date().toISOString()
      };

      const messageBuffer = Buffer.from(JSON.stringify(message));
      
      const sent = this.channel.sendToQueue(
        this.queueName,
        messageBuffer,
        {
          persistent: true // Persistent message
        }
      );

      if (sent) {
        console.log(`📤 Tâche d'analyse #${analysisId} envoyée à la queue`);
        return true;
      } else {
        console.error(`❌ Échec de l'envoi de la tâche d'analyse #${analysisId}`);
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de la tâche:', error);
      return false;
    }
  }

  async disconnect() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.isConnected = false;
      console.log('🛑 Service de queue déconnecté');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion du service de queue:', error);
    }
  }
}

// Export an instance singleton
module.exports = new QueueService();
