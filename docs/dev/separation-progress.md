# Progression de la séparation Website / App

## ✅ Phase 1 : Préparation de la structure - TERMINÉE

### 1.1 Renommages effectués
- ✅ `backend/` → `api/`
- ✅ `frontend/` → `app/`
- ✅ `website/` créé

### 1.2 Website créé
- ✅ Structure Vue.js + Vite
- ✅ Routes : Home, Features, Pricing
- ✅ Composants copiés depuis app/
- ✅ Router configuré (seulement routes publiques)
- ✅ Assets et styles copiés

### 1.3 Docker Compose mis à jour
- ✅ Chemins mis à jour : `./backend` → `./api`
- ✅ Service `frontend` retiré
- ✅ Volumes nettoyés

## ✅ Phase 2 : Nettoyage de app/ - TERMINÉE

### Modifications effectuées
- ✅ Routes website retirées du router (Home, Features, Pricing)
- ✅ NavBar adaptée (liens website retirés)
- ✅ Fichiers website supprimés de app/
- ✅ AppFooter adapté (liens externes vers website)

### Routes finales dans app/
- `/` → redirige vers `/login`
- `/login` → Connexion
- `/register` → Inscription
- `/application` → Application (requiert auth)
- `/dashboard` → Dashboard Admin (requiert auth + admin)

## ✅ Phase 3 : Configuration Ansible - TERMINÉE

### Structure créée
- ✅ Rôle `api` : Déploiement API (docker-compose)
- ✅ Rôle `app` : Build et déploiement app frontend (statique)
- ✅ Rôle `website` : Build et déploiement website (statique)

### Variables restructurées
```
infra/inventory/group_vars/
├── staging/
│   ├── api.yml          # Variables pour l'API
│   ├── app.yml          # Variables pour l'app frontend
│   ├── website.yml      # Variables pour le website
│   └── vault.yml        # Secrets
├── staging.yml          # Variables communes
├── production/
│   ├── api.yml
│   ├── app.yml
│   ├── website.yml
│   └── vault.yml
└── production.yml       # Variables communes
```

### Playbooks mis à jour
- ✅ `deploy-staging.yml` : Charge toutes les variables et utilise les 3 rôles
- ✅ `deploy-prod.yml` : Charge toutes les variables et utilise les 3 rôles

## 🔄 Phase 4 : Configuration Nginx - EN COURS

### À configurer
- [ ] Configuration pour `staging.solotext.io` → `/var/www/website/`
- [ ] Configuration pour `app.staging.solotext.io` → `/var/www/app/`
- [ ] Configuration pour `api.staging.solotext.io` → `proxy_pass http://localhost:3000`
- [ ] Même chose pour production
- [ ] SSL avec Certbot pour chaque domaine

## 📋 Phase 5 : Migration et tests - À FAIRE

### À faire
- [ ] Tester le website localement
- [ ] Tester l'app localement
- [ ] Tester l'API
- [ ] Déployer sur staging
- [ ] Tester sur staging
- [ ] Déployer en production

## Structure actuelle

```
Solotext/
├── api/              # Backend (ex-backend)
├── app/              # Frontend application (ex-frontend)
├── website/          # Website statique (nouveau)
├── docker-compose.yml # API seulement
└── infra/            # Ansible
    ├── roles/
    │   ├── common/
    │   ├── api/      # Déploiement API
    │   ├── app/      # Build app frontend
    │   ├── website/  # Build website
    │   └── nginx_proxy/
    └── inventory/group_vars/
        ├── staging/
        │   ├── api.yml
        │   ├── app.yml
        │   ├── website.yml
        │   └── vault.yml
        └── production/
            ├── api.yml
            ├── app.yml
            ├── website.yml
            └── vault.yml
```
