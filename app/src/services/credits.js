/**
 * SERVICE DE GESTION DES CRÉDITS (FRONTEND)
 */

import { http, endpoints } from '../api/index.js'

class CreditsService {
  /**
   * Obtenir les informations de crédits de l'utilisateur
   * @returns {Promise<{success: boolean, data: {limit: number, used: number, remaining: number, isExhausted: boolean}}>}
   */
  async getCredits() {
    try {
      const data = await http.get(endpoints.credits.root)
      return data
    } catch (error) {
      console.error('Erreur CreditsService.getCredits:', error)
      throw error
    }
  }

  /**
   * Obtenir l'abonnement et les crédits de l'utilisateur
   * @returns {Promise<{success: boolean, data: {subscription: object|null, credits: object}}>}
   */
  async getSubscription() {
    try {
      const data = await http.get(endpoints.stripe.subscription)
      return data
    } catch (error) {
      console.error('Erreur CreditsService.getSubscription:', error)
      throw error
    }
  }
}

export default new CreditsService()

