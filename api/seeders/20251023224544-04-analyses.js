'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id, email from users WHERE email IN ('test@example.com', 'demo@solotext.com');`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const userMap = users.reduce((acc, user) => {
      acc[user.email] = user.id;
      return acc;
    }, {});

    await queryInterface.bulkInsert('analyses', [
      {
        user_id: userMap['test@example.com'],
        source_text: 'Ceci est un exemple de texte à analyser pour détecter les duplications. Il contient plusieurs phrases qui peuvent être comparées avec d\'autres sources en ligne.',
        duplicate_percent: 15.5,
        analyzed_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: userMap['demo@solotext.com'],
        source_text: 'Un autre exemple de texte pour tester le système d\'analyse de plagiat. Ce texte contient des informations originales et des références à d\'autres travaux.',
        duplicate_percent: 8.2,
        analyzed_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('analyses', null, {});
  }
};
