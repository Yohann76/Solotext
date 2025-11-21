/**
 * ROUTES STRIPE POUR LA GESTION DES ABONNEMENTS
 * 
 * Endpoints :
 * - POST /api/stripe/create-checkout-session - Créer une session de checkout Stripe
 * - POST /api/stripe/webhook - Webhook Stripe pour les événements
 * - GET /api/stripe/subscription - Obtenir l'abonnement actuel de l'utilisateur
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const CreditService = require('../services/creditService');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

// Initialiser Stripe (sera null si les clés ne sont pas configurées)
let stripe = null;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    console.log('✅ Stripe initialisé avec succès');
  } else {
    console.warn('⚠️ STRIPE_SECRET_KEY non configuré. Les fonctionnalités Stripe seront désactivées.');
  }
} catch (error) {
  console.error('❌ Erreur lors de l\'initialisation de Stripe:', error);
}

/**
 * Mapping des plans vers les Price IDs Stripe
 * À configurer dans votre dashboard Stripe
 */
const PLAN_TO_PRICE_ID = {
  premium1000: process.env.STRIPE_PRICE_ID_PREMIUM1000 || 'price_premium1000',
  premium3000: process.env.STRIPE_PRICE_ID_PREMIUM3000 || 'price_premium3000',
  premium6000: process.env.STRIPE_PRICE_ID_PREMIUM6000 || 'price_premium6000'
};

/**
 * Mapping des plans vers les rôles utilisateur
 */
const PLAN_TO_ROLE = {
  premium1000: 'premium1000',
  premium3000: 'premium3000',
  premium6000: 'premium6000'
};

/**
 * GET /api/stripe/subscription
 * Obtenir l'abonnement actuel de l'utilisateur
 */
router.get('/subscription', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await CreditService.getActiveSubscription(userId);
    const creditsInfo = await CreditService.getCreditsInfo(userId);

    res.json({
      success: true,
      data: {
        subscription: subscription ? {
          id: subscription.id,
          plan_type: subscription.plan_type,
          status: subscription.status,
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
          stripe_subscription_id: subscription.stripe_subscription_id
        } : null,
        credits: creditsInfo
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'abonnement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /api/stripe/create-checkout-session
 * Créer une session de checkout Stripe
 * 
 * Body: { plan_type: 'premium1000' | 'premium3000' | 'premium6000' }
 */
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Stripe n\'est pas configuré. Veuillez contacter l\'administrateur.',
        code: 'STRIPE_NOT_CONFIGURED'
      });
    }

    const { plan_type } = req.body;
    const userId = req.user.id;

    // Validation du plan
    const validPlans = ['premium1000', 'premium3000', 'premium6000'];
    if (!plan_type || !validPlans.includes(plan_type)) {
      return res.status(400).json({
        success: false,
        message: 'Plan invalide. Plans valides: premium1000, premium3000, premium6000',
        code: 'INVALID_PLAN'
      });
    }

    // Obtenir le Price ID Stripe pour ce plan
    const priceId = PLAN_TO_PRICE_ID[plan_type];
    if (!priceId) {
      return res.status(500).json({
        success: false,
        message: `Price ID non configuré pour le plan ${plan_type}`,
        code: 'PRICE_ID_NOT_CONFIGURED'
      });
    }

    // Récupérer l'utilisateur pour obtenir son email
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      });
    }

    // Créer la session de checkout Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/application?checkout=success`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/tarifs?checkout=cancelled`,
      customer_email: user.email,
      client_reference_id: userId.toString(),
      metadata: {
        user_id: userId.toString(),
        plan_type: plan_type
      },
      subscription_data: {
        metadata: {
          user_id: userId.toString(),
          plan_type: plan_type
        }
      }
    });

    res.json({
      success: true,
      data: {
        checkoutUrl: session.url,
        sessionId: session.id
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de la session Stripe:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la création de la session de paiement',
      code: 'STRIPE_ERROR'
    });
  }
});

/**
 * POST /api/stripe/webhook
 * Webhook Stripe pour recevoir les événements
 * 
 * Note: Cette route ne doit PAS utiliser authenticateToken car Stripe envoie directement
 * Il faut configurer le webhook dans le dashboard Stripe avec cette URL
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      success: false,
      message: 'Stripe n\'est pas configuré'
    });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('⚠️ STRIPE_WEBHOOK_SECRET non configuré');
    return res.status(500).json({
      success: false,
      message: 'Webhook secret non configuré'
    });
  }

  let event;

  try {
    // Vérifier la signature du webhook
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('❌ Erreur de signature du webhook Stripe:', err.message);
    return res.status(400).json({
      success: false,
      message: `Webhook Error: ${err.message}`
    });
  }

  try {
    // Gérer les différents types d'événements
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Erreur lors du traitement du webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du traitement du webhook'
    });
  }
});

/**
 * Gérer l'événement checkout.session.completed
 */
