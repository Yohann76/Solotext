const express = require('express');
const bcrypt = require('bcrypt');
const { Op, fn, col } = require('sequelize');
const { authenticateToken, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const Analysis = require('../models/Analysis');
const Sentence = require('../models/Sentence');

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
    const { 
      page = 1, 
      limit = 50, 
      search = '', 
      role = '', 
      sortBy = 'created_at', 
      sortOrder = 'DESC' 
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Construction des conditions de recherche
    const whereClause = {};
    
    if (search) {
      whereClause.email = {
        [Op.iLike]: `%${search}%`
      };
    }
    
    if (role) {
      whereClause.role = role;
    }

    // Récupération des utilisateurs avec pagination
    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ['password'] } // Exclure les mots de passe
    });

    // Calcul des statistiques
    const totalUsers = await User.count();
    const adminUsers = await User.count({ where: { role: 'admin' } });
    const regularUsers = await User.count({ where: { role: 'user' } });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        },
        stats: {
          total: totalUsers,
          admins: adminUsers,
          users: regularUsers
        }
      }
    });
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
 * Récupérer un utilisateur spécifique avec ses analyses
 */
router.get('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Analysis,
        limit: 10,
        order: [['created_at', 'DESC']]
      }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Statistiques de l'utilisateur
    const analysisCount = await Analysis.count({ where: { user_id: userId } });
    const completedAnalyses = await Analysis.count({ 
      where: { user_id: userId, status: 'analysis_completed' } 
    });
    const pendingAnalyses = await Analysis.count({ 
      where: { user_id: userId, status: 'waiting_for_process' } 
    });

    res.json({
      success: true,
      data: {
        user,
        stats: {
          totalAnalyses: analysisCount,
          completedAnalyses,
          pendingAnalyses
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur',
      error: error.message
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

    // Créer l'utilisateur
    const newUser = await User.create({
      email,
      password: hashedPassword,
      role
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
 * Modifier un utilisateur
 */
router.put('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { email, password, role } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Mise à jour des données
    const updateData = {};
    
    if (email) {
      // Vérifier si l'email n'est pas déjà utilisé par un autre utilisateur
      const existingUser = await User.findOne({ 
        where: { 
          email, 
          id: { [Op.ne]: userId } 
        } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé par un autre utilisateur'
        });
      }
      
      updateData.email = email;
    }

    if (role && ['admin', 'user'].includes(role)) {
      updateData.role = role;
    }

    if (password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    await user.update(updateData);

    // Retourner l'utilisateur mis à jour sans le mot de passe
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Utilisateur mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'utilisateur',
      error: error.message
    });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Supprimer un utilisateur
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Empêcher la suppression de son propre compte
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Supprimer l'utilisateur (cascade supprimera les analyses et phrases)
    await user.destroy();

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur',
      error: error.message
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
// ROUTES DE STATISTIQUES GLOBALES
// ========================================

/**
 * GET /api/admin/stats
 * Récupérer les statistiques globales du système
 */
router.get('/stats', async (req, res) => {
  try {
    // Statistiques des utilisateurs
    const totalUsers = await User.count();
    const adminUsers = await User.count({ where: { role: 'admin' } });
    const regularUsers = await User.count({ where: { role: 'user' } });
    
    // Statistiques des analyses
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
    
    // Analyses par jour (derniers 30 jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const analysesByDay = await Analysis.findAll({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      attributes: [
        [fn('DATE', col('created_at')), 'date'],
        [fn('COUNT', '*'), 'count']
      ],
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'ASC']]
    });

    // Utilisateurs les plus actifs (top 10) - Simplifié pour éviter les erreurs SQL
    const mostActiveUsers = await User.findAll({
      attributes: ['id', 'email', 'role'],
      limit: 10,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          admins: adminUsers,
          regular: regularUsers
        },
        analyses: {
          total: totalAnalyses,
          waiting: waitingAnalyses,
          inProgress: inProgressAnalyses,
          completed: completedAnalyses,
          error: errorAnalyses
        },
        charts: {
          analysesByDay,
          mostActiveUsers
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

module.exports = router;
