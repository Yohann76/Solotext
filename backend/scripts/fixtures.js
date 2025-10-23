#!/usr/bin/env node

/**
 * Script de fixtures pour l'initialisation de la base de données SoloText
 * Ce script crée les données initiales nécessaires au bon fonctionnement de l'application
 * 
 * Usage: node fixtures.js [options]
 * Exécution depuis la racine: docker-compose exec backend node scripts/fixtures.js
 */

const bcrypt = require('bcrypt');
const { sequelize, testConnection } = require('../config/database');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Analysis = require('../models/Analysis');
const Sentence = require('../models/Sentence');
const AdminConfigProvider = require('../models/AdminConfigProvider');

// Configuration des données de test
const FIXTURES = {
  users: [
    {
      email: 'yohanndurand76@gmail.com',
      password: 'devdev',
      role: 'admin',
      google_id: null
    },
    {
      email: 'test@example.com',
      password: 'test123',
      role: 'user',
      google_id: 'google_test_123'
    },
    {
      email: 'demo@solotext.com',
      password: 'demo123',
      role: 'user',
      google_id: null
    }
  ],
  subscriptions: [
    {
      user_email: 'yohanndurand76@gmail.com',
      stripe_subscription_id: 'sub_admin_001',
      status: 'active',
      start_date: new Date('2024-01-01'),
      current_period_start: new Date('2024-01-01'),
      current_period_end: new Date('2025-01-01'),
      cancel_at_period_end: false
    },
    {
      user_email: 'test@example.com',
      stripe_subscription_id: 'sub_test_001',
      status: 'trialing',
      start_date: new Date('2024-12-01'),
      current_period_start: new Date('2024-12-01'),
      current_period_end: new Date('2025-01-01'),
      cancel_at_period_end: false
    }
  ],
  analyses: [
    {
      user_email: 'test@example.com',
      source_text: 'Ceci est un exemple de texte à analyser pour détecter les duplications. Il contient plusieurs phrases qui peuvent être comparées avec d\'autres sources en ligne.',
      duplicate_percent: 15.5
    },
    {
      user_email: 'demo@solotext.com',
      source_text: 'Un autre exemple de texte pour tester le système d\'analyse de plagiat. Ce texte contient des informations originales et des références à d\'autres travaux.',
      duplicate_percent: 8.2
    }
  ],
  sentences: [
    {
      analysis_user_email: 'test@example.com',
      sentence_text: 'Ceci est un exemple de phrase qui pourrait être dupliquée.',
      source_url: 'https://example.com/source1',
      is_duplicate: true
    },
    {
      analysis_user_email: 'test@example.com',
      sentence_text: 'Cette phrase est complètement originale et unique.',
      source_url: null,
      is_duplicate: false
    },
    {
      analysis_user_email: 'demo@solotext.com',
      sentence_text: 'Une phrase de démonstration pour tester le système.',
      source_url: null,
      is_duplicate: false
    }
  ],
  adminConfigProviders: [
    {
      provider_name: 'perplexity_search',
      api_url: 'https://api.perplexity.ai/search',
      cost_per_request: 0.005,
      is_used: true
    }
  ]
};

