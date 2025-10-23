const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const AdminConfigProvider = require('./AdminConfigProvider');

const ApiCall = sequelize.define('ApiCall', {
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
  admin_config_provider_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'admin_config_provider',
      key: 'id'
    }
  },
  call_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  call_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'api_calls',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  getterMethods: {
    // Getter to get the formatted API provider
    providerFormatted() {
      const providerMap = {
        'perplexity': 'Perplexity AI',
        'openai': 'OpenAI',
        'anthropic': 'Anthropic',
        'google': 'Google AI'
      };
      return providerMap[this.api_provider] || this.api_provider;
    },
    
    // Getter to get the formatted call date
    callDateFormatted() {
      return new Date(this.call_date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    
    // Getter to check if it's a Perplexity call
    isPerplexityCall() {
      return this.api_provider === 'perplexity';
    },
    
    // Getter to get the cost estimate (if applicable)
    estimatedCost() {
      // This could be expanded based on actual API pricing
      const costPerCall = {
        'perplexity': 0.01, // Example: $0.01 per call
        'openai': 0.02,
        'anthropic': 0.03,
        'google': 0.015
      };
      return (costPerCall[this.api_provider] || 0) * this.call_count;
    }
  },
  setterMethods: {
    // Setter to increment call count
    incrementCallCount() {
      this.call_count += 1;
    },
    
    // Setter to add multiple calls
    addCalls(count) {
      this.call_count += count;
    },
    
    // Setter to set API provider with validation
    setApiProvider(provider) {
      const validProviders = ['perplexity', 'openai', 'anthropic', 'google'];
      if (validProviders.includes(provider.toLowerCase())) {
        this.api_provider = provider.toLowerCase();
      } else {
        throw new Error(`Provider invalide: ${provider}. Providers valides: ${validProviders.join(', ')}`);
      }
    }
  }
});

ApiCall.belongsTo(AdminConfigProvider, {
  foreignKey: 'admin_config_provider_id',
  as: 'provider'
});
AdminConfigProvider.hasMany(ApiCall, {
  foreignKey: 'admin_config_provider_id'
});

module.exports = ApiCall;
