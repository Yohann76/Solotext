/**
 * ROUTES POUR LA GESTION DES CRÉDITS
 * 
 * Endpoints :
 * - GET /api/credits - Obtenir les informations de crédits de l'utilisateur
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const CreditService = require('../services/creditService');

/**
 * GET /api/credits
 * Obtenir les informations de crédits de l'utilisateur connecté
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const creditsInfo = await CreditService.getCreditsInfo(userId);

    res.json({
      success: true,
      data: creditsInfo
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des crédits:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;

