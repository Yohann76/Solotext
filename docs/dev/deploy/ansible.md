# Deploy

## 📋 Prérequis

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
## Gestion des variables 

Éditez les fichiers de variables selon votre environnement :

- **`group_vars/staging.yml`** : Variables pour le staging
- **`group_vars/production.yml`** : Variables pour la production

**Variable dans le vault:**

```
ansible-vault edit infra/inventory/group_vars/production/vault.yml
ansible-vault view infra/inventory/group_vars/production/vault.yml

ansible-vault edit infra/inventory/group_vars/staging/vault.yml
ansible-vault view infra/inventory/group_vars/staging/vault.yml
```

## 🚀 Déploiement

### Méthode rapide (avec script)

```bash
cd infra

# Déployer sur staging
./deploy.sh staging --vault

# Déployer sur production
./deploy.sh prod --vault

# Déployer uniquement le backend
./deploy.sh prod --vault --tags backend

# Mode dry-run (vérification uniquement)
./deploy.sh staging --vault --check
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
## 🔍 Vérification

Après le déploiement, vérifiez que tout fonctionne :

```bash
# Vérifier les conteneurs Docker
ssh ubuntu@51.38.178.137 "docker ps"

# Vérifier la santé de l'API
curl http://51.38.178.137:3000/api/health

### Mettre à jour le code
Pour mettre à jour uniquement le code sans reconstruire les images :

```bash
ansible-playbook -i inventory/prod.ini playbooks/deploy-prod.yml \
  --tags backend,frontend \
  -e "rebuild_images=false"
```

### Other information 

### Firewall

Le rôle `common` configure automatiquement UFW avec les ports nécessaires :
- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS)