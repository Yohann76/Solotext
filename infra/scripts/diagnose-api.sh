#!/bin/bash
# Script de diagnostic pour l'API

echo "🔍 Diagnostic de l'API"
echo "====================="
echo ""

cd /opt/solotext || exit 1

echo "📦 État des conteneurs Docker :"
echo "--------------------------------"
sudo -u solotext docker compose ps 2>&1 || docker compose ps 2>&1

echo ""
echo "📋 Logs du backend (dernières 30 lignes) :"
echo "------------------------------------------"
sudo -u solotext docker compose logs backend --tail=30 2>&1 || docker compose logs backend --tail=30 2>&1 || echo "❌ Impossible de récupérer les logs"

echo ""
echo "🔌 Vérification du port 3000 :"
echo "------------------------------"
if netstat -tlnp 2>/dev/null | grep -q ":3000" || ss -tlnp 2>/dev/null | grep -q ":3000"; then
    echo "✅ Le port 3000 est en écoute"
    netstat -tlnp 2>/dev/null | grep ":3000" || ss -tlnp 2>/dev/null | grep ":3000"
else
    echo "❌ Le port 3000 n'est PAS en écoute"
fi

echo ""
echo "🌐 Test de connexion à l'API :"
echo "------------------------------"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health | grep -q "200"; then
    echo "✅ L'API répond correctement"
    curl -s http://localhost:3000/api/health
else
    echo "❌ L'API ne répond pas"
    curl -v http://localhost:3000/api/health 2>&1 | head -20
fi

echo ""
echo "📁 Vérification des fichiers .env :"
echo "-------------------------------------"
if [ -f "/opt/solotext/.env" ]; then
    echo "✅ /.env existe"
    echo "   Propriétaire : $(stat -c '%U:%G' /opt/solotext/.env 2>/dev/null || echo 'inconnu')"
    echo "   Permissions : $(stat -c '%a' /opt/solotext/.env 2>/dev/null || echo 'inconnu')"
    echo "   Variables importantes :"
    sudo -u solotext grep -E "^(DB_|JWT_|STRIPE_|PERPLEXITY_)" /opt/solotext/.env 2>/dev/null | sed 's/=.*/=***/' || echo "   (permission refusée ou aucune variable sensible trouvée)"
else
    echo "❌ /.env n'existe pas"
fi

if [ -f "/opt/solotext/api/.env" ]; then
    echo "✅ /api/.env existe"
    echo "   Propriétaire : $(stat -c '%U:%G' /opt/solotext/api/.env 2>/dev/null || echo 'inconnu')"
    echo "   Permissions : $(stat -c '%a' /opt/solotext/api/.env 2>/dev/null || echo 'inconnu')"
    echo "   Variables importantes :"
    sudo -u solotext grep -E "^(DB_|JWT_|STRIPE_|PERPLEXITY_)" /opt/solotext/api/.env 2>/dev/null | sed 's/=.*/=***/' || echo "   (permission refusée ou aucune variable sensible trouvée)"
else
    echo "❌ /api/.env n'existe pas"
fi

echo ""
echo "🔧 Tentative de démarrage des conteneurs :"
echo "-------------------------------------------"
echo "Pour démarrer les conteneurs, exécutez :"
echo "  sudo -u solotext bash -c 'cd /opt/solotext && docker compose up -d'"

echo ""
echo "✅ Diagnostic terminé"

