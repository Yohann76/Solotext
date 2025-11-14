/**
 * SERVICE STRIPE (FRONTEND)
 * Gestion des abonnements et paiements Stripe
 */

import { http, endpoints } from '../api/index.js'

class StripeService {
  /**
   * Obtenir l'abonnement actuel de l'utilisateur
   * @returns {Promise<{success: boolean, data: {subscription: object|null, credits: object}}>}
   */
  async getSubscription() {
    try {
      const data = await http.get(endpoints.stripe.subscription)
      return data
    } catch (error) {
      console.error('Erreur StripeService.getSubscription:', error)
      throw error
    }
  }

  /**
   * Créer une session de checkout Stripe
   * @param {string} planType - Type de plan (premium1000, premium3000, premium6000)
   * @returns {Promise<{success: boolean, data: {checkoutUrl: string}}>}
   */
  async createCheckoutSession(planType) {
    try {
      const data = await http.post(endpoints.stripe.createCheckoutSession, {
        plan_type: planType
      })
      return data
    } catch (error) {
      console.error('Erreur StripeService.createCheckoutSession:', error)
      throw error
    }
  }
}

export default new StripeService()

