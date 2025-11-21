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

    const analyses = await queryInterface.sequelize.query(
      `SELECT id, user_id from analyses WHERE user_id IN (${userMap['test@example.com']}, ${userMap['demo@solotext.com']});`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const analysisMap = analyses.reduce((acc, analysis) => {
      // This is a simplification; it assumes one analysis per user for the fixtures.
      // If a user has multiple analyses, this logic would need to be more specific.
      if(analysis.user_id === userMap['test@example.com']) {
        acc['test@example.com'] = analysis.id;
      }
      if(analysis.user_id === userMap['demo@solotext.com']) {
        acc['demo@solotext.com'] = analysis.id;
      }
      return acc;
    }, {});


    await queryInterface.bulkInsert('sentences', [
      {
        analysis_id: analysisMap['test@example.com'],
        sentence_text: 'Ceci est un exemple de phrase qui pourrait être dupliquée.',
        source_url: 'https://example.com/source1',
        is_duplicate: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        analysis_id: analysisMap['test@example.com'],
        sentence_text: 'Cette phrase est complètement originale et unique.',
        source_url: null,
        is_duplicate: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        analysis_id: analysisMap['demo@solotext.com'],
        sentence_text: 'Une phrase de démonstration pour tester le système.',
        source_url: null,
        is_duplicate: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('sentences', null, {});
  }
};
