const express = require('express');
const cors = require('cors');
const { Op } = require('sequelize');
require('dotenv').config();

// Import de la configuration de base de données
const { sequelize, testConnection } = require('./config/database');
const User = require('./models/User');
const Subscription = require('./models/Subscription'); // Renommé de Text à Subscription
const Analysis = require('./models/Analysis');
const Sentence = require('./models/Sentence');

// Import des routes d'authentification
const authRoutes = require('./routes/auth');
const analysesRoutes = require('./routes/analyses');
const adminRoutes = require('./routes/admin');
const creditsRoutes = require('./routes/credits');
const stripeRoutes = require('./routes/stripe');
const newsletterRoutes = require('./routes/newsletter');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration CORS : autoriser les domaines et IPs
const allowedOrigins = [
  // Domaines de production
  'https://app.solotext.io',
  'https://solotext.io',
  'https://api.solotext.io',

  // Domaines de staging
  'https://app.staging.solotext.io',
  'https://staging.solotext.io',
  'https://api.staging.solotext.io',

  // IPs directes - Staging (51.178.80.14)
  'http://51.178.80.14:8080',  // App staging
  'http://51.178.80.14:8081',  // Website staging
  'http://51.178.80.14:3000',  // API staging

  // IPs directes - Production (51.38.178.137)
  'http://51.38.178.137:8080',  // App production
  'http://51.38.178.137:8081',  // Website production
  'http://51.38.178.137:3000',  // API production

  // Localhost pour le développement local
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:3000',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:8081',
  'http://127.0.0.1:8081',
  'http://127.0.0.1:3000',
  'http://localhost:8090'
];

// Configuration CORS avec validation d'origine
const corsOptions = {
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origine (ex: Postman, curl, applications mobiles)
    if (!origin) {
      return callback(null, true);
    }

    // Vérifier si l'origine est autorisée
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // En développement, autoriser toutes les origines pour faciliter le debug
      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️  CORS: Origine non autorisée en développement: ${origin}`);
        callback(null, true);
      } else {
        console.error(`❌ CORS: Origine non autorisée: ${origin}`);
        callback(new Error('Non autorisé par CORS'));
      }
    }
  },
  credentials: true, // Autoriser les cookies et les en-têtes d'authentification
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration des associations entre modèles
User.hasMany(Subscription, { foreignKey: 'user_id' });
Subscription.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Analysis, { foreignKey: 'user_id' });
Analysis.belongsTo(User, { foreignKey: 'user_id' });

Analysis.hasMany(Sentence, { foreignKey: 'analysis_id' });
Sentence.belongsTo(Analysis, { foreignKey: 'analysis_id' });

// Import des middlewares d'authentification
const { authenticateToken, requireRole } = require('./middleware/auth');

// Routes de base
app.get('/', (req, res) => {
  res.json({
    message: 'API SoloText - Serveur en cours d\'exécution',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      health: '/api/health'
    }
  });
});

// Routes d'authentification (publiques)
app.use('/api/auth', authRoutes);
app.use('/api/credits', creditsRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/user', userRoutes);

// Routes des analyses (protégées)
app.use('/api/analyses', analysesRoutes);

// Routes d'administration (protégées - admin uniquement)
app.use('/api/admin', adminRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes pour les utilisateurs (protégées) - Compatible avec le dashboard
app.get('/api/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
});

app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur',
      error: error.message
    });
  }
});

app.post('/api/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { email, password, role = 'user' } = req.body;

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
    const bcrypt = require('bcryptjs');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

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
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'utilisateur',
      error: error.message
    });
  }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { email, password, role } = req.body;

    const user = await User.findByPk(id);

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
          id: { [Op.ne]: id }
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
      const bcrypt = require('bcryptjs');
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    await user.update(updateData);

    // Retourner l'utilisateur mis à jour sans le mot de passe
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Utilisateur mis à jour avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'utilisateur',
      error: error.message
    });
  }
});

app.delete('/api/users/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Empêcher la suppression de son propre compte
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte'
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur',
      error: error.message
    });
  }
});

// Routes pour les analyses (protégées)
app.get('/api/analyses', authenticateToken, async (req, res) => {
  try {
    const analyses = await Analysis.findAll({
      include: [{
        model: User,
        attributes: ['id', 'email']
      }],
      order: [['analyzed_at', 'DESC']]
    });

    res.json({
      success: true,
      data: analyses,
      count: analyses.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des analyses',
      error: error.message
    });
  }
});

app.post('/api/analyses', authenticateToken, async (req, res) => {
  try {
    const { user_id, source_text, duplicate_percent } = req.body;

    if (!user_id || !source_text || duplicate_percent === undefined) {
      return res.status(400).json({
        success: false,
        message: 'user_id, source_text et duplicate_percent sont requis'
      });
    }

    const newAnalysis = await Analysis.create({
      user_id,
      analyzed_at: new Date(),
      source_text,
      duplicate_percent
    });

    res.status(201).json({
      success: true,
      data: newAnalysis,
      message: 'Analyse créée avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'analyse',
      error: error.message
    });
  }
});

// Routes pour les phrases
app.get('/api/analyses/:id/sentences', async (req, res) => {
  try {
    const analysis_id = parseInt(req.params.id);
    const sentences = await Sentence.findAll({
      where: { analysis_id },
      order: [['created_at', 'ASC']]
    });

    res.json({
      success: true,
      data: sentences,
      count: sentences.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des phrases',
      error: error.message
    });
  }
});

app.post('/api/analyses/:id/sentences', async (req, res) => {
  try {
    const analysis_id = parseInt(req.params.id);
    const { sentence_text, source_url, is_duplicate } = req.body;

    if (!sentence_text) {
      return res.status(400).json({
        success: false,
        message: 'sentence_text est requis'
      });
    }

    const newSentence = await Sentence.create({
      analysis_id,
      sentence_text,
      source_url,
      is_duplicate: is_duplicate || false
    });

    res.status(201).json({
      success: true,
      data: newSentence,
      message: 'Phrase ajoutée avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la phrase',
      error: error.message
    });
  }
});

// Routes pour les abonnements
app.get('/api/subscriptions', async (req, res) => {
  try {
    const subscriptions = await Subscription.findAll({
      include: [{
        model: User,
        attributes: ['id', 'email']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: subscriptions,
      count: subscriptions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des abonnements',
      error: error.message
    });
  }
});

app.post('/api/subscriptions', async (req, res) => {
  try {
    const {
      user_id,
      stripe_subscription_id,
      status,
      start_date,
      current_period_start,
      current_period_end,
      cancel_at_period_end
    } = req.body;

    if (!user_id || !stripe_subscription_id || !status) {
      return res.status(400).json({
        success: false,
        message: 'user_id, stripe_subscription_id et status sont requis'
      });
    }

    const newSubscription = await Subscription.create({
      user_id,
      stripe_subscription_id,
      status,
      start_date: start_date || new Date(),
      current_period_start: current_period_start || new Date(),
      current_period_end: current_period_end || new Date(),
      cancel_at_period_end: cancel_at_period_end || false
    });

    res.status(201).json({
      success: true,
      data: newSubscription,
      message: 'Abonnement créé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'abonnement',
      error: error.message
    });
  }
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur'
  });
});

// Initialisation et démarrage du serveur
const startServer = async () => {
  try {
    // Tester la connexion à la base de données
    await testConnection();

    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📡 API disponible sur http://localhost:${PORT}`);
      console.log(`🔍 Documentation: http://localhost:${PORT}/api/health`);
      console.log(`🗄️  Base de données PostgreSQL connectée`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Démarrer le serveur
startServer();

module.exports = app;
