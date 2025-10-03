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
    allowNull: false
  },
  source_url: {
    type: DataTypes.TEXT,
    allowNull: true
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
  updatedAt: 'updated_at'
});

module.exports = Sentence;
