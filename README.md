# Solotext 

## Technologies

- NodeJS/ExpressJS 
- VueJS
- Artifical inteligence 
- Ansible
- PostgresSQL

## Infrastructure:

create .env from .env.example in 

- /Solotext/.env.example
- /Solotext/website/.env.example
- /Solotext/app/.env.example
- /Solotext/api/.env.example

Or add variable in Ansible vault for all infrastructure

**Staging infra:** 

ansible-galaxy install -r requirements.yml
cd infra && ./deploy.sh staging --vault

./deploy.sh staging --tags app --vault # deploy app only
./deploy.sh staging --tags website --vault # deploy website only
./deploy.sh staging --tags nginx --vault # deploy nginx only
./deploy.sh staging --tags backend --vault  # deploy api only

```
Internet
  ↓
Nginx (80/443) → SSL Let's Encrypt
  ├── staging.solotext.io → /var/www/website (static files)
  ├── app.staging.solotext.io → /var/www/app (static files)
  └── api.staging.solotext.io → localhost:3000 (proxy)
        ↓
    Docker Compose (/opt/solotext)
      ├── Backend (port 3000)
      ├── PostgreSQL (port 5432)
      ├── RabbitMQ (port 5672)
      └── Analysis Worker
```

**Prod infra:**

ansible-galaxy install -r requirements.yml
cd infra && ./deploy.sh production --vault

```
Internet
  ↓
Nginx (80/443) → SSL Let's Encrypt
  ├── solotext.io → /var/www/website (static files)
  ├── app.solotext.io → /var/www/app (static files)
  └── api.solotext.io → localhost:3000 (proxy)
        ↓
    Docker Compose (/opt/solotext)
      ├── Backend (port 3000)
      ├── PostgreSQL (port 5432)
      ├── RabbitMQ (port 5672)
      └── Analysis Worker
```

**Local/Dev infra:**

make dev-run
make dev-kill
make dev-logs
make dev-status

- API : http://localhost:3001 (ou http://51.178.80.14:3001 si sur serveur)
- App : http://localhost:8090 (ou http://51.178.80.14:8090 si sur serveur)
- Website : http://localhost:8091 (ou http://51.178.80.14:8091 si sur serveur)
- Adminer : http://localhost:8083
- RabbitMQ : http://localhost:15673

