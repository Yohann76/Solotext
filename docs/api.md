# API

## Routes de base

GET / - Page d'accueil de l'API
GET /api/health - Vérification de santé du serveur

##  Routes d'authentification (/api/auth/*)

POST /api/auth/login - Connexion utilisateur
POST /api/auth/register - Inscription utilisateur
GET /api/auth/me - ⚠️ PROTÉGÉE (nécessite token)
POST /api/auth/logout - ⚠️ PROTÉGÉE (nécessite token)
POST /api/auth/change-password - ⚠️ PROTÉGÉE (nécessite token)

## Routes PROTÉGÉES (Nécessitent un token JWT)

##  Gestion des utilisateurs

GET /api/users - ADMIN UNIQUEMENT - Liste tous les utilisateurs
GET /api/users/:id - Détails d'un utilisateur (authentifié - membre)
POST /api/users - ADMIN UNIQUEMENT - Créer un utilisateur
PUT /api/users/:id - Modifier un utilisateur (authentifié)
DELETE /api/users/:id - ADMIN UNIQUEMENT - Supprimer un utilisateur

##  Analyses de texte
GET /api/analyses - Liste des analyses (authentifié)
POST /api/analyses - Créer une analyse (authentifié)
GET /api/analyses/:id/sentences - Phrases d'une analyse (authentifié)
POST /api/analyses/:id/sentences - Ajouter une phrase (authentifié)

## Abonnements

GET /api/subscriptions - Liste des abonnements (authentifié)
POST /api/subscriptions - Créer un abonnement (authentifié)