async function createFixtures() {
  try {
    console.log('🚀 Démarrage de l\'initialisation des fixtures SoloText...');
    console.log('═'.repeat(60));
    
    // Tester la connexion à la base de données
    console.log('🔌 Test de connexion à la base de données...');
    await testConnection();
    
    // Synchroniser les modèles
    console.log('🔄 Synchronisation des modèles...');
    await sequelize.sync({ alter: true });
    
    // Créer les utilisateurs
    console.log('\n👥 Création des utilisateurs...');
    const createdUsers = {};
    
    for (const userData of FIXTURES.users) {
      console.log(`   📧 Création de ${userData.email} (${userData.role})...`);
      
      // Vérifier si l'utilisateur existe déjà
      let user = await User.findOne({ where: { email: userData.email } });
      
      if (user) {
        console.log(`   ⚠️  Utilisateur existant, mise à jour...`);
        user.role = userData.role;
        if (userData.password) {
          const hashedPassword = await bcrypt.hash(userData.password, 10);
          user.password = hashedPassword;
        }
        if (userData.google_id) {
          user.google_id = userData.google_id;
        }
        await user.save();
      } else {
        // Créer un nouvel utilisateur
        user = new User({
          email: userData.email,
          role: userData.role,
          google_id: userData.google_id
        });
        
        if (userData.password) {
          const hashedPassword = await bcrypt.hash(userData.password, 10);
          user.password = hashedPassword;
        }
        
        await user.save();
      }
      
      createdUsers[userData.email] = user;
      console.log(`   ✅ ${user.email} (${user.roleFormatted}) - ID: ${user.id}`);
    }
    
    // Créer les abonnements
    console.log('\n💳 Création des abonnements...');
    for (const subData of FIXTURES.subscriptions) {
      const user = createdUsers[subData.user_email];
      if (!user) {
        console.log(`   ⚠️  Utilisateur ${subData.user_email} non trouvé, abonnement ignoré`);
        continue;
      }
      
      console.log(`   💳 Création de l'abonnement pour ${user.email}...`);
      
      // Vérifier si l'abonnement existe déjà
      let subscription = await Subscription.findOne({ 
        where: { stripe_subscription_id: subData.stripe_subscription_id } 
      });
      
      if (subscription) {
        console.log(`   ⚠️  Abonnement existant, mise à jour...`);
        subscription.status = subData.status;
        subscription.start_date = subData.start_date;
        subscription.current_period_start = subData.current_period_start;
        subscription.current_period_end = subData.current_period_end;
        subscription.cancel_at_period_end = subData.cancel_at_period_end;
        await subscription.save();
      } else {
        subscription = new Subscription({
          user_id: user.id,
          stripe_subscription_id: subData.stripe_subscription_id,
          status: subData.status,
          start_date: subData.start_date,
          current_period_start: subData.current_period_start,
          current_period_end: subData.current_period_end,
          cancel_at_period_end: subData.cancel_at_period_end
        });
        await subscription.save();
      }
      
      console.log(`   ✅ Abonnement ${subscription.stripe_subscription_id} (${subscription.statusFormatted})`);
    }
    
    // Créer les analyses
    console.log('\n📝 Création des analyses...');
    const createdAnalyses = {};
    
    for (const analysisData of FIXTURES.analyses) {
      const user = createdUsers[analysisData.user_email];
      if (!user) {
        console.log(`   ⚠️  Utilisateur ${analysisData.user_email} non trouvé, analyse ignorée`);
        continue;
      }
      
      console.log(`   📝 Création de l'analyse pour ${user.email}...`);
      
      const analysis = new Analysis({
        user_id: user.id,
        analyzed_at: new Date(),
        source_text: analysisData.source_text,
        duplicate_percent: analysisData.duplicate_percent
      });
      
      await analysis.save();
      createdAnalyses[analysisData.user_email] = analysis;
      
      console.log(`   ✅ Analyse ID: ${analysis.id} - ${analysis.plagiarismRisk} (${analysis.duplicatePercentFormatted})`);
    }
    
    // Créer les phrases
    console.log('\n🔤 Création des phrases...');
    for (const sentenceData of FIXTURES.sentences) {
      const analysis = createdAnalyses[sentenceData.analysis_user_email];
      if (!analysis) {
        console.log(`   ⚠️  Analyse pour ${sentenceData.analysis_user_email} non trouvée, phrase ignorée`);
        continue;
      }
      
      console.log(`   🔤 Création de la phrase pour l'analyse ${analysis.id}...`);
      
      const sentence = new Sentence({
        analysis_id: analysis.id,
        sentence_text: sentenceData.sentence_text,
        source_url: sentenceData.source_url,
        is_duplicate: sentenceData.is_duplicate
      });
      
      await sentence.save();
      
      console.log(`   ✅ Phrase: "${sentence.preview}" (${sentence.duplicateStatus})`);
    }

    // Créer les configurations de provider
    console.log('\n⚙️ Création des configurations de provider...');
    for (const providerData of FIXTURES.adminConfigProviders) {
      console.log(`   ⚙️ Création de la configuration pour ${providerData.provider_name}...`);
      let provider = await AdminConfigProvider.findOne({ where: { provider_name: providerData.provider_name } });
      if (provider) {
        console.log(`   ⚠️  Configuration existante, mise à jour...`);
        provider.api_url = providerData.api_url;
        provider.cost_per_request = providerData.cost_per_request;
        provider.is_used = providerData.is_used;
        await provider.save();
      } else {
        provider = new AdminConfigProvider(providerData);
        await provider.save();
      }
      console.log(`   ✅ Configuration ${provider.provider_name} créée/mise à jour.`);
    }
    
    // Afficher le résumé
    console.log('\n📊 Résumé de l\'initialisation:');
    console.log('═'.repeat(40));
    console.log(`👥 Utilisateurs créés: ${Object.keys(createdUsers).length}`);
    console.log(`💳 Abonnements créés: ${FIXTURES.subscriptions.length}`);
    console.log(`📝 Analyses créées: ${Object.keys(createdAnalyses).length}`);
    console.log(`🔤 Phrases créées: ${FIXTURES.sentences.length}`);
    console.log(`⚙️ Configurations de provider créées: ${FIXTURES.adminConfigProviders.length}`);
    
    console.log('\n🎉 Initialisation des fixtures terminée avec succès !');
    console.log('\n📋 Comptes de test disponibles:');
    console.log('   👑 Admin: yohanndurand76@gmail.com / devdev');
    console.log('   👤 Test: test@example.com / test123');
    console.log('   👤 Demo: demo@solotext.com / demo123');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des fixtures:', error.message);
    console.error('📋 Détails de l\'erreur:', error);
    process.exit(1);
  } finally {
    // Fermer la connexion à la base de données
    await sequelize.close();
    console.log('\n🔌 Connexion à la base de données fermée.');
  }
}

// Fonction pour afficher l'aide
function showHelp() {
  console.log('📖 Script de fixtures SoloText');
  console.log('');
  console.log('Ce script initialise la base de données avec des données de test');
  console.log('pour le développement et la démonstration de SoloText.');
  console.log('');
  console.log('Usage:');
  console.log('  node fixtures.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  --help    Afficher cette aide');
  console.log('');
  console.log('Exécution depuis la racine du projet:');
  console.log('  docker-compose exec backend node scripts/fixtures.js');
  console.log('');
  console.log('Données créées:');
  console.log('  👑 1 administrateur (yohanndurand76@gmail.com)');
  console.log('  👤 2 utilisateurs de test');
  console.log('  💳 2 abonnements Stripe');
  console.log('  📝 2 analyses de texte');
  console.log('  🔤 3 phrases analysées');
  console.log('  ⚙️ 1 configuration de provider');
  console.log('');
  console.log('Variables d\'environnement requises:');
  console.log('  DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD');
}

// Vérifier les arguments de ligne de commande
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Exécuter le script
createFixtures();
