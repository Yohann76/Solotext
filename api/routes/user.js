const express = require('express');
const bcrypt = require('bcryptjs');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

const router = express.Router();

// Middleware pour toutes les routes user
router.use(authenticateToken);

/**
 * GET /api/user/profile
 * Récupérer le profil de l'utilisateur connecté
 */
router.get('/profile', async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'email', 'role', 'created_at', 'updated_at', 'monthly_credits_used', 'credits_reset_date']
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                role: user.role,
                roleFormatted: user.roleFormatted,
                displayName: user.displayName,
                initials: user.initials,
                hasGoogleAccount: user.hasGoogleAccount,
                accountAge: user.accountAge,
                monthlyCreditsUsed: user.monthly_credits_used,
                creditsResetDate: user.credits_reset_date,
                createdAt: user.created_at,
                updatedAt: user.updated_at
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du profil'
        });
    }
});

/**
 * PUT /api/user/profile
 * Mettre à jour le profil de l'utilisateur
 */
router.put('/profile', async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // Si changement de mot de passe
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Le mot de passe actuel est requis'
                });
            }

            // Vérifier le mot de passe actuel
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Mot de passe actuel incorrect'
                });
            }

            // Valider le nouveau mot de passe
            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
                });
            }

            // Hacher et mettre à jour le mot de passe
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
        }

        // Mettre à jour l'email si fourni
        if (email && email !== user.email) {
            // Vérifier si l'email existe déjà
            const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
            if (existingUser && existingUser.id !== user.id) {
                return res.status(409).json({
                    success: false,
                    message: 'Cet email est déjà utilisé'
                });
            }
            user.email = email.toLowerCase();
        }

        await user.save();

        res.json({
            success: true,
            message: 'Profil mis à jour avec succès',
            data: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du profil'
        });
    }
});

/**
 * GET /api/user/subscriptions
 * Récupérer les abonnements de l'utilisateur
 */
router.get('/subscriptions', async (req, res) => {
    try {
        const subscriptions = await Subscription.findAll({
            where: { user_id: req.user.id },
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: subscriptions
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des abonnements:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des abonnements'
        });
    }
});

/**
 * POST /api/user/subscriptions/cancel
 * Annuler l'abonnement actif de l'utilisateur
 */
router.post('/subscriptions/cancel', async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            where: {
                user_id: req.user.id,
                status: 'active'
            }
        });

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Aucun abonnement actif trouvé'
            });
        }

        // Marquer pour annulation à la fin de la période
        subscription.cancel_at_period_end = true;
        await subscription.save();

        res.json({
            success: true,
            message: 'Votre abonnement sera annulé à la fin de la période en cours',
            data: subscription
        });
    } catch (error) {
        console.error('Erreur lors de l\'annulation de l\'abonnement:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'annulation de l\'abonnement'
        });
    }
});

module.exports = router;
