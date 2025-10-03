const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Sentence = sequelize.define('Sentence', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  analysis_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'analyses',
      key: 'id'
    }
  },
  sentence_text: {
    type: DataTypes.TEXT,
    allowNull: false,
    set(value) {
      // Nettoyer et normaliser la phrase
      if (value) {
        const cleaned = value.trim().replace(/\s+/g, ' ');
        this.setDataValue('sentence_text', cleaned);
      }
    }
  },
  source_url: {
    type: DataTypes.TEXT,
    allowNull: true,
    set(value) {
      // Valider et normaliser l'URL
      if (value) {
        const trimmed = value.trim();
        if (trimmed && !trimmed.startsWith('http')) {
          this.setDataValue('source_url', `https://${trimmed}`);
        } else {
          this.setDataValue('source_url', trimmed);
        }
      }
    }
  },
  is_duplicate: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'sentences',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  getterMethods: {
    // Getter pour obtenir la longueur de la phrase
    length() {
      return this.sentence_text ? this.sentence_text.length : 0;
    },
    
    // Getter pour obtenir le nombre de mots dans la phrase
    wordCount() {
      if (!this.sentence_text) return 0;
      return this.sentence_text.split(/\s+/).filter(word => word.length > 0).length;
    },
    
    // Getter pour vérifier si la phrase est longue (plus de 50 caractères)
    isLong() {
      return this.length > 50;
    },
    
    // Getter pour vérifier si la phrase est courte (moins de 20 caractères)
    isShort() {
      return this.length < 20;
    },
    
    // Getter pour obtenir le statut de duplication formaté
    duplicateStatus() {
      return this.is_duplicate ? 'Dupliquée' : 'Originale';
    },
    
    // Getter pour obtenir un résumé de la phrase (premiers 50 caractères)
    preview() {
      if (!this.sentence_text) return '';
      return this.sentence_text.length > 50 
        ? this.sentence_text.substring(0, 50) + '...'
        : this.sentence_text;
    },
    
    // Getter pour vérifier si la phrase a une source
    hasSource() {
      return !!this.source_url;
    },
    
    // Getter pour obtenir le domaine de la source
    sourceDomain() {
      if (!this.source_url) return null;
      try {
        const url = new URL(this.source_url);
        return url.hostname;
      } catch {
        return null;
      }
    },
    
    // Getter pour obtenir la couleur de statut (pour l'interface)
    statusColor() {
      return this.is_duplicate ? 'red' : 'green';
    },
    
    // Getter pour obtenir l'icône de statut
    statusIcon() {
      return this.is_duplicate ? '⚠️' : '✅';
    }
  },
  setterMethods: {
    // Setter pour marquer une phrase comme dupliquée avec source
    markAsDuplicate(sourceUrl = null) {
      this.is_duplicate = true;
      if (sourceUrl) {
        this.source_url = sourceUrl;
      }
    },
    
    // Setter pour marquer une phrase comme originale
    markAsOriginal() {
      this.is_duplicate = false;
      this.source_url = null;
    },
    
    // Setter pour analyser et marquer automatiquement une phrase
    analyzeSentence(text, sourceUrl = null) {
      this.sentence_text = text;
      
      // Logique simple d'analyse (à remplacer par un vrai algorithme)
      const suspiciousWords = ['copié', 'plagiat', 'identique', 'similaire'];
      const hasSuspiciousWords = suspiciousWords.some(word => 
        text.toLowerCase().includes(word)
      );
      
      if (hasSuspiciousWords || sourceUrl) {
        this.markAsDuplicate(sourceUrl);
      } else {
        this.markAsOriginal();
      }
    },
    
    // Setter pour mettre à jour la source
    setSource(url) {
      this.source_url = url;
      if (url) {
        this.is_duplicate = true;
      }
    }
  }
});

module.exports = Sentence;
