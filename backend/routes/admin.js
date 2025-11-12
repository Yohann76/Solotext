const express = require('express');
const bcrypt = require('bcrypt');
const { Op, fn, col } = require('sequelize');
const { authenticateToken, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const Analysis = require('../models/Analysis');
const Sentence = require('../models/Sentence');
const ApiCall = require('../models/ApiCall');
const AdminConfigProvider = require('../models/AdminConfigProvider');
const adminService = require('../services/adminService');

const router = express.Router();

// Middleware pour toutes les routes admin - vérification du rôle admin
router.use(authenticateToken);
router.use(requireRole(['admin']));


// ========================================
// ROUTES DE GESTION DES UTILISATEURS
// ========================================

/**
 * GET /api/admin/users
 * Récupérer tous les utilisateurs avec pagination et filtres
 */
router.get('/users', async (req, res) => {
  try {
    const data = await adminService.getUsers(req.query);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/users/:id
 * Récupérer un utilisateur spécifique
 */
router.get('/users/:id', async (req, res) => {
  try {
    const user = await adminService.getUserById(req.params.id);
    res.json({ success: true, data: user });
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'utilisateur ${req.params.id}:`, error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération de l\'utilisateur'
    });
  }
});

/**
 * POST /api/admin/users
 * Créer un nouvel utilisateur
 */
router.post('/users', async (req, res) => {
  try {
    const { email, password, role = 'user' } = req.body;

    // Validation des données
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'L\'email est requis'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe est requis'
      });
    }

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Le rôle doit être "admin" ou "user"'
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Hasher le mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Initialiser la date de reset des crédits
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0]; // Format YYYY-MM-DD

    // Créer l'utilisateur
    const newUser = await User.create({
      email,
      password: hashedPassword,
      role, // Par défaut 'user' = freemium (200 crédits)
      monthly_credits_used: 0, // Initialiser à 0
      credits_reset_date: todayDate // Initialiser la date de reset
    });

    // Retourner l'utilisateur sans le mot de passe
    const userResponse = await User.findByPk(newUser.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(201).json({
      success: true,
      data: userResponse,
      message: 'Utilisateur créé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'utilisateur',
      error: error.message
    });
  }
});

/**
 * PUT /api/admin/users/:id
 * Mettre à jour un utilisateur
 */
router.put('/users/:id', async (req, res) => {
  try {
    const updatedUser = await adminService.updateUser(req.params.id, req.body);
    res.json({ success: true, message: 'Utilisateur mis à jour avec succès', data: updatedUser });
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'utilisateur ${req.params.id}:`, error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Erreur lors de la mise à jour de l\'utilisateur'
    });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Supprimer un utilisateur
 */
router.delete('/users/:id', async (req, res) => {
  try {
    await adminService.deleteUser(req.params.id);
    res.json({ success: true, message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'utilisateur ${req.params.id}:`, error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression de l\'utilisateur'
    });
  }
});

// ========================================
// ROUTES DE GESTION DES ANALYSES
// ========================================

/**
 * GET /api/admin/analyses
 * Récupérer toutes les analyses avec pagination et filtres
 */
router.get('/analyses', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      status = '', 
      userId = '', 
      sortBy = 'created_at', 
      sortOrder = 'DESC' 
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Construction des conditions de recherche
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (userId) {
      whereClause.user_id = parseInt(userId);
    }

    // Récupération des analyses avec pagination
    const { count, rows: analyses } = await Analysis.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        attributes: ['id', 'email', 'role']
      }],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calcul des statistiques
    const totalAnalyses = await Analysis.count();
    const waitingAnalyses = await Analysis.count({ where: { status: 'waiting_for_process' } });
    const inProgressAnalyses = await Analysis.count({ 
      where: { 
        status: ['sentence_segmentation_in_progress', 'sentence_analysis_in_progress'] 
      } 
    });
    const completedAnalyses = await Analysis.count({ where: { status: 'analysis_completed' } });
    const errorAnalyses = await Analysis.count({ 
      where: { 
        status: ['sentence_segmentation_error', 'sentence_analysis_error'] 
      } 
    });

    res.json({
      success: true,
      data: {
        analyses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        },
        stats: {
          total: totalAnalyses,
          waiting: waitingAnalyses,
          inProgress: inProgressAnalyses,
          completed: completedAnalyses,
          error: errorAnalyses
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des analyses:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des analyses',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/analyses/:id
 * Récupérer une analyse spécifique avec ses phrases
 */
router.get('/analyses/:id', async (req, res) => {
  try {
    const analysisId = parseInt(req.params.id);
    
    const analysis = await Analysis.findByPk(analysisId, {
      include: [{
        model: User,
        attributes: ['id', 'email', 'role']
      }, {
        model: Sentence,
        order: [['position', 'ASC']]
      }]
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analyse non trouvée'
      });
    }

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'analyse:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'analyse',
      error: error.message
    });
  }
});

/**
 * DELETE /api/admin/analyses/:id
 * Supprimer une analyse
 */
router.delete('/analyses/:id', async (req, res) => {
  try {
    const analysisId = parseInt(req.params.id);
    
    const analysis = await Analysis.findByPk(analysisId);
    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analyse non trouvée'
      });
    }

    // Supprimer l'analyse (cascade supprimera les phrases)
    await analysis.destroy();

    res.json({
      success: true,
      message: 'Analyse supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'analyse:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'analyse',
      error: error.message
    });
  }
});

// ========================================
// ROUTES DE STATISTIQUES
// ========================================

/**
 * GET /api/admin/stats
 * Récupérer les statistiques globales de l'application
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

// ROUTES DE GESTION DES COÛTS
// ========================================

/**
 * GET /api/admin/costs/users
 * Récupérer les coûts totaux par utilisateur, par mois et par fournisseur
 */
router.get('/costs/users', async (req, res) => {
  try {
    const userCosts = await adminService.calculateUserCosts();
    res.json({ success: true, data: userCosts });
  } catch (error) {
    console.error('Erreur lors du calcul des coûts par utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du calcul des coûts',
      error: error.message
    });
  }
});

// ========================================
// ROUTES DE GESTION DES PROVIDERS
// ========================================

router.get('/providers', async (req, res) => {
  try {
    const providers = await adminService.getAllProviders();
    res.json({ success: true, data: providers });
  } catch (error) {
    console.error('Erreur lors de la récupération des fournisseurs:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la récupération des fournisseurs' });
  }
});

router.put('/providers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_used } = req.body;
    const updatedProvider = await adminService.toggleProviderStatus(id, is_used);
    res.json({ success: true, message: 'Statut du fournisseur mis à jour', data: updatedProvider });
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du fournisseur ${req.params.id}:`, error);
    res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message || 'Erreur lors de la mise à jour du fournisseur'
    });
  }
});

module.exports = router;
