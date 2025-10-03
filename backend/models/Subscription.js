const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Subscription = sequelize.define('Subscription', {
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
  stripe_subscription_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    set(value) {
      // Normaliser l'ID Stripe
      this.setDataValue('stripe_subscription_id', value ? value.trim() : value);
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'canceled', 'past_due', 'trialing'),
    allowNull: false,
    set(value) {
      // Normaliser le statut
      this.setDataValue('status', value ? value.toLowerCase().trim() : value);
    }
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  current_period_start: {
    type: DataTypes.DATE,
    allowNull: false
  },
  current_period_end: {
    type: DataTypes.DATE,
    allowNull: false
  },
  cancel_at_period_end: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'subscriptions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  getterMethods: {
    // Getter pour vérifier si l'abonnement est actif
    isActive() {
      return this.status === 'active';
    },
    
    // Getter pour vérifier si l'abonnement est en période d'essai
    isTrialing() {
      return this.status === 'trialing';
    },
    
    // Getter pour vérifier si l'abonnement est annulé
    isCanceled() {
      return this.status === 'canceled';
    },
    
    // Getter pour vérifier si l'abonnement est en retard de paiement
    isPastDue() {
      return this.status === 'past_due';
    },
    
    // Getter pour obtenir le nombre de jours restants dans la période
    daysRemaining() {
      if (!this.current_period_end) return 0;
      const now = new Date();
      const end = new Date(this.current_period_end);
      const diffTime = end - now;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },
    
    // Getter pour vérifier si l'abonnement expire bientôt (dans 7 jours)
    isExpiringSoon() {
      return this.daysRemaining <= 7 && this.daysRemaining > 0;
    },
    
    // Getter pour obtenir la durée de l'abonnement en jours
    subscriptionDuration() {
      if (!this.start_date || !this.current_period_end) return 0;
      const start = new Date(this.start_date);
      const end = new Date(this.current_period_end);
      return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    },
    
    // Getter pour obtenir le statut formaté
    statusFormatted() {
      const statusMap = {
        'active': 'Actif',
        'canceled': 'Annulé',
        'past_due': 'En retard',
        'trialing': 'Essai'
      };
      return statusMap[this.status] || this.status;
    }
  },
  setterMethods: {
    // Setter pour mettre à jour le statut avec validation
    setStatus(newStatus) {
      const validStatuses = ['active', 'canceled', 'past_due', 'trialing'];
      if (validStatuses.includes(newStatus)) {
        this.status = newStatus;
      } else {
        throw new Error(`Statut invalide: ${newStatus}. Statuts valides: ${validStatuses.join(', ')}`);
      }
    },
    
    // Setter pour annuler l'abonnement
    cancel() {
      this.status = 'canceled';
      this.cancel_at_period_end = true;
    },
    
    // Setter pour réactiver l'abonnement
    reactivate() {
      this.status = 'active';
      this.cancel_at_period_end = false;
    }
  }
});

module.exports = Subscription;
