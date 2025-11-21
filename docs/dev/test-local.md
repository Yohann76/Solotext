# Guide de test local - Website / App / API

## Architecture locale

Pour tester localement, vous avez besoin de :
- **API** : Docker Compose (postgres, backend, rabbitmq, worker) → Port 3000
- **Website** : Vite dev server → Port 8081
- **App** : Vite dev server → Port 8080

## Méthode rapide : Script automatique

```bash
cd /home/ubuntu/Solotext
./scripts/test-local.sh
```

Ce script :
- ✅ Démarre Docker Compose (API)
- ✅ Attend que l'API soit prête
- ✅ Démarre le website (port 8081)
- ✅ Démarre l'app (port 8080)
- ✅ Affiche toutes les URLs

**Arrêter** : Appuyez sur `Ctrl+C`

## Méthode manuelle : Étape par étape

### 1. Démarrer l'API

```bash
cd /home/ubuntu/Solotext

# Créer les fichiers .env si nécessaire
# (voir section Configuration ci-dessous)

# Démarrer les services
docker compose up -d

# Vérifier que l'API fonctionne
curl http://localhost:3000/api/health
```

### 2. Démarrer le Website

```bash
cd /home/ubuntu/Solotext/website

# Installer les dépendances (première fois)
npm install

# Démarrer le serveur de développement
npm run dev
```

Le website sera accessible sur : **http://localhost:8081**

### 3. Démarrer l'App

```bash
cd /home/ubuntu/Solotext/app

# Installer les dépendances (première fois)
npm install

# Démarrer le serveur de développement
npm run dev
```

L'app sera accessible sur : **http://localhost:8080**

## Configuration des fichiers .env

### ✅ Fichiers .env existants

Les fichiers `.env` sont déjà présents :
- `/.env` (racine du projet) - pour Docker Compose
- `/api/.env` - pour l'API backend

### Vérifier le contenu

Vérifiez que ces fichiers contiennent les bonnes valeurs pour le développement local :

**`/.env`** doit contenir :
```bash
NODE_ENV=development
DB_HOST=postgres
DB_PORT=5432
DB_NAME=solotext_db
DB_USER=solotext_user
DB_PASSWORD=solotext_password
RABBITMQ_DEFAULT_USER=admin
RABBITMQ_DEFAULT_PASS=admin123
RABBITMQ_DEFAULT_VHOST=/
RABBITMQ_URL=amqp://admin:admin123@rabbitmq:5672
JWT_SECRET=local-jwt-secret-key-change-me
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PERPLEXITY_API_KEY=your-perplexity-key
FRONTEND_URL=http://localhost:8080
WEBSITE_URL=http://localhost:8081
```

**`/api/.env`** doit contenir :
```bash
NODE_ENV=development
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_NAME=solotext_db
DB_USER=solotext_user
DB_PASSWORD=solotext_password
RABBITMQ_URL=amqp://admin:admin123@rabbitmq:5672
ANALYSIS_QUEUE=analysis_queue
JWT_SECRET=local-jwt-secret-key-change-me
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PERPLEXITY_API_KEY=your-perplexity-key
FRONTEND_URL=http://localhost:8080
WEBSITE_URL=http://localhost:8081
```

### ⚠️ Important pour le développement local

Assurez-vous que :
- `FRONTEND_URL=http://localhost:8080` (pour l'app)
- `WEBSITE_URL=http://localhost:8081` (pour le website)
- Les valeurs de test sont utilisées (pas les valeurs de production)

## URLs locales

| Service | URL | Port | Description |
|---------|-----|------|-------------|
| **Website** | http://localhost:8081 | 8081 | Site marketing |
| **App** | http://localhost:8080 | 8080 | Application SaaS |
| **API** | http://localhost:3000 | 3000 | Backend API |
| **API Health** | http://localhost:3000/api/health | 3000 | Health check |
| **PostgreSQL** | localhost:5432 | 5432 | Base de données |
| **RabbitMQ** | http://localhost:15672 | 15672 | Management UI (admin/admin123) |
| **Adminer** | http://localhost:8082 | 8082 | Interface DB (si activé) |

## Vérifications

### 1. Vérifier l'API

```bash
# Health check
curl http://localhost:3000/api/health

# Devrait retourner : {"status":"ok"} ou similaire
```

### 2. Vérifier le Website

- Ouvrir http://localhost:8081
- ✅ Page d'accueil s'affiche
- ✅ Navigation fonctionne
- ✅ Routes `/fonctionnalites` et `/tarifs` fonctionnent

### 3. Vérifier l'App

- Ouvrir http://localhost:8080
- ✅ Redirection vers `/login` si non connecté
- ✅ Page de connexion s'affiche
- ✅ Console navigateur (F12) : pas d'erreurs

### 4. Tester la connexion

1. Aller sur http://localhost:8080
2. Se connecter avec un compte de test
3. Vérifier que l'application s'affiche
4. Vérifier la console (F12) : les appels API fonctionnent

## Configuration de l'API dans l'app

L'app utilise un proxy Vite configuré dans `app/vite.config.js` :

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true
  }
}
```

Donc les appels à `/api/*` sont automatiquement redirigés vers `http://localhost:3000/api/*`.

## Arrêter les services

### Avec le script

Appuyez sur `Ctrl+C` dans le terminal où le script tourne.

### Manuellement

```bash
# Arrêter Docker Compose
cd /home/ubuntu/Solotext
docker compose down

# Arrêter les serveurs Vite (Ctrl+C dans les terminaux)
# Ou tuer les processus
pkill -f "vite"
```

## Problèmes courants

### Port déjà utilisé

```bash
# Vérifier les ports utilisés
sudo lsof -i :3000
sudo lsof -i :8080
sudo lsof -i :8081

# Tuer un processus sur un port
sudo kill -9 $(sudo lsof -t -i:3000)
```

### Erreurs de dépendances

```bash
# Réinstaller les dépendances
cd website && rm -rf node_modules package-lock.json && npm install
cd ../app && rm -rf node_modules package-lock.json && npm install
```

### Docker Compose ne démarre pas

```bash
# Vérifier les logs
docker compose logs

# Redémarrer
docker compose down
docker compose up -d
```

### L'app ne peut pas appeler l'API

1. Vérifier que l'API fonctionne : `curl http://localhost:3000/api/health`
2. Vérifier la console du navigateur (F12) pour les erreurs
3. Vérifier que le proxy Vite est configuré dans `app/vite.config.js`

## Tests d'intégration

### Test complet

1. **Website** : http://localhost:8081
   - ✅ Page d'accueil
   - ✅ Navigation
   - ✅ Routes publiques

2. **App** : http://localhost:8080
   - ✅ Redirection vers login
   - ✅ Connexion
   - ✅ Application
   - ✅ Appels API fonctionnent

3. **API** : http://localhost:3000
   - ✅ Health check OK
   - ✅ Connexion fonctionne
   - ✅ Endpoints accessibles

## Prochaines étapes

Une fois que tout fonctionne localement :
1. ✅ Tester le website
2. ✅ Tester l'app
3. ✅ Tester l'API
4. ✅ Tester l'intégration complète
5. → Déployer sur staging
6. → Configurer les DNS
7. → Tester sur staging
8. → Déployer en production
