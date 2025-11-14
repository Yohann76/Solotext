#!/bin/bash
# Script de diagnostic complet pour le 502 Bad Gateway

echo "🔍 Diagnostic complet du 502 Bad Gateway"
echo "=========================================="
echo ""

cd /opt/solotext || exit 1

echo "1️⃣ ÉTAT DES CONTENEURS :"
echo "------------------------"
sudo -u solotext docker compose ps 2>&1 || docker compose ps 2>&1

echo ""
echo "2️⃣ LOGS DU BACKEND (dernières 50 lignes) :"
echo "-------------------------------------------"
sudo -u solotext docker compose logs backend --tail=50 2>&1 || docker compose logs backend --tail=50 2>&1

echo ""
echo "3️⃣ VÉRIFICATION DU PORT 3000 :"
echo "------------------------------"
if netstat -tlnp 2>/dev/null | grep -q ":3000" || ss -tlnp 2>/dev/null | grep -q ":3000"; then
    echo "✅ Le port 3000 est en écoute"
    netstat -tlnp 2>/dev/null | grep ":3000" || ss -tlnp 2>/dev/null | grep ":3000"
else
    echo "❌ Le port 3000 n'est PAS en écoute"
fi

echo ""
echo "4️⃣ TEST DE CONNEXION À L'API :"
echo "-------------------------------"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health | grep -q "200"; then
    echo "✅ L'API répond correctement"
    curl -s http://localhost:3000/api/health
else
    echo "❌ L'API ne répond pas"
    echo "Tentative de connexion :"
    curl -v http://localhost:3000/api/health 2>&1 | head -20
fi

echo ""
echo "5️⃣ VÉRIFICATION DES FICHIERS .ENV :"
echo "------------------------------------"
if [ -f "/opt/solotext/.env" ]; then
    echo "✅ /.env existe"
    echo "   NODE_ENV=$(sudo -u solotext grep NODE_ENV /opt/solotext/.env 2>/dev/null | cut -d'=' -f2 || echo 'non trouvé')"
    echo "   DB_USER=$(sudo -u solotext grep DB_USER /opt/solotext/.env 2>/dev/null | cut -d'=' -f2 || echo 'non trouvé')"
else
    echo "❌ /.env n'existe pas"
fi

if [ -f "/opt/solotext/api/.env" ]; then
    echo "✅ /api/.env existe"
    echo "   NODE_ENV=$(sudo -u solotext grep NODE_ENV /opt/solotext/api/.env 2>/dev/null | cut -d'=' -f2 || echo 'non trouvé')"
    echo "   DB_USER=$(sudo -u solotext grep DB_USER /opt/solotext/api/.env 2>/dev/null | cut -d'=' -f2 || echo 'non trouvé')"
else
    echo "❌ /api/.env n'existe pas"
fi

echo ""
echo "6️⃣ VÉRIFICATION DE LA CONFIGURATION NGINX :"
echo "--------------------------------------------"
if [ -f "/etc/nginx/sites-enabled/solotext-api" ]; then
    echo "✅ Configuration Nginx API trouvée"
    echo "Contenu :"
    sudo grep -A 10 "server_name" /etc/nginx/sites-enabled/solotext-api | head -15
else
    echo "❌ Configuration Nginx API non trouvée"
fi

echo ""
echo "7️⃣ TEST NGINX :"
echo "---------------"
sudo nginx -t 2>&1

echo ""
echo "8️⃣ ÉTAT DE NGINX :"
echo "-------------------"
sudo systemctl status nginx --no-pager -l | head -15

echo ""
echo "9️⃣ VÉRIFICATION DE LA CONNEXION NGINX → BACKEND :"
echo "--------------------------------------------------"
echo "Test depuis Nginx vers localhost:3000 :"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000/api/health || echo "❌ Impossible de se connecter"

echo ""
echo "✅ Diagnostic terminé"
echo ""
echo "💡 ACTIONS RECOMMANDÉES :"
echo "   1. Si le backend redémarre en boucle, vérifiez les logs ci-dessus"
echo "   2. Si le port 3000 n'est pas en écoute, le backend ne démarre pas"
echo "   3. Si NODE_ENV n'est pas 'staging', vérifiez le déploiement Ansible"
echo "   4. Si PostgreSQL échoue, vérifiez les identifiants dans le vault"

