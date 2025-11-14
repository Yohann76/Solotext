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
      // Normalize the Stripe ID
      this.setDataValue('stripe_subscription_id', value ? value.trim() : value);
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'canceled', 'past_due', 'trialing'),
    allowNull: false,
    set(value) {
      // Normalize the status
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
  },
  plan_type: {
    type: DataTypes.ENUM('freemium', 'premium1000', 'premium3000', 'premium6000'),
    allowNull: true,
    defaultValue: 'freemium',
    set(value) {
      // Normalize the plan type
      this.setDataValue('plan_type', value ? value.toLowerCase().trim() : 'freemium');
    }
  }
}, {
  tableName: 'subscriptions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  getterMethods: {
    // Getter to check if the subscription is active
    isActive() {
      return this.status === 'active';
    },
    
    // Getter to check if the subscription is in trial period
    isTrialing() {
      return this.status === 'trialing';
    },
    
    // Getter to check if the subscription is canceled
    isCanceled() {
      return this.status === 'canceled';
    },
    
    // Getter to check if the subscription is past due
    isPastDue() {
      return this.status === 'past_due';
    },
    
    // Getter to get the number of days remaining in the period
    daysRemaining() {
      if (!this.current_period_end) return 0;
      const now = new Date();
      const end = new Date(this.current_period_end);
      const diffTime = end - now;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },
    
    // Getter to check if the subscription is expiring soon (in 7 days)
    isExpiringSoon() {
      return this.daysRemaining <= 7 && this.daysRemaining > 0;
    },
    
    // Getter to get the duration of the subscription in days
    subscriptionDuration() {
      if (!this.start_date || !this.current_period_end) return 0;
      const start = new Date(this.start_date);
      const end = new Date(this.current_period_end);
      return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    },
    
    // Getter to get the formatted status
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
    // Setter to update the status with validation
    setStatus(newStatus) {
      const validStatuses = ['active', 'canceled', 'past_due', 'trialing'];
      if (validStatuses.includes(newStatus)) {
        this.status = newStatus;
      } else {
        throw new Error(`Statut invalide: ${newStatus}. Statuts valides: ${validStatuses.join(', ')}`);
      }
    },
    
    // Setter to cancel the subscription
    cancel() {
      this.status = 'canceled';
      this.cancel_at_period_end = true;
    },
    
    // Setter to reactivate the subscription
    reactivate() {
      this.status = 'active';
      this.cancel_at_period_end = false;
    }
  }
});

module.exports = Subscription;
