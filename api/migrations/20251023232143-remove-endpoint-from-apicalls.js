'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('api_calls', 'api_endpoint');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('api_calls', 'api_endpoint', {
      type: Sequelize.STRING(100),
      allowNull: true
    });
  }
};
