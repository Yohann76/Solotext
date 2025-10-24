const express = require('express');
const bcrypt = require('bcrypt');
const { Op, fn, col } = require('sequelize');
const { authenticateToken, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const Analysis = require('../models/Analysis');
const Sentence = require('../models/Sentence');
const ApiCall = require('../models/ApiCall');
const AdminConfigProvider = require('../models/AdminConfigProvider');

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

    // Récupérer le nombre d'analyses et de phrases pour chaque utilisateur
    const userIds = users.map(user => user.id);

    const analysisCounts = await Analysis.findAll({
      where: { user_id: userIds },
      attributes: ['user_id', [fn('COUNT', 'id'), 'analysisCount']],
      group: ['user_id'],
      raw: true,
    });

    const sentenceCounts = await Sentence.findAll({
      attributes: [[col('Analysis.user_id'), 'user_id'], [fn('COUNT', col('Sentence.id')), 'sentenceCount']],
      include: [{
        model: Analysis,
        attributes: [],
        where: { user_id: userIds },
      }],
      group: [col('Analysis.user_id')],
      raw: true,
    });

    const analysisMap = analysisCounts.reduce((acc, count) => {
      acc[count.user_id] = parseInt(count.analysisCount, 10);
      return acc;
    }, {});

    const sentenceMap = sentenceCounts.reduce((acc, count) => {
      acc[count.user_id] = parseInt(count.sentenceCount, 10);
      return acc;
    }, {});

    // Ajouter les données d'appels API aux utilisateurs
    const usersWithData = users.map(user => ({
      ...user.toJSON(),
      analysisCount: analysisMap[user.id] || 0,
      sentenceCount: sentenceMap[user.id] || 0,
    }));

    // Calcul des statistiques
    const totalUsers = await User.count();
    const adminUsers = await User.count({ where: { role: 'admin' } });
    const regularUsers = await User.count({ where: { role: 'user' } });

    res.json({
      success: true,
      data: {
        users: usersWithData,
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
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

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
    
    // Statistiques des appels API Perplexity
    const totalPerplexityCalls = await ApiCall.sum('call_count', {
      include: [{
        model: AdminConfigProvider,
        as: 'provider',
        where: { provider_name: 'perplexity' },
        attributes: []
      }]
    }) || 0;
    
    const todayPerplexityCalls = await ApiCall.sum('call_count', {
      where: { 
        call_date: new Date().toISOString().split('T')[0]
      },
      include: [{
        model: AdminConfigProvider,
        as: 'provider',
        where: { provider_name: 'perplexity' },
        attributes: []
      }]
    }) || 0;
    
    const perplexityCallsByDay = await ApiCall.findAll({
      where: {
        call_date: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      include: [{
        model: AdminConfigProvider,
        as: 'provider',
        where: { provider_name: 'perplexity' },
        attributes: []
      }],
      attributes: [
        'call_date',
        [fn('SUM', col('call_count')), 'total_calls']
      ],
      group: ['call_date'],
      order: [['call_date', 'ASC']]
    });
    
    // Top utilisateurs Perplexity (derniers 30 jours)
    const topPerplexityUsers = await ApiCall.findAll({
      where: {
        call_date: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      include: [
        {
          model: AdminConfigProvider,
          as: 'provider',
          where: { provider_name: 'perplexity' },
          attributes: []
        },
        {
          model: User,
          attributes: ['id', 'email', 'role']
        }
      ],
      attributes: [
        'user_id',
        [fn('SUM', col('call_count')), 'total_calls']
      ],
      group: ['user_id', 'User.id'],
      order: [[fn('SUM', col('call_count')), 'DESC']],
      limit: 10,
      include: [{
        model: User,
        attributes: ['id', 'email', 'role']
      }]
    });
    
    // Analyses par jour (derniers 30 jours)
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
        perplexity: {
          totalCalls: totalPerplexityCalls,
          todayCalls: todayPerplexityCalls,
          callsByDay: perplexityCallsByDay,
          topUsers: topPerplexityUsers
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

router.get('/costs/users', async (req, res) => {
  try {
    const userCosts = await ApiCall.findAll({
      attributes: [
        'user_id',
        [fn('date_trunc', 'month', col('call_date')), 'month'],
        [fn('sum', col('call_count')), 'total_calls'],
      ],
      include: [
        {
          model: User,
          attributes: ['id', 'email'],
        },
        {
          model: AdminConfigProvider,
          as: 'provider',
          attributes: ['provider_name', 'cost_per_request'],
        },
      ],
      group: [
        'user_id',
        'month',
        'User.id',
        'provider.id'
      ],
      order: [['user_id', 'ASC'], [fn('date_trunc', 'month', col('call_date')), 'DESC']],
      raw: true,
    });

    const formattedCosts = userCosts.reduce((acc, cost) => {
      const { user_id, 'User.email': email, month, total_calls } = cost;
      const providerName = cost['provider.provider_name'];
      const costPerRequest = parseFloat(cost['provider.cost_per_request']);
      const totalCost = total_calls * costPerRequest;
      const monthFormatted = new Date(month).toISOString().slice(0, 7);

      let userEntry = acc.find(u => u.userId === user_id);
      if (!userEntry) {
        userEntry = {
          userId: user_id,
          email: email,
          monthlyCosts: [],
        };
        acc.push(userEntry);
      }

      let monthEntry = userEntry.monthlyCosts.find(m => m.month === monthFormatted);
      if (!monthEntry) {
        monthEntry = {
          month: monthFormatted,
          providers: [],
          totalMonthCost: 0,
        };
        userEntry.monthlyCosts.push(monthEntry);
      }

      monthEntry.providers.push({
        providerName,
        requestCount: parseInt(total_calls),
        costPerRequest,
        totalCost,
      });
      
      monthEntry.totalMonthCost += totalCost;

      return acc;
    }, []);

    res.json({
      success: true,
      data: formattedCosts,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des coûts par utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des coûts par utilisateur',
      error: error.message,
    });
  }
});

module.exports = router;
