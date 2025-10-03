const express = require('express');
const router = express.Router();
const Analysis = require('../models/Analysis');
const { authenticateToken } = require('../middleware/auth');
const queueService = require('../services/queueService');

// POST /api/analyses - Create a new analysis
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { source_text } = req.body;
    const userId = req.user.id;

    // Validation
    if (!source_text || source_text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Le texte source est requis',
        code: 'MISSING_SOURCE_TEXT'
      });
    }

    if (source_text.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Le texte doit contenir au moins 10 caractères',
        code: 'TEXT_TOO_SHORT'
      });
    }

    // Create the analysis
    const analysis = await Analysis.create({
      user_id: userId,
      source_text: source_text.trim(),
      // duplicate_percent null by default // must be update with worker
      status: 'pending', // Status initial // TODO: clarify, not use in database?
      analyzed_at: new Date() // Date of analysis
    });

    // Send analysis task to queue
    const taskSent = await queueService.sendAnalysisTask(analysis.id, analysis.source_text);
    
    if (!taskSent) {
      console.warn(`⚠️ Impossible d'envoyer la tâche d'analyse #${analysis.id} à la queue`);
      // Continue anyway, analysis is created
    }

    // Return the created analysis
    res.status(201).json({
      success: true,
      message: 'Analyse créée avec succès et envoyée au traitement',
      data: {
        analysis: {
          id: analysis.id,
          user_id: analysis.user_id,
          source_text: analysis.source_text,
          duplicate_percent: analysis.duplicate_percent,
          status: analysis.status,
          created_at: analysis.created_at,
          updated_at: analysis.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Error creating analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// GET /api/analyses - Get the analyses of the user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const analyses = await Analysis.findAndCountAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        analyses: analyses.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: analyses.count,
          pages: Math.ceil(analyses.count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des analyses:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

// GET /api/analyses/:id - Get a specific analysis
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const analysis = await Analysis.findOne({
      where: { 
        id: id,
        user_id: userId 
      }
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found',
        code: 'ANALYSIS_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: { analysis }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'analyse:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

// PUT /api/analyses/:id - Update an analysis
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { duplicate_percent, status } = req.body;

    const analysis = await Analysis.findOne({
      where: { 
        id: id,
        user_id: userId 
      }
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analyse non trouvée',
        code: 'ANALYSIS_NOT_FOUND'
      });
    }

    // Update the fields provided
    if (duplicate_percent !== undefined) {
      analysis.duplicate_percent = duplicate_percent;
    }
    if (status !== undefined) {
      analysis.status = status;
    }

    await analysis.save();

    res.json({
      success: true,
      message: 'Analyse mise à jour avec succès',
      data: { analysis }
    });

  } catch (error) {
    console.error('Error updating analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

// DELETE /api/analyses/:id - Delete an analysis
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const analysis = await Analysis.findOne({
      where: { 
        id: id,
        user_id: userId 
      }
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analyse non trouvée',
        code: 'ANALYSIS_NOT_FOUND'
      });
    }

    await analysis.destroy();

    res.json({
      success: true,
      message: 'Analyse supprimée avec succès'
    });

  } catch (error) {
    console.error('Error deleting analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;
