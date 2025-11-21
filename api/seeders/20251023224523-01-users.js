'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = [
      {
        email: 'yohanndurand76@gmail.com',
        password: 'devdev',
        role: 'admin',
        google_id: null
      },
      {
        email: 'test@example.com',
        password: 'test123',
        role: 'user',
        google_id: 'google_test_123'
      },
      {
        email: 'demo@solotext.com',
        password: 'demo123',
        role: 'user',
        google_id: null
      }
    ];

    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
        user.created_at = new Date();
        user.updated_at = new Date();
        return user;
      })
    );

    await queryInterface.bulkInsert('users', hashedUsers, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: ['yohanndurand76@gmail.com', 'test@example.com', 'demo@solotext.com']
    });
  }
};
