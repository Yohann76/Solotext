#!/bin/bash
# Script pour corriger les permissions des répertoires web

echo "🔧 Correction des permissions des répertoires web"
echo "=================================================="
echo ""

# Corriger les permissions de /var/www/app
if [ -d "/var/www/app" ]; then
    echo "📁 Correction des permissions de /var/www/app..."
    sudo chown -R www-data:www-data /var/www/app
    sudo chmod -R 755 /var/www/app
    echo "✅ Permissions corrigées pour /var/www/app"
else
    echo "❌ /var/www/app n'existe pas"
fi

echo ""

# Corriger les permissions de /var/www/website
if [ -d "/var/www/website" ]; then
    echo "📁 Correction des permissions de /var/www/website..."
    sudo chown -R www-data:www-data /var/www/website
    sudo chmod -R 755 /var/www/website
    echo "✅ Permissions corrigées pour /var/www/website"
else
    echo "❌ /var/www/website n'existe pas"
fi

echo ""
echo "✅ Correction terminée"
echo ""
echo "🔍 Vérification :"
ls -la /var/www/app | head -5
echo ""
ls -la /var/www/website | head -5

