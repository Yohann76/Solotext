# Database

## Schémas:

```
Users:
id (PK)
email
google_id (pour connexion via Google)
created_at
updated_at
role 
password


Subscriptions: (fonctionnement mois par mois, un user peut avoir plusieurs subscription, mais qu’un seul status=active)
id (PK)
user_id (FK vers Users.id) → permet de lier l’abonnement à un utilisateur
stripe_subscription_id → l’ID de l’abonnement Stripe
status → active / canceled / past_due / trialing (pour suivre le statut)
start_date → date de début de l’abonnement
current_period_start → début de la période de facturation en cours
current_period_end → fin de la période de facturation en cours
cancel_at_period_end → booléen, si l’abonnement est prévu pour se terminer
created_at
updated_at


Analyses:
id (PK)
user_id (FK -> Users.id)
analyzed_at (date et heure d’analyse)
source_text (texte complet analysé)
duplicate_percent (pourcentage de contenu dupliqué détecté)
pdf_report_path (chemin fichier PDF généré) (pas besoins car peut etre générer a la volé)
created_at
updated_at


Sentences:
id (PK)
analysis_id (FK -> Analyses.id)
sentence_text (texte de la phrase analysée)
source_url (liens de la source détectée pour cette phrase)
is_duplicate (booléen, true si cette phrase est détectée dupliquée)
created_at
updated_at
```

## Adminer connexion (dev): 

```
- DB_HOST=postgres
- DB_PORT=5432
- DB_NAME=solotext_db
- DB_USER=solotext_user
- DB_PASSWORD=solotext_password
```

## Sequelize migration (TODO: clean and clarify)

## Install and init

```
cd backend 
npm install --save-dev sequelize-cli
npx sequelize-cli init  (create migration folder)
```

## sequelize-cli usage

```
cd backend
npx sequelize-cli db:migrate (apply migration)
npx sequelize-cli db:seed:all (Generate seed/fixtures)
npx sequelize-cli db:migrate:undo (Back migration)

npx sequelize-cli migration:generate --name create-initial-tables (generate file)
npx sequelize-cli seed:generate --name initial-users (generate seed)
```

## Run in container

```
docker compose exec backend npm run db:undo:all (delete all table)
docker compose exec backend npm run db:migrate (apply all migration)
docker compose exec backend npm run db:seed:all (add fixtures)

docker compose exec backend npm run migration:generate (create new migration)
docker compose exec backend npm run seed:generate (create new seed/fixtures)
```

## run seed in dev-run

```
docker compose -f docker-compose.dev.yml exec backend npm run db:seed:all
```