'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Ajouter plan_type à la table subscriptions
    await queryInterface.addColumn('subscriptions', 'plan_type', {
      type: Sequelize.ENUM('freemium', 'premium1000', 'premium3000', 'premium6000'),
      allowNull: true,
      defaultValue: 'freemium'
    });

    // 2. Ajouter monthly_credits_used et credits_reset_date à la table users
    await queryInterface.addColumn('users', 'monthly_credits_used', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('users', 'credits_reset_date', {
      type: Sequelize.DATEONLY,
      allowNull: true
    });

    // 3. Mettre à jour le role ENUM pour inclure les nouveaux rôles premium
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'premium1000';
      ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'premium3000';
      ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'premium6000';
    `).catch(() => {
      // Si l'ENUM n'existe pas encore ou si les valeurs existent déjà, on continue
      console.log('Note: ENUM role update skipped (may already exist)');
    });

    // 4. Initialiser credits_reset_date pour les utilisateurs existants
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET credits_reset_date = CURRENT_DATE 
      WHERE credits_reset_date IS NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Supprimer les colonnes ajoutées
    await queryInterface.removeColumn('subscriptions', 'plan_type');
    await queryInterface.removeColumn('users', 'monthly_credits_used');
    await queryInterface.removeColumn('users', 'credits_reset_date');
  }
};

