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
      // Normalize the email in lowercase
      this.setDataValue('email', value ? value.toLowerCase().trim() : value);
    }
  },
  google_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
    set(value) {
      // Normalize the Google ID
      this.setDataValue('google_id', value ? value.trim() : null);
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true,
    set(value) {
      // The password will be hashed before saving
      this.setDataValue('password', value);
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    allowNull: false,
    defaultValue: 'user',
    set(value) {
      // Normalize the role
      this.setDataValue('role', value ? value.toLowerCase().trim() : 'user');
    }
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  getterMethods: {
    // Getter to get the display name
    displayName() {
      return this.email ? this.email.split('@')[0] : 'Utilisateur';
    },
    
    // Getter to check if the user has a Google account
    hasGoogleAccount() {
      return !!this.google_id;
    },
    
    // Getter to get the initials
    initials() {
      if (!this.email) return 'U';
      const name = this.email.split('@')[0];
      return name.substring(0, 2).toUpperCase();
    },
    
    // Getter to get the age of the account in days
    accountAge() {
      if (!this.created_at) return 0;
      const now = new Date();
      const created = new Date(this.created_at);
      return Math.floor((now - created) / (1000 * 60 * 60 * 24));
    },
    
    // Getter to check if the user is admin
    isAdmin() {
      return this.role === 'admin';
    },
    
    // Getter to check if the user is a normal user
    isUser() {
      return this.role === 'user';
    },
    
    // Getter to get the formatted role
    roleFormatted() {
      return this.role === 'admin' ? 'Administrateur' : 'Utilisateur';
    },
    
    // Getter to check if the user has a password
    hasPassword() {
      return !!this.password;
    }
  },
  setterMethods: {
    // Setter to validate and normalize the data
    setUserData(data) {
      if (data.email) {
        this.email = data.email;
      }
      if (data.google_id) {
        this.google_id = data.google_id;
      }
      if (data.role) {
        this.role = data.role;
      }
    },
    
    // Setter to set the admin role
    setAsAdmin() {
      this.role = 'admin';
    },
    
    // Setter to set the user role
    setAsUser() {
      this.role = 'user';
    },
    
    // Setter to set a password (will be hashed)
    setPassword(plainPassword) {
      if (plainPassword) {
        // The hashing will be done in the script with bcrypt
        this.password = plainPassword;
      }
    }
  }
});

const Analysis = require('../models/Analysis');
const Sentence = require('../models/Sentence');

Analysis.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Analysis, { foreignKey: 'user_id' });

Analysis.hasMany(Sentence, { foreignKey: 'analysis_id' });
Sentence.belongsTo(Analysis, { foreignKey: 'analysis_id' });

module.exports = User;
