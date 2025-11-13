# Infrastructure as Code - SoloText

Ce répertoire contient la configuration Ansible pour le déploiement automatisé de SoloText sur les environnements de staging et de production.

## 📋 Prérequis

### Sur le serveur de staging (machine de déploiement)

1. **Installer Ansible** :
```bash
sudo apt update
sudo apt install -y python3-pip
pip3 install ansible / sudo apt install ansible
```

2. **Installer les collections Ansible nécessaires** :
```bash
cd infra
ansible-galaxy install -r requirements.yml
```

3. **Installer Docker sur les serveurs cibles** :
Les playbooks installeront Docker automatiquement, mais vous pouvez aussi l'installer manuellement :
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```



### 2. Configurer les variables

Éditez les fichiers de variables selon votre environnement :

- **`group_vars/staging.yml`** : Variables pour le staging
- **`group_vars/production.yml`** : Variables pour la production

**Variables importantes à configurer** :
- `git_repo` : URL du dépôt Git
- `nginx_domain` : Domaine pour le frontend
- `db_password` : Mot de passe PostgreSQL
- `jwt_secret` : Secret JWT
- `stripe_secret_key`, `stripe_public_key`, `stripe_webhook_secret` : Clés Stripe
- `perplexity_api_key` : Clé API Perplexity

### 3. Sécuriser les secrets avec Ansible Vault

Pour chiffrer les secrets sensibles :

```bash
# Créer un fichier vault pour le staging
ansible-vault create group_vars/staging/vault.yml

# Créer un fichier vault pour la production
ansible-vault create group_vars/production/vault.yml
```

Dans ces fichiers, placez les secrets :
```yaml
---
db_password: "votre_mot_de_passe"
jwt_secret: "votre_secret_jwt"
stripe_secret_key: "sk_live_..."
perplexity_api_key: "pplx-..."
```

Puis référencez-les dans `staging.yml` et `production.yml` :
```yaml
db_password: "{{ vault_db_password }}"
```


### Méthode manuelle

**Déploiement sur Staging** :
```bash
cd infra
ansible-playbook -i inventory/staging.ini playbooks/deploy-staging.yml
```

**Déploiement sur Production** :
```bash
cd infra
ansible-playbook -i inventory/prod.ini playbooks/deploy-prod.yml
```

Le playbook de production demandera une confirmation avant de déployer.

### Déploiement partiel

Vous pouvez déployer uniquement certains composants avec les tags :

```bash
# Déployer uniquement le backend
ansible-playbook -i inventory/prod.ini playbooks/deploy-prod.yml --tags backend

# Déployer uniquement le frontend
ansible-playbook -i inventory/prod.ini playbooks/deploy-prod.yml --tags frontend

# Déployer uniquement la base de données
ansible-playbook -i inventory/prod.ini playbooks/deploy-prod.yml --tags database

# Déployer uniquement Nginx
ansible-playbook -i inventory/prod.ini playbooks/deploy-prod.yml --tags nginx
```


### Déploiement avec variables

Vous pouvez surcharger des variables en ligne de commande :

```bash
ansible-playbook -i inventory/prod.ini playbooks/deploy-prod.yml \
  -e "git_version=v1.2.3" \
  -e "deploy_frontend=false"
```

## 📁 Structure

```
infra/
├── ansible.cfg              # Configuration Ansible
├── inventory/               # Inventaires des serveurs
│   ├── staging.ini
│   └── prod.ini
├── group_vars/              # Variables par environnement
│   ├── staging.yml
│   └── production.yml
├── roles/                   # Rôles Ansible
│   ├── common/              # Configuration système de base
│   ├── database/            # PostgreSQL avec Docker
│   ├── backend/             # Backend Node.js avec Docker
│   ├── frontend/            # Frontend Vue.js + Nginx
│   └── nginx_proxy/         # Reverse proxy et SSL
└── playbooks/               # Playbooks de déploiement
    ├── deploy-staging.yml
    └── deploy-prod.yml
```

## 🔐 Sécurité

### Accès SSH

Assurez-vous que l'accès SSH est configuré avec des clés :

```bash
# Sur votre machine de staging
ssh-copy-id ubuntu@PRODUCTION_IP
```

### Firewall

Le rôle `common` configure automatiquement UFW avec les ports nécessaires :
- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS)

## 🔍 Vérification

Après le déploiement, vérifiez que tout fonctionne :

```bash
# Vérifier les conteneurs Docker
ssh ubuntu@PRODUCTION_IP "docker ps"

# Vérifier les logs du backend
ssh ubuntu@PRODUCTION_IP "docker logs solotext-backend"

# Vérifier la santé de l'API
curl http://PRODUCTION_IP:3000/api/health

# Vérifier le frontend
curl https://votre-domaine.com
```

## 🛠️ Maintenance

### Mettre à jour le code

Pour mettre à jour uniquement le code sans reconstruire les images :

```bash
ansible-playbook -i inventory/prod.ini playbooks/deploy-prod.yml \
  --tags backend,frontend \
  -e "rebuild_images=false"
```

### Sauvegardes

Les sauvegardes PostgreSQL sont automatiques en production (configuré dans `production.yml`).

Pour restaurer une sauvegarde :

```bash
ssh ubuntu@PRODUCTION_IP
docker exec -i solotext-postgres psql -U solotext_user solotext_db < /opt/backups/postgres/backup-XXXXX.sql
```

### Logs

Les logs sont disponibles via Docker :

```bash
# Logs du backend
docker logs -f solotext-backend

# Logs du worker
docker logs -f solotext-analysis-worker

# Logs PostgreSQL
docker logs -f solotext-postgres

# Logs Nginx
tail -f /var/log/nginx/solotext-access.log
tail -f /var/log/nginx/solotext-error.log
```

## 🐛 Dépannage

### Erreur de connexion SSH

Vérifiez que :
- La clé SSH est bien copiée sur le serveur cible
- Le port 22 est ouvert dans le firewall
- L'utilisateur `ubuntu` existe sur le serveur

### Erreur Docker

Vérifiez que Docker est installé et que l'utilisateur est dans le groupe `docker` :

```bash
sudo usermod -aG docker ubuntu
newgrp docker
```

### Erreur de certificat SSL

Si Let's Encrypt échoue :
- Vérifiez que le domaine pointe vers l'IP du serveur
- Vérifiez que le port 80 est accessible depuis l'extérieur
- Vérifiez les logs : `sudo tail -f /var/log/letsencrypt/letsencrypt.log`

## 📚 Ressources

- [Documentation Ansible](https://docs.ansible.com/)
- [Ansible Best Practices](https://docs.ansible.com/ansible/latest/user_guide/playbooks_best_practices.html)
- [Docker Compose avec Ansible](https://docs.ansible.com/ansible/latest/collections/community/docker/docker_compose_module.html)


## Manage vault:

Chiffrer un vault existant 

ansible-vault encrypt infra/group_vars/production/vault.yml

```
vault_jwt_secret: "REMPLACEZ-MOI"
vault_stripe_secret_key: "REMPLACEZ-MOI"
vault_stripe_public_key: "REMPLACEZ-MOI"
vault_stripe_webhook_secret: "REMPLACEZ-MOI"
vault_perplexity_api_key: "REMPLACEZ-MOI"
```

ansible-vault edit infra/inventory/group_vars/production/vault.yml
ansible-vault view infra/inventory/group_vars/production/vault.yml

ansible-vault edit infra/inventory/group_vars/staging/vault.yml
ansible-vault view infra/inventory/group_vars/staging/vault.yml

/home/ubuntu/Solotext/