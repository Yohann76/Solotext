# Solotext.io

1. Domaine principal (production)
- Type : A
- Nom : @ (ou solotext.com selon ton registrar)
- Cible : 51.38.178.137 (ton serveur de production)
- TTL : 300 s (5 min) ou 600 s pour commencer
- Optionnel mais conseillé : ajoute un enregistrement A pour www pointant vers la même IP, ou un CNAME www → solotext.com.

2. Domaine de staging
- Type : A
- Nom : staging (donc staging.solotext.com)
- Cible : 51.178.80.14 (ton serveur de staging)
- TTL : 300 s à 600 s
