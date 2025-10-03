const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    },
    set(value) {
      // Normaliser l'email en minuscules
      this.setDataValue('email', value ? value.toLowerCase().trim() : value);
    }
  },
  google_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
    set(value) {
      // Normaliser l'ID Google
      this.setDataValue('google_id', value ? value.trim() : null);
    }
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  getterMethods: {
    // Getter pour obtenir le nom d'affichage
    displayName() {
      return this.email ? this.email.split('@')[0] : 'Utilisateur';
    },
    
    // Getter pour vérifier si l'utilisateur a un compte Google
    hasGoogleAccount() {
      return !!this.google_id;
    },
    
    // Getter pour obtenir les initiales
    initials() {
      if (!this.email) return 'U';
      const name = this.email.split('@')[0];
      return name.substring(0, 2).toUpperCase();
    },
    
    // Getter pour obtenir l'âge du compte en jours
    accountAge() {
      if (!this.created_at) return 0;
      const now = new Date();
      const created = new Date(this.created_at);
      return Math.floor((now - created) / (1000 * 60 * 60 * 24));
    }
  },
  setterMethods: {
    // Setter pour valider et normaliser les données
    setUserData(data) {
      if (data.email) {
        this.email = data.email;
      }
      if (data.google_id) {
        this.google_id = data.google_id;
      }
    }
  }
});

module.exports = User;
