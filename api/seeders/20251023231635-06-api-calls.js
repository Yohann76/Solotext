'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id, email from users WHERE email IN ('test@example.com');`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const userMap = users.reduce((acc, user) => {
      acc[user.email] = user.id;
      return acc;
    }, {});

    const providers = await queryInterface.sequelize.query(
      `SELECT id, provider_name from admin_config_provider WHERE provider_name IN ('perplexity_search');`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const providerMap = providers.reduce((acc, provider) => {
      acc[provider.provider_name] = provider.id;
      return acc;
    }, {});
    
    await queryInterface.bulkInsert('api_calls', [
      {
        user_id: userMap['test@example.com'],
        admin_config_provider_id: providerMap['perplexity_search'],
        call_count: 15,
        call_date: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('api_calls', null, {});
  }
};
