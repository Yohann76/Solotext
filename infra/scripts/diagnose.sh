#!/bin/bash
# Script de diagnostic pour vérifier l'état du déploiement

echo "🔍 Diagnostic du déploiement SoloText"
echo "======================================"
echo ""

echo "📁 Vérification des répertoires web :"
echo "--------------------------------------"
if [ -d "/var/www/app" ]; then
    echo "✅ /var/www/app existe"
    echo "   Contenu : $(ls -la /var/www/app | head -5)"
else
    echo "❌ /var/www/app n'existe pas"
fi

if [ -d "/var/www/website" ]; then
    echo "✅ /var/www/website existe"
    echo "   Contenu : $(ls -la /var/www/website | head -5)"
else
    echo "❌ /var/www/website n'existe pas"
fi

echo ""
echo "🐳 État des conteneurs Docker :"
echo "--------------------------------"
cd /opt/solotext && docker compose ps

echo ""
echo "📋 Logs de l'API (dernières 20 lignes) :"
echo "----------------------------------------"
cd /opt/solotext && docker compose logs --tail=20 api 2>&1 || echo "❌ Impossible de récupérer les logs"

echo ""
echo "🌐 État de Nginx :"
echo "------------------"
systemctl status nginx --no-pager -l | head -20

echo ""
echo "📝 Configuration Nginx :"
echo "------------------------"
nginx -t 2>&1

echo ""
echo "🔌 Ports en écoute :"
echo "--------------------"
netstat -tlnp | grep -E ":(80|443|3000)" || ss -tlnp | grep -E ":(80|443|3000)"

echo ""
echo "✅ Diagnostic terminé"

