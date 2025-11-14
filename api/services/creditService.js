/**
 * SERVICE DE GESTION DES CRÉDITS
 * 
 * RESPONSABILITÉS :
 * - Calculer la limite mensuelle de crédits selon l'abonnement
 * - Vérifier les crédits utilisés
 * - Vérifier si un utilisateur peut effectuer une analyse
 * - Gérer le reset mensuel des crédits
 * - Mettre à jour les crédits utilisés
 */

const { Op } = require('sequelize');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Analysis = require('../models/Analysis');
const Sentence = require('../models/Sentence');

class CreditService {
  /**
   * LIMITES DE CRÉDITS PAR PLAN
   */
  static PLAN_LIMITS = {
    freemium: 200,
    premium1000: 1000,
    premium3000: 3000,
    premium6000: 6000
  };

  /**
   * Obtenir l'abonnement actif d'un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Subscription|null>} - Abonnement actif ou null
   */
  static async getActiveSubscription(userId) {
    try {
      const subscription = await Subscription.findOne({
        where: {
          user_id: userId,
          status: 'active'
        },
        order: [['created_at', 'DESC']]
      });

      return subscription;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'abonnement pour l'utilisateur ${userId}:`, error);
      return null;
    }
  }

  /**
   * Obtenir la limite mensuelle de crédits d'un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<number>} - Limite mensuelle de crédits
   */
  static async getMonthlyLimit(userId) {
    try {
      const subscription = await this.getActiveSubscription(userId);

      if (subscription && subscription.plan_type) {
        return this.PLAN_LIMITS[subscription.plan_type] || this.PLAN_LIMITS.freemium;
      }

      // Si pas d'abonnement actif, vérifier le rôle de l'utilisateur
      const user = await User.findByPk(userId);
      if (!user) {
        return this.PLAN_LIMITS.freemium;
      }

      // Mapper le rôle vers un plan
      const roleToPlan = {
        'admin': 'premium6000', // Les admins ont un accès illimité (via premium6000)
        'premium6000': 'premium6000',
        'premium3000': 'premium3000',
        'premium1000': 'premium1000',
        'user': 'freemium'
      };

      const plan = roleToPlan[user.role] || 'freemium';
      return this.PLAN_LIMITS[plan];
    } catch (error) {
      console.error(`Erreur lors du calcul de la limite pour l'utilisateur ${userId}:`, error);
      return this.PLAN_LIMITS.freemium; // Par défaut, retourner freemium en cas d'erreur
    }
  }

  /**
   * Vérifier et réinitialiser les crédits si nécessaire (changement de mois)
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<void>}
   */
  static async checkAndResetCredits(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error(`Utilisateur ${userId} introuvable`);
      }

      const today = new Date();
      const todayDate = today.toISOString().split('T')[0];

      // Si pas de date de reset ou si on est dans un nouveau mois
      if (!user.credits_reset_date) {
        // Initialiser la date de reset
        await user.update({
          credits_reset_date: todayDate,
          monthly_credits_used: 0
        });
        return;
      }