async function handleCheckoutCompleted(session) {
  try {
    const userId = parseInt(session.client_reference_id);
    const planType = session.metadata?.plan_type;

    if (!userId || !planType) {
      console.error('Données manquantes dans la session:', session);
      return;
    }

    // Récupérer la subscription depuis Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);

    // Créer ou mettre à jour l'abonnement dans la base de données
    await createOrUpdateSubscription(userId, stripeSubscription, planType);

    console.log(`✅ Checkout complété pour l'utilisateur ${userId}, plan: ${planType}`);
  } catch (error) {
    console.error('Erreur lors du traitement de checkout.session.completed:', error);
    throw error;
  }
}

/**
 * Gérer l'événement customer.subscription.updated
 */
async function handleSubscriptionUpdated(stripeSubscription) {
  try {
    const userId = parseInt(stripeSubscription.metadata?.user_id);
    const planType = stripeSubscription.metadata?.plan_type;

    if (!userId || !planType) {
      console.error('Données manquantes dans la subscription:', stripeSubscription);
      return;
    }

    await createOrUpdateSubscription(userId, stripeSubscription, planType);

    console.log(`✅ Abonnement mis à jour pour l'utilisateur ${userId}`);
  } catch (error) {
    console.error('Erreur lors du traitement de customer.subscription.updated:', error);
    throw error;
  }
}

/**
 * Gérer l'événement customer.subscription.deleted
 */
async function handleSubscriptionDeleted(stripeSubscription) {
  try {
    const subscriptionId = stripeSubscription.id;

    // Mettre à jour le statut de l'abonnement dans la base de données
    await Subscription.update(
      {
        status: 'canceled'
      },
      {
        where: {
          stripe_subscription_id: subscriptionId
        }
      }
    );

    console.log(`✅ Abonnement annulé: ${subscriptionId}`);
  } catch (error) {
    console.error('Erreur lors du traitement de customer.subscription.deleted:', error);
    throw error;
  }
}

/**
 * Gérer l'événement invoice.payment_succeeded
 */
async function handlePaymentSucceeded(invoice) {
  try {
    const subscriptionId = invoice.subscription;
    if (!subscriptionId) return;

    // Mettre à jour le statut de l'abonnement à 'active'
    await Subscription.update(
      {
        status: 'active'
      },
      {
        where: {
          stripe_subscription_id: subscriptionId
        }
      }
    );

    console.log(`✅ Paiement réussi pour l'abonnement: ${subscriptionId}`);
  } catch (error) {
    console.error('Erreur lors du traitement de invoice.payment_succeeded:', error);
    throw error;
  }
}

/**
 * Gérer l'événement invoice.payment_failed
 */
async function handlePaymentFailed(invoice) {
  try {
    const subscriptionId = invoice.subscription;
    if (!subscriptionId) return;

    // Mettre à jour le statut de l'abonnement à 'past_due'
    await Subscription.update(
      {
        status: 'past_due'
      },
      {
        where: {
          stripe_subscription_id: subscriptionId
        }
      }
    );

    console.log(`⚠️ Paiement échoué pour l'abonnement: ${subscriptionId}`);
  } catch (error) {
    console.error('Erreur lors du traitement de invoice.payment_failed:', error);
    throw error;
  }
}

/**
 * Créer ou mettre à jour un abonnement dans la base de données
 */
async function createOrUpdateSubscription(userId, stripeSubscription, planType) {
  try {
    const subscriptionData = {
      user_id: userId,
      stripe_subscription_id: stripeSubscription.id,
      plan_type: planType,
      status: stripeSubscription.status === 'active' ? 'active' : 
              stripeSubscription.status === 'trialing' ? 'trialing' :
              stripeSubscription.status === 'past_due' ? 'past_due' : 'canceled',
      start_date: new Date(stripeSubscription.created * 1000),
      current_period_start: new Date(stripeSubscription.current_period_start * 1000),
      current_period_end: new Date(stripeSubscription.current_period_end * 1000),
      cancel_at_period_end: stripeSubscription.cancel_at_period_end || false
    };

    // Vérifier si l'abonnement existe déjà
    const existingSubscription = await Subscription.findOne({
      where: {
        stripe_subscription_id: stripeSubscription.id
      }
    });

    if (existingSubscription) {
      // Mettre à jour l'abonnement existant
      await existingSubscription.update(subscriptionData);
    } else {
      // Créer un nouvel abonnement
      await Subscription.create(subscriptionData);
    }

    // Mettre à jour le rôle de l'utilisateur
    const role = PLAN_TO_ROLE[planType];
    if (role) {
      await User.update(
        { role: role },
        { where: { id: userId } }
      );
    }

    console.log(`✅ Abonnement ${existingSubscription ? 'mis à jour' : 'créé'} pour l'utilisateur ${userId}`);
  } catch (error) {
    console.error('Erreur lors de la création/mise à jour de l\'abonnement:', error);
    throw error;
  }
}

module.exports = router;
