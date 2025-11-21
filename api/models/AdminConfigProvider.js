const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AdminConfigProvider = sequelize.define('AdminConfigProvider', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  provider_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  api_url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  cost_per_request: {
    type: DataTypes.DECIMAL(10, 5),
    allowNull: false
  },
  is_used: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'admin_config_provider',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = AdminConfigProvider;
