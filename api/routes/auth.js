const express = require('express');
const bcrypt = require('bcryptjs');
const { generateToken, verifyPassword, authenticateToken } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

/**
 * POST /api/auth/login
 * Connexion d'un utilisateur
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation des données
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe sont requis',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Rechercher l'utilisateur
    const user = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Vérifier si l'utilisateur a un mot de passe
    if (!user.hasPassword) {
      return res.status(401).json({
        success: false,
        message: 'Aucun mot de passe défini pour ce compte',
        code: 'NO_PASSWORD_SET'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Générer le token JWT
    const token = generateToken(user);

    // Retourner les informations de l'utilisateur et le token
    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          roleFormatted: user.roleFormatted,
          displayName: user.displayName,
          initials: user.initials,
          hasGoogleAccount: user.hasGoogleAccount,
          accountAge: user.accountAge
        },
        token,
        expiresIn: '24h'
      }
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, role = 'user' } = req.body;

    // Validation des données
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe sont requis',
        code: 'MISSING_CREDENTIALS'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 6 caractères',
        code: 'PASSWORD_TOO_SHORT'
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà',
        code: 'USER_EXISTS'
      });
    }

    // Créer le nouvel utilisateur
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0]; // Format YYYY-MM-DD

    const user = new User({
      email: email.toLowerCase(),
      role: role, // Par défaut 'user' = freemium (200 crédits)
      monthly_credits_used: 0, // Initialiser à 0
      credits_reset_date: todayDate // Initialiser la date de reset
    });

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    // Sauvegarder l'utilisateur
    await user.save();

    // Générer le token JWT
    const token = generateToken(user);

    // Retourner les informations de l'utilisateur et le token
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          roleFormatted: user.roleFormatted,
          displayName: user.displayName,
          initials: user.initials,
          hasGoogleAccount: user.hasGoogleAccount,
          accountAge: user.accountAge
        },
        token,
        expiresIn: '24h'
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/auth/me
 * Obtenir les informations de l'utilisateur connecté
 */
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        displayName: req.user.displayName,
        initials: req.user.initials,
        hasGoogleAccount: req.user.hasGoogleAccount,
        accountAge: req.user.accountAge,
        roleFormatted: req.user.roleFormatted
      }
    }
  });
});

/**
 * POST /api/auth/logout
 * Déconnexion (côté client, le token sera supprimé)
 */
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

/**
 * POST /api/auth/change-password
 * Changer le mot de passe de l'utilisateur connecté
 */
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel et nouveau mot de passe sont requis',
        code: 'MISSING_PASSWORDS'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères',
        code: 'PASSWORD_TOO_SHORT'
      });
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await verifyPassword(currentPassword, req.user.password);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Hacher le nouveau mot de passe
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    req.user.password = hashedNewPassword;
    await req.user.save();

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });

  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;
