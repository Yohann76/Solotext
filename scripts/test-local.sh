#!/bin/bash

# Script pour démarrer tous les services localement

# Ne pas arrêter le script en cas d'erreur (pour l'installation de Node.js)
set +e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_DIR="/home/ubuntu/Solotext"
API_URL="http://localhost:3000/api/health"
WEBSITE_URL="http://localhost:8081"
APP_URL="http://localhost:8080"

echo -e "${BLUE}🚀 Démarrage des services locaux...${NC}"
echo ""

# Fonction pour nettoyer à la sortie
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Arrêt des services...${NC}"
    cd "$PROJECT_DIR"
    docker compose down 2>/dev/null || true
    [ ! -z "$WEBSITE_PID" ] && kill $WEBSITE_PID 2>/dev/null || true
    [ ! -z "$APP_PID" ] && kill $APP_PID 2>/dev/null || true
    pkill -f "vite.*8081" 2>/dev/null || true
    pkill -f "vite.*8080" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    echo -e "${GREEN}✅ Services arrêtés${NC}"
    exit 0
}

trap cleanup INT TERM EXIT

# 1. Démarrer l'API avec Docker Compose
echo -e "${BLUE}📦 Démarrage de l'API...${NC}"
cd "$PROJECT_DIR"

# Vérifier si .env existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Fichier .env manquant, création d'un exemple...${NC}"
    echo -e "${YELLOW}   ⚠️  Vous devrez remplir les valeurs réelles !${NC}"
    cat > .env << EOF
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
EOF
else
    echo -e "${GREEN}✅ Fichier .env trouvé${NC}"
fi

if [ ! -f api/.env ]; then
    echo -e "${YELLOW}⚠️  Fichier api/.env manquant, création d'un exemple...${NC}"
    echo -e "${YELLOW}   ⚠️  Vous devrez remplir les valeurs réelles !${NC}"
    cat > api/.env << EOF
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
EOF
else
    echo -e "${GREEN}✅ Fichier api/.env trouvé${NC}"
fi

docker compose up -d

# Attendre que l'API soit prête
echo -e "${YELLOW}⏳ Attente de l'API...${NC}"
MAX_RETRIES=30
RETRY=0
while [ $RETRY -lt $MAX_RETRIES ]; do
    if curl -f "$API_URL" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API prête !${NC}"
        break
    fi
    RETRY=$((RETRY + 1))
    echo "   Tentative $RETRY/$MAX_RETRIES..."
    sleep 2
done

if [ $RETRY -eq $MAX_RETRIES ]; then
    echo -e "${YELLOW}⚠️  L'API n'est pas encore prête, mais on continue...${NC}"
fi

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js/npm n'est pas installé${NC}"
    echo -e "${YELLOW}   Veuillez installer Node.js manuellement :${NC}"
    echo -e "${YELLOW}   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -${NC}"
    echo -e "${YELLOW}   sudo apt-get install -y nodejs${NC}"
    echo ""
    echo -e "${YELLOW}   Ou utilisez nvm :${NC}"
    echo -e "${YELLOW}   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash${NC}"
    echo -e "${YELLOW}   nvm install 20${NC}"
    echo ""
    echo -e "${YELLOW}   Le script continuera avec l'API seulement...${NC}"
    echo ""
    # Continuer sans Node.js (seulement l'API)
    set -e
    echo -e "${GREEN}✅ API disponible sur http://localhost:3000${NC}"
    echo -e "${YELLOW}⚠️  Website et App nécessitent Node.js${NC}"
    echo ""
    echo -e "${YELLOW}Appuyez sur Ctrl+C pour arrêter l'API${NC}"
    wait
    exit 0
fi

set -e
echo -e "${GREEN}✅ Node.js $(node --version) et npm $(npm --version) installés${NC}"

# Nettoyer les processus existants
echo -e "${YELLOW}🧹 Nettoyage des processus existants...${NC}"
pkill -f "vite.*8081" 2>/dev/null || true
pkill -f "vite.*8080" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
sleep 1

# Vérifier et libérer les ports (plus agressif)
if lsof -ti:8081 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 8081 déjà utilisé, libération...${NC}"
    lsof -ti:8081 | xargs kill -9 2>/dev/null || true
    sleep 2
    # Vérifier à nouveau
    if lsof -ti:8081 > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port 8081 toujours occupé, tentative supplémentaire...${NC}"
        fuser -k 8081/tcp 2>/dev/null || true
        sleep 2
    fi
fi

if lsof -ti:8080 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 8080 déjà utilisé, libération...${NC}"
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true
    sleep 2
    # Vérifier à nouveau
    if lsof -ti:8080 > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port 8080 toujours occupé, tentative supplémentaire...${NC}"
        fuser -k 8080/tcp 2>/dev/null || true
        sleep 2
    fi
fi

# 2. Démarrer le website
echo -e "${BLUE}🌐 Démarrage du website...${NC}"
cd "$PROJECT_DIR/website"

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installation des dépendances du website...${NC}"
    npm install
fi

# Corriger les permissions des binaires
chmod +x node_modules/.bin/* 2>/dev/null || true

npm run dev > /tmp/website.log 2>&1 &
WEBSITE_PID=$!
sleep 2
if ps -p $WEBSITE_PID > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Website démarré (PID: $WEBSITE_PID)${NC}"
else
    echo -e "${YELLOW}⚠️  Erreur au démarrage du website, vérifiez /tmp/website.log${NC}"
    tail -20 /tmp/website.log
fi

# 3. Démarrer l'app
echo -e "${BLUE}📱 Démarrage de l'app...${NC}"
cd "$PROJECT_DIR/app"

# Vérifier si node_modules existe ou si rollup est manquant
if [ ! -d "node_modules" ] || [ ! -d "node_modules/@rollup" ]; then
    echo -e "${YELLOW}📦 Installation des dépendances de l'app...${NC}"
    if [ -d "node_modules" ]; then
        echo -e "${YELLOW}   Nettoyage des node_modules existants...${NC}"
        rm -rf node_modules package-lock.json
    fi
    npm install
fi

# Corriger les permissions des binaires
chmod +x node_modules/.bin/* 2>/dev/null || true

npm run dev > /tmp/app.log 2>&1 &
APP_PID=$!
sleep 2
if ps -p $APP_PID > /dev/null 2>&1; then
    echo -e "${GREEN}✅ App démarrée (PID: $APP_PID)${NC}"
else
    echo -e "${YELLOW}⚠️  Erreur au démarrage de l'app, vérifiez /tmp/app.log${NC}"
    tail -20 /tmp/app.log
fi

# Attendre un peu pour que les serveurs démarrent
sleep 3

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Tous les services sont démarrés !${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}🌐 Website : ${WEBSITE_URL}${NC}"
echo -e "${BLUE}📱 App     : ${APP_URL}${NC}"
echo -e "${BLUE}🔌 API     : http://localhost:3000${NC}"
echo -e "${BLUE}🗄️  Adminer : http://localhost:8082${NC}"
echo -e "${BLUE}🐰 RabbitMQ: http://localhost:15672 (admin/admin123)${NC}"
echo ""
echo -e "${YELLOW}📋 Logs :${NC}"
echo -e "   Website: tail -f /tmp/website.log"
echo -e "   App:     tail -f /tmp/app.log"
echo -e "   API:     docker compose logs -f"
echo ""
echo -e "${YELLOW}Appuyez sur Ctrl+C pour arrêter tous les services${NC}"
echo ""

# Attendre indéfiniment
wait

