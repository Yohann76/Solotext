'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('api_calls', 'admin_config_provider_id', {
      type: Sequelize.INTEGER,
      allowNull: true, 
      references: {
        model: 'admin_config_provider',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    const providers = await queryInterface.sequelize.query(
      `SELECT id, provider_name from admin_config_provider;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const providerMap = providers.reduce((acc, provider) => {
      acc[provider.provider_name] = provider.id;
      return acc;
    }, {});
    
    if (providerMap['perplexity_search']) {
      await queryInterface.bulkUpdate('api_calls', 
        { admin_config_provider_id: providerMap['perplexity_search'] },
        { api_provider: 'perplexity_search' }
      );
    }
    
    await queryInterface.removeColumn('api_calls', 'api_provider');

    await queryInterface.changeColumn('api_calls', 'admin_config_provider_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('api_calls', 'api_provider', {
      type: Sequelize.STRING(50),
      allowNull: true
    });

    const providers = await queryInterface.sequelize.query(
      `SELECT id, provider_name from admin_config_provider;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    for (const provider of providers) {
      await queryInterface.bulkUpdate('api_calls',
        { api_provider: provider.provider_name },
        { admin_config_provider_id: provider.id }
      );
    }

    await queryInterface.removeColumn('api_calls', 'admin_config_provider_id');

    await queryInterface.changeColumn('api_calls', 'api_provider', {
      type: Sequelize.STRING(50),
      allowNull: false
    });
  }
};
