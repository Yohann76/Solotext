'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id, email from users WHERE email IN ('yohanndurand76@gmail.com', 'test@example.com');`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const userMap = users.reduce((acc, user) => {
      acc[user.email] = user.id;
      return acc;
    }, {});

    await queryInterface.bulkInsert('subscriptions', [
      {
        user_id: userMap['yohanndurand76@gmail.com'],
        stripe_subscription_id: 'sub_admin_001',
        status: 'active',
        start_date: new Date('2024-01-01'),
        current_period_start: new Date('2024-01-01'),
        current_period_end: new Date('2025-01-01'),
        cancel_at_period_end: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: userMap['test@example.com'],
        stripe_subscription_id: 'sub_test_001',
        status: 'trialing',
        start_date: new Date('2024-12-01'),
        current_period_start: new Date('2024-12-01'),
        current_period_end: new Date('2025-01-01'),
        cancel_at_period_end: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('subscriptions', {
      stripe_subscription_id: ['sub_admin_001', 'sub_test_001']
    });
  }
};
