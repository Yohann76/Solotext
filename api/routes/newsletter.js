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

module.exports = router;
