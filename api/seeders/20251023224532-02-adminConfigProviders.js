'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('admin_config_provider', [
      {
        provider_name: 'perplexity_search',
        api_url: 'https://api.perplexity.ai/search',
        cost_per_request: 0.005,
        is_used: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('admin_config_provider', {
      provider_name: ['perplexity_search']
    });
  }
};
