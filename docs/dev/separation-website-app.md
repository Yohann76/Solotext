# Plan de séparation Website / Application

## Objectif
Séparer le site web marketing (landing page + blog) de l'application SaaS (avec DB, authentification).

GOOD

## Architecture cible

### Staging (51.178.80.14, branche `develop`)
- `staging.solotext.io` → Website (landing + blog, pas de DB)
- `app.staging.solotext.io` → Application Vue.js (avec DB, login, dashboard)
- `api.staging.solotext.io` → API Backend (Node.js + PostgreSQL)

### Production (51.38.178.137, branche `main`)
- `solotext.io` → Website (landing + blog, pas de DB)
- `app.solotext.io` → Application Vue.js (avec DB, login, dashboard)
- `api.solotext.io` → API Backend (Node.js + PostgreSQL)

## Étapes de mise en œuvre

### Phase 1 : Préparation de la structure

#### 1.1 Créer deux projets frontend distincts
- [ ] **Website** : Nouveau projet Nuxt.js ou Vue.js statique
  - Landing page (Home, Features, Pricing)
  - Blog (avec Nuxt Content ou API)
  - Pas de dépendance à la DB
  - Déployable en statique (Netlify/Vercel ou Nginx statique)
  
- [ ] **App** : Extraire l'application actuelle
  - Routes : `/login`, `/register`, `/application`, `/dashboard`
  - Dépend de l'API backend
  - Garde la structure Vue.js actuelle

#### 1.2 Réorganiser le dépôt Git
```
Solotext/
├── website/          # Nouveau projet (Nuxt.js ou Vue statique)
├── app/              # Frontend application (actuel frontend/)
├── api/              # Backend (actuel backend/)
└── docker-compose.yml
```

### Phase 2 : Configuration Docker Compose

#### 2.1 Créer deux docker-compose distincts
- [ ] `docker-compose.api.yml` : Backend + DB + Worker (sans frontend)
- [ ] `docker-compose.app.yml` : Frontend app uniquement (optionnel, peut être statique)
- [ ] `docker-compose.website.yml` : Website statique (optionnel)

#### 2.2 Ou garder un seul docker-compose avec services séparés
- [ ] Service `api` : Backend + DB + Worker
- [ ] Service `app-frontend` : Application Vue.js
- [ ] Service `website` : Website statique (ou service Nuxt)

### Phase 3 : Configuration Ansible

#### 3.1 Restructurer les variables
```
infra/inventory/group_vars/
├── staging/
│   ├── api.yml          # Variables pour l'API
│   ├── app.yml          # Variables pour l'app frontend
│   ├── website.yml      # Variables pour le website
│   └── vault.yml        # Secrets
└── production/
    ├── api.yml
    ├── app.yml
    ├── website.yml
    └── vault.yml
```

#### 3.2 Créer des rôles Ansible séparés
- [ ] `roles/api` : Déploiement API (backend + DB + worker)
- [ ] `roles/app` : Déploiement application frontend
- [ ] `roles/website` : Déploiement website statique
- [ ] `roles/nginx_proxy` : Configuration reverse proxy pour les 3 domaines

#### 3.3 Créer des playbooks séparés ou un playbook avec tags
- [ ] `playbooks/deploy-staging.yml` : Déploie tout avec tags
- [ ] `playbooks/deploy-prod.yml` : Déploie tout avec tags
- [ ] Ou playbooks séparés : `deploy-api.yml`, `deploy-app.yml`, `deploy-website.yml`

### Phase 4 : Configuration Nginx

#### 4.1 Configuration reverse proxy
- [ ] `staging.solotext.io` → Website (statique ou Nuxt)
- [ ] `app.staging.solotext.io` → App frontend (Vue.js)
- [ ] `api.staging.solotext.io` → API backend (Node.js:3000)
- [ ] Même chose pour production

#### 4.2 Configuration SSL avec Certbot
- [ ] Certificats SSL pour chaque sous-domaine
- [ ] Renouvellement automatique

### Phase 5 : Migration du code

#### 5.1 Extraire le website du frontend actuel
- [ ] Créer nouveau projet `website/`
- [ ] Migrer les routes publiques : `/`, `/fonctionnalites`, `/tarifs`
- [ ] Migrer les composants : `Home.vue`, `Features.vue`, `Pricing.vue`
- [ ] Configurer le blog (Nuxt Content ou API)

#### 5.2 Nettoyer l'application frontend
- [ ] Garder uniquement : `/login`, `/register`, `/application`, `/dashboard`
- [ ] Supprimer les routes publiques
- [ ] Adapter les appels API pour utiliser `api.solotext.io`

### Phase 6 : Configuration CORS et API

#### 6.1 Configurer CORS dans le backend
- [ ] Autoriser `app.solotext.io` et `app.staging.solotext.io`
- [ ] Autoriser `solotext.io` et `staging.solotext.io` (pour le blog si API)

#### 6.2 Adapter les URLs dans les frontends
- [ ] Website : API URL = `https://api.solotext.io` (si blog utilise API)
- [ ] App : API URL = `https://api.solotext.io`

### Phase 7 : DNS et déploiement

#### 7.1 Configuration DNS
- [ ] Staging :
  - `staging.solotext.io` → A record → 51.178.80.14
  - `app.staging.solotext.io` → A record → 51.178.80.14
  - `api.staging.solotext.io` → A record → 51.178.80.14
- [ ] Production :
  - `solotext.io` → A record → 51.38.178.137
  - `app.solotext.io` → A record → 51.38.178.137
  - `api.solotext.io` → A record → 51.38.178.137

#### 7.2 Déploiement
- [ ] Tester sur staging
- [ ] Déployer en production

## Structure des fichiers Ansible proposée

```
infra/
├── inventory/
│   ├── staging.ini
│   ├── prod.ini
│   └── group_vars/
│       ├── staging/
│       │   ├── api.yml
│       │   ├── app.yml
│       │   ├── website.yml
│       │   └── vault.yml
│       └── production/
│           ├── api.yml
│           ├── app.yml
│           ├── website.yml
│           └── vault.yml
├── roles/
│   ├── common/
│   ├── api/          # Backend + DB + Worker
│   ├── app/          # Frontend application
│   ├── website/      # Website statique
│   └── nginx_proxy/  # Reverse proxy pour les 3 domaines
└── playbooks/
    ├── deploy-staging.yml
    └── deploy-prod.yml
```

## Questions répondu

1. **Website** : Vue.js statique ?
2. **Blog** : Nuxt Content (markdown)
3. **Déploiement website** : Nginx statique
4. **Docker Compose** : un docker-compose + profil

## Ordre d'exécution recommandé

1. ✅ Separate API / Website / App 
2. Configurer Ansible avec les nouveaux rôles
3. Configurer Nginx pour les 3 domaines
4. Zone DNS solotext.io
5. Tester sur staging
6. Déployer en production

