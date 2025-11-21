#!/bin/bash
# Script de déploiement SoloText avec Ansible

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction d'aide
show_help() {
    echo "Usage: $0 [ENVIRONMENT] [OPTIONS]"
    echo ""
    echo "Environnements:"
    echo "  staging    Déployer sur l'environnement de staging"
    echo "  prod       Déployer sur l'environnement de production"
    echo ""
    echo "Options:"
    echo "  --tags TAGS     Déployer uniquement certains composants (ex: backend,frontend)"
    echo "  --check          Mode dry-run (ne fait rien, juste vérifie)"
    echo "  --vault          Demander le mot de passe vault"
    echo "  -h, --help       Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 staging"
    echo "  $0 prod --tags backend"
    echo "  $0 staging --check"
}

# Vérifier les arguments
if [ $# -eq 0 ]; then
    show_help
    exit 1
fi

ENVIRONMENT=""
TAGS=""
CHECK=""
VAULT=""
PLAYBOOK=""

# Parser les arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        staging|prod)
            ENVIRONMENT=$1
            if [ "$ENVIRONMENT" == "staging" ]; then
                PLAYBOOK="playbooks/deploy-staging.yml"
                INVENTORY="inventory/staging.ini"
            else
                PLAYBOOK="playbooks/deploy-prod.yml"
                INVENTORY="inventory/prod.ini"
            fi
            shift
            ;;
        --tags)
            TAGS="--tags $2"
            shift 2
            ;;
        --check)
            CHECK="--check"
            shift
            ;;
        --vault)
            VAULT="--ask-vault-pass"
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}Erreur: Option inconnue '$1'${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Vérifier que l'environnement est défini
if [ -z "$ENVIRONMENT" ]; then
    echo -e "${RED}Erreur: Vous devez spécifier un environnement (staging ou prod)${NC}"
    show_help
    exit 1
fi

# Vérifier qu'Ansible est installé
if ! command -v ansible-playbook &> /dev/null; then
    echo -e "${RED}Erreur: Ansible n'est pas installé${NC}"
    echo "Installez-le avec: sudo apt install python3-pip && pip3 install ansible"
    exit 1
fi

# Vérifier que les collections sont installées
if [ ! -d "$HOME/.ansible/collections/ansible_collections/community/docker" ]; then
    echo -e "${YELLOW}Installation des collections Ansible...${NC}"
    ansible-galaxy install -r requirements.yml
fi

# Afficher les informations de déploiement
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Déploiement SoloText${NC}"
echo -e "${GREEN}Environnement: ${ENVIRONMENT}${NC}"
if [ -n "$TAGS" ]; then
    echo -e "${GREEN}Tags: ${TAGS}${NC}"
fi
if [ -n "$CHECK" ]; then
    echo -e "${YELLOW}Mode: DRY-RUN (vérification uniquement)${NC}"
fi
echo -e "${GREEN}========================================${NC}"
echo ""

# Lancer le playbook
ansible-playbook \
    -i "$INVENTORY" \
    "$PLAYBOOK" \
    $TAGS \
    $CHECK \
    $VAULT

# Afficher le résultat
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Déploiement terminé avec succès !${NC}"
else
    echo ""
    echo -e "${RED}❌ Erreur lors du déploiement${NC}"
    exit 1
fi

