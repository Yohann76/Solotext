# API SoloText - Backend

Une API REST simple construite avec Node.js et Express.

## 🚀 Démarrage rapide

### Prérequis
- Node.js (version 14 ou supérieure)
- npm

### Installation

1. Installer les dépendances :
```bash
npm install
```

2. Démarrer le serveur en mode développement :
```bash
npm run dev
```

3. Démarrer le serveur en mode production :
```bash
npm start
```

Le serveur sera disponible sur `http://localhost:3000`

## 📡 Endpoints disponibles

### Général
- `GET /` - Informations sur l'API
- `GET /api/health` - Statut de santé du serveur

### Utilisateurs
- `GET /api/users` - Récupérer tous les utilisateurs
- `GET /api/users/:id` - Récupérer un utilisateur par ID
- `POST /api/users` - Créer un nouvel utilisateur
- `PUT /api/users/:id` - Mettre à jour un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur

## 📝 Exemples d'utilisation

### Créer un utilisateur
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Nouvel Utilisateur", "email": "nouveau@example.com"}'
```

### Récupérer tous les utilisateurs
```bash
curl http://localhost:3000/api/users
```

### Mettre à jour un utilisateur
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Nom Modifié"}'
```

## 🛠️ Technologies utilisées

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **CORS** - Gestion des requêtes cross-origin
- **dotenv** - Gestion des variables d'environnement
- **nodemon** - Redémarrage automatique en développement

## 📁 Structure du projet

```
backend/
├── server.js          # Fichier principal du serveur
├── package.json       # Configuration npm
├── .env              # Variables d'environnement
├── .env.example      # Exemple de variables d'environnement
└── README.md         # Documentation
```
