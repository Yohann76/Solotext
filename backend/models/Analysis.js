const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Analysis = sequelize.define('Analysis', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  analyzed_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  source_text: {
    type: DataTypes.TEXT,
    allowNull: false,
    set(value) {
      // Clean and normalize the text
      if (value) {
        const cleaned = value.trim().replace(/\s+/g, ' ');
        this.setDataValue('source_text', cleaned);
      }
    }
  },
  duplicate_percent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true, // allow null by default // update with worker later
    defaultValue: null,
    validate: {
      min: 0,
      max: 100
    },
    set(value) {
      // Round to 2 decimal if the value exists
      if (value !== null && value !== undefined) {
        const rounded = Math.round(parseFloat(value) * 100) / 100;
        this.setDataValue('duplicate_percent', rounded);
      } else {
        this.setDataValue('duplicate_percent', null);
      }
    }
  }
}, {
  tableName: 'analyses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  getterMethods: {
    // Getter to check if the analysis is recent (less than 24h)
    isRecent() {
      if (!this.analyzed_at) return false;
      const now = new Date();
      const analyzed = new Date(this.analyzed_at);
      const diffHours = (now - analyzed) / (1000 * 60 * 60);
      return diffHours < 24;
    },
    
    // Getter to get the risk level of plagiarism
    plagiarismRisk() {
      if (this.duplicate_percent >= 80) return 'Très élevé';
      if (this.duplicate_percent >= 60) return 'Élevé';
      if (this.duplicate_percent >= 40) return 'Modéré';
      if (this.duplicate_percent >= 20) return 'Faible';
      return 'Très faible';
    },
    
    // Getter to check if the analysis is acceptable
    isAcceptable() {
      return this.duplicate_percent < 20;
    },
    
    // Getter to get the number of words in the text
    wordCount() {
      if (!this.source_text) return 0;
      return this.source_text.split(/\s+/).filter(word => word.length > 0).length;
    },
    
    // Getter to get the number of characters
    characterCount() {
      return this.source_text ? this.source_text.length : 0;
    },
    
    // Getter to get the summary of the text (first 100 characters)
    summary() {
      if (!this.source_text) return '';
      return this.source_text.length > 100 
        ? this.source_text.substring(0, 100) + '...'
        : this.source_text;
    },
    
    // Getter to get the age of the analysis in hours
    ageInHours() {
      if (!this.analyzed_at) return 0;
      const now = new Date();
      const analyzed = new Date(this.analyzed_at);
      return Math.floor((now - analyzed) / (1000 * 60 * 60));
    },
    
    // Getter to get the formatted percentage
    duplicatePercentFormatted() {
      return `${this.duplicate_percent}%`;
    }
  },
  setterMethods: {
    // Setter to analyze a new text
    analyzeText(text) {
      this.source_text = text;
      this.analyzed_at = new Date();
      // Here we could add the logic to analyze the duplication
      // For now, we put a random percentage
      this.duplicate_percent = Math.random() * 100; // TODO: remove this
    },
    
    // Setter to update the duplication percentage
    setDuplicatePercent(percent) {
      if (percent < 0 || percent > 100) {
        throw new Error('The duplication percentage must be between 0 and 100');
      } 
      this.duplicate_percent = percent;
    }
  }
});

module.exports = Analysis;
