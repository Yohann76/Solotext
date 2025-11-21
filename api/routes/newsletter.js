const express = require('express');
const Newsletter = require('../models/Newsletter');
const { Op } = require('sequelize');

const router = express.Router();

/**
 * POST /api/newsletter/subscribe
 * Subscribe to the newsletter
 */
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'L\'email est requis'
            });
        }

        // Check if email already exists
        let subscriber = await Newsletter.findOne({ where: { email: email.toLowerCase() } });

        if (subscriber) {
            if (!subscriber.is_subscribed) {
                // Reactivate subscription if previously unsubscribed
                await subscriber.update({ is_subscribed: true });
                return res.json({
                    success: true,
                    message: 'Votre inscription à la newsletter a été réactivée !'
                });
            } else {
                return res.json({
                    success: true,
                    message: 'Vous êtes déjà inscrit à notre newsletter.'
                });
            }
        }

        // Create new subscriber
        await Newsletter.create({
            email,
            is_subscribed: true
        });

        res.status(201).json({
            success: true,
            message: 'Merci de votre inscription à notre newsletter !'
        });

    } catch (error) {
        console.error('Erreur lors de l\'inscription newsletter:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de l\'inscription.'
        });
    }
});

/**
 * POST /api/newsletter/unsubscribe
 * Unsubscribe from the newsletter
 */
router.post('/unsubscribe', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'L\'email est requis'
            });
        }

        // Find subscriber
        const subscriber = await Newsletter.findOne({ where: { email: email.toLowerCase() } });

        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: 'Cet email n\'est pas inscrit à notre newsletter.'
            });
        }

        if (!subscriber.is_subscribed) {
            return res.json({
                success: true,
                message: 'Vous êtes déjà désinscrit de notre newsletter.'
            });
        }

        // Unsubscribe
        await subscriber.update({ is_subscribed: false });

        res.json({
            success: true,
            message: 'Vous avez été désinscrit de notre newsletter avec succès.'
        });

    } catch (error) {
        console.error('Erreur lors de la désinscription newsletter:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la désinscription.'
        });
    }
});

module.exports = router;