      const resetDate = new Date(user.credits_reset_date);
      const resetMonth = resetDate.getMonth();
      const resetYear = resetDate.getFullYear();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      // Si on est dans un nouveau mois, réinitialiser les crédits
      if (currentMonth !== resetMonth || currentYear !== resetYear) {
        await user.update({
          credits_reset_date: todayDate,
          monthly_credits_used: 0
        });
        console.log(`✅ Crédits réinitialisés pour l'utilisateur ${userId}`);
      }
    } catch (error) {
      console.error(`Erreur lors de la vérification/réinitialisation des crédits pour l'utilisateur ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Obtenir les crédits utilisés ce mois (depuis la base de données réelle)
   * Cette méthode calcule depuis les analyses pour avoir une source de vérité
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<number>} - Nombre de crédits utilisés
   */
  static async getCreditsUsedThisMonth(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return 0;
      }

      // Vérifier et réinitialiser si nécessaire
      await this.checkAndResetCredits(userId);

      // Recharger l'utilisateur pour avoir les valeurs à jour
      await user.reload();

      // Calculer depuis les analyses réelles pour vérifier la cohérence
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Compter directement les phrases depuis la table sentences
      // Plus efficace que de charger toutes les analyses avec leurs phrases
      const analyses = await Analysis.findAll({
        where: {
          user_id: userId,
          created_at: {
            [Op.gte]: startOfMonth
          }
        },
        attributes: ['id']
      });

      const analysisIds = analyses.map(a => a.id);
      
      if (analysisIds.length === 0) {
        return 0;
      }

      const totalSentences = await Sentence.count({
        where: {
          analysis_id: {
            [Op.in]: analysisIds
          }
        }
      });

      // totalSentences est déjà calculé ci-dessus

      // Mettre à jour le cache si différent (pour performance)
      if (user.monthly_credits_used !== totalSentences) {
        await user.update({ monthly_credits_used: totalSentences });
        console.log(`📊 Crédits mis à jour pour l'utilisateur ${userId}: ${totalSentences}`);
      }

      return totalSentences;
    } catch (error) {
      console.error(`Erreur lors du calcul des crédits utilisés pour l'utilisateur ${userId}:`, error);
      // En cas d'erreur, retourner la valeur en cache
      const user = await User.findByPk(userId);
      return user ? user.monthly_credits_used : 0;
    }
  }

  /**
   * Obtenir les crédits restants
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<{limit: number, used: number, remaining: number}>}
   */
  static async getCreditsInfo(userId) {
    try {
      const limit = await this.getMonthlyLimit(userId);
      const used = await this.getCreditsUsedThisMonth(userId);
      const remaining = Math.max(0, limit - used);

      return {
        limit,
        used,
        remaining,
        isExhausted: remaining === 0
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération des infos de crédits pour l'utilisateur ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Vérifier si un utilisateur peut effectuer une analyse
   * @param {number} userId - ID de l'utilisateur
   * @param {number} sentenceCount - Nombre de phrases à analyser
   * @returns {Promise<{canAnalyze: boolean, reason?: string, creditsInfo?: object}>}
   */
  static async canAnalyze(userId, sentenceCount) {
    try {
      if (!sentenceCount || sentenceCount <= 0) {
        return {
          canAnalyze: false,
          reason: 'Aucune phrase à analyser'
        };
      }

      const creditsInfo = await this.getCreditsInfo(userId);

      if (creditsInfo.remaining < sentenceCount) {
        return {
          canAnalyze: false,
          reason: `Crédits insuffisants. Vous avez ${creditsInfo.remaining} crédit(s) restant(s) sur ${creditsInfo.limit}, mais ${sentenceCount} crédit(s) sont nécessaires.`,
          creditsInfo
        };
      }

      return {
        canAnalyze: true,
        creditsInfo
      };
    } catch (error) {
      console.error(`Erreur lors de la vérification des crédits pour l'utilisateur ${userId}:`, error);
      return {
        canAnalyze: false,
        reason: 'Erreur lors de la vérification des crédits'
      };
    }
  }

  /**
   * Consommer des crédits après une analyse
   * @param {number} userId - ID de l'utilisateur
   * @param {number} creditsUsed - Nombre de crédits à consommer
   * @returns {Promise<void>}
   */
  static async consumeCredits(userId, creditsUsed) {
    try {
      if (!creditsUsed || creditsUsed <= 0) {
        return;
      }

      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error(`Utilisateur ${userId} introuvable`);
      }

      // Vérifier et réinitialiser si nécessaire
      await this.checkAndResetCredits(userId);
      await user.reload();

      // Incrémenter les crédits utilisés
      const newCreditsUsed = user.monthly_credits_used + creditsUsed;
      await user.update({ monthly_credits_used: newCreditsUsed });

      console.log(`💳 ${creditsUsed} crédit(s) consommé(s) pour l'utilisateur ${userId}. Total: ${newCreditsUsed}`);
    } catch (error) {
      console.error(`Erreur lors de la consommation de crédits pour l'utilisateur ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Réinitialiser les crédits de tous les utilisateurs (à appeler via cron job)
   * @returns {Promise<number>} - Nombre d'utilisateurs mis à jour
   */
  static async resetAllMonthlyCredits() {
    try {
      const today = new Date();
      const todayDate = today.toISOString().split('T')[0];
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const firstDayOfMonthDate = firstDayOfMonth.toISOString().split('T')[0];

      // Trouver tous les utilisateurs dont la date de reset n'est pas le premier jour du mois actuel
      const users = await User.findAll({
        where: {
          [Op.or]: [
            { credits_reset_date: null },
            { credits_reset_date: { [Op.ne]: firstDayOfMonthDate } }
          ]
        }
      });

      let updatedCount = 0;
      for (const user of users) {
        await user.update({
          credits_reset_date: firstDayOfMonthDate,
          monthly_credits_used: 0
        });
        updatedCount++;
      }

      console.log(`✅ ${updatedCount} utilisateur(s) ont eu leurs crédits réinitialisés`);
      return updatedCount;
    } catch (error) {
      console.error('Erreur lors de la réinitialisation mensuelle des crédits:', error);
      throw error;
    }
  }
}

module.exports = CreditService;

