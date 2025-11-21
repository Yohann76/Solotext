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
      // Clean and normalize the sentence
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
      // Validate and normalize the URL
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
  },
  is_test: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indique si la phrase a été testée par le worker et qu\'une réponse a été reçue'
  }
}, {
  tableName: 'sentences',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  getterMethods: {
    // Getter to get the length of the sentence
    length() {
      return this.sentence_text ? this.sentence_text.length : 0;
    },
    
    // Getter to get the number of words in the sentence
    wordCount() {
      if (!this.sentence_text) return 0;
      return this.sentence_text.split(/\s+/).filter(word => word.length > 0).length;
    },
    
    // Getter to check if the sentence is long (more than 50 characters)
    isLong() {
      return this.length > 50;
    },
    
    // Getter to check if the sentence is short (less than 20 characters)
    isShort() {
      return this.length < 20;
    },
    
    // Getter to get the duplication status formatted
    duplicateStatus() {
      return this.is_duplicate ? 'Dupliquée' : 'Originale';
    },
    
    // Getter to get the preview of the sentence (first 50 characters)
    preview() {
      if (!this.sentence_text) return '';
      return this.sentence_text.length > 50 
        ? this.sentence_text.substring(0, 50) + '...'
        : this.sentence_text;
    },
    
    // Getter to check if the sentence has a source
    hasSource() {
      return !!this.source_url;
    },
    
    // Getter to get the domain of the source
    sourceDomain() {
      if (!this.source_url) return null;
      try {
        const url = new URL(this.source_url);
        return url.hostname;
      } catch {
        return null;
      }
    },
    
    // Getter to get the status color (for the interface)
    statusColor() {
      return this.is_duplicate ? 'red' : 'green';
    },
    
    // Getter to get the status icon
    statusIcon() {
      return this.is_duplicate ? '⚠️' : '✅';
    },
    
    // Getter to check if the sentence has been tested
    hasBeenTested() {
      return this.is_test === true;
    },
    
    // Getter to get the test status formatted
    testStatus() {
      return this.is_test ? 'Testée' : 'Non testée';
    },
    
    // Getter to get the test status icon
    testStatusIcon() {
      return this.is_test ? '🧪' : '⏳';
    },
    
    // Getter to get the overall status (test + duplicate)
    overallStatus() {
      if (!this.is_test) return 'En attente de test';
      return this.is_duplicate ? 'Dupliquée (testée)' : 'Originale (testée)';
    }
  },
  setterMethods: {
    // Setter to mark a sentence as duplicate with source
    markAsDuplicate(sourceUrl = null) {
      this.is_duplicate = true;
      if (sourceUrl) {
        this.source_url = sourceUrl;
      }
    },
    
    // Setter to mark a sentence as original
    markAsOriginal() {
      this.is_duplicate = false;
      this.source_url = null;
    },
    
    // Setter to analyze and automatically mark a sentence
    analyzeSentence(text, sourceUrl = null) {
      this.sentence_text = text;
      
      // Simple analysis logic (to be replaced by a real algorithm)
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
    
    // Setter to update the source
    setSource(url) {
      this.source_url = url;
      if (url) {
        this.is_duplicate = true;
      }
    },
    
    // Setter to mark a sentence as tested
    markAsTested() {
      this.is_test = true;
    },
    
    // Setter to mark a sentence as not tested
    markAsNotTested() {
      this.is_test = false;
    },
    
    // Setter to complete the testing process (test + result)
    completeTest(isDuplicate = false, sourceUrl = null) {
      this.is_test = true;
      this.is_duplicate = isDuplicate;
      if (sourceUrl) {
        this.source_url = sourceUrl;
      }
    },
    
    // Setter to reset the sentence for retesting
    resetForRetest() {
      this.is_test = false;
      this.is_duplicate = false;
      this.source_url = null;
    }
  }
});

module.exports = Sentence;
