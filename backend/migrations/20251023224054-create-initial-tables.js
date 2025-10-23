'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      google_id: {
        type: Sequelize.STRING(255),
        unique: true
      },
      password: {
        type: Sequelize.STRING(255)
      },
      role: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'user'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.createTable('subscriptions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      stripe_subscription_id: {
        type: Sequelize.STRING(255),
        unique: true,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      current_period_start: {
        type: Sequelize.DATE,
        allowNull: false
      },
      current_period_end: {
        type: Sequelize.DATE,
        allowNull: false
      },
      cancel_at_period_end: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.createTable('analyses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      analyzed_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      source_text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      duplicate_percent: {
        type: Sequelize.DECIMAL(5, 2)
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'waiting_for_process'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.createTable('sentences', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      analysis_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'analyses',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      sentence_text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      source_url: {
        type: Sequelize.TEXT
      },
      is_duplicate: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_test: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.createTable('api_calls', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      api_provider: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      api_endpoint: {
        type: Sequelize.STRING(100)
      },
      call_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      call_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_DATE')
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    
    await queryInterface.addConstraint('api_calls', {
      fields: ['user_id', 'api_provider', 'call_date'],
      type: 'unique',
      name: 'api_calls_user_id_api_provider_call_date_key'
    });

    await queryInterface.createTable('admin_config_provider', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      provider_name: {
        type: Sequelize.STRING(255),
        unique: true,
        allowNull: false
      },
      api_url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      cost_per_request: {
        type: Sequelize.DECIMAL(10, 5),
        allowNull: false
      },
      is_used: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Indexes
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['google_id']);
    await queryInterface.addIndex('subscriptions', ['user_id']);
    await queryInterface.addIndex('subscriptions', ['status']);
    await queryInterface.addIndex('subscriptions', ['stripe_subscription_id']);
    await queryInterface.addIndex('analyses', ['user_id']);
    await queryInterface.addIndex('analyses', ['analyzed_at']);
    await queryInterface.addIndex('analyses', ['status']);
    await queryInterface.addIndex('sentences', ['analysis_id']);
    await queryInterface.addIndex('sentences', ['is_duplicate']);
    await queryInterface.addIndex('api_calls', ['user_id']);
    await queryInterface.addIndex('api_calls', ['api_provider']);
    await queryInterface.addIndex('api_calls', ['call_date']);
    await queryInterface.addIndex('api_calls', ['user_id', 'api_provider', 'call_date']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('admin_config_provider');
    await queryInterface.dropTable('api_calls');
    await queryInterface.dropTable('sentences');
    await queryInterface.dropTable('analyses');
    await queryInterface.dropTable('subscriptions');
    await queryInterface.dropTable('users');
  }
};
