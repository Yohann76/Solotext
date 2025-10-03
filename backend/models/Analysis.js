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
      // Nettoyer et normaliser le texte
      if (value) {
        const cleaned = value.trim().replace(/\s+/g, ' ');
        this.setDataValue('source_text', cleaned);
      }
    }
  },
  duplicate_percent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    },
    set(value) {
      // Arrondir à 2 décimales
      const rounded = Math.round(parseFloat(value) * 100) / 100;
      this.setDataValue('duplicate_percent', rounded);
    }
  }
}, {
  tableName: 'analyses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  getterMethods: {
    // Getter pour vérifier si l'analyse est récente (moins de 24h)
    isRecent() {
      if (!this.analyzed_at) return false;
      const now = new Date();
      const analyzed = new Date(this.analyzed_at);
      const diffHours = (now - analyzed) / (1000 * 60 * 60);
      return diffHours < 24;
    },
    
    // Getter pour obtenir le niveau de risque de plagiat
    plagiarismRisk() {
      if (this.duplicate_percent >= 80) return 'Très élevé';
      if (this.duplicate_percent >= 60) return 'Élevé';
      if (this.duplicate_percent >= 40) return 'Modéré';
      if (this.duplicate_percent >= 20) return 'Faible';
      return 'Très faible';
    },
    
    // Getter pour vérifier si l'analyse est acceptable
    isAcceptable() {
      return this.duplicate_percent < 20;
    },
    
    // Getter pour obtenir le nombre de mots du texte
    wordCount() {
      if (!this.source_text) return 0;
      return this.source_text.split(/\s+/).filter(word => word.length > 0).length;
    },
    
    // Getter pour obtenir le nombre de caractères
    characterCount() {
      return this.source_text ? this.source_text.length : 0;
    },
    
    // Getter pour obtenir un résumé du texte (premiers 100 caractères)
    summary() {
      if (!this.source_text) return '';
      return this.source_text.length > 100 
        ? this.source_text.substring(0, 100) + '...'
        : this.source_text;
    },
    
    // Getter pour obtenir l'âge de l'analyse en heures
    ageInHours() {
      if (!this.analyzed_at) return 0;
      const now = new Date();
      const analyzed = new Date(this.analyzed_at);
      return Math.floor((now - analyzed) / (1000 * 60 * 60));
    },
    
    // Getter pour obtenir le pourcentage formaté
    duplicatePercentFormatted() {
      return `${this.duplicate_percent}%`;
    }
  },
  setterMethods: {
    // Setter pour analyser un nouveau texte
    analyzeText(text) {
      this.source_text = text;
      this.analyzed_at = new Date();
      // Ici on pourrait ajouter la logique d'analyse de duplication
      // Pour l'instant, on met un pourcentage aléatoire
      this.duplicate_percent = Math.random() * 100;
    },
    
    // Setter pour mettre à jour le pourcentage de duplication
    setDuplicatePercent(percent) {
      if (percent < 0 || percent > 100) {
        throw new Error('Le pourcentage de duplication doit être entre 0 et 100');
      }
      this.duplicate_percent = percent;
    }
  }
});

module.exports = Analysis;
