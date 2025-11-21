# SoloText Website

## Manage cookie

Manage cookie with axeptio service (google)

## robot.txt

/robots.txt -> public/

## sitemap.xml

/sitemap.xml -> generate with script in /scripts 

VITE_BASE_URL required, elsif default is solotext.io

```
node scripts/generate-sitemap.js
```
Ansible playbook execute ```npm run build``` 

The prebuild hook in package.json automatically runs npm run generate:sitemap before the build

## Article content

- [In progress] first article -> Solotext, comprendre notre logiciel 

- [TODO] Comprendre la détection du contenu dupliqué : enjeux et méthodes modernes
- [TODO] Pourquoi le plagiat nuit-il gravement au référencement SEO ?
- [TODO] Google et la gestion du contenu dupliqué : comment éviter les pénalités
- [TODO] Duplication de contenu et SEO : stratégies pour préserver votre positionnement
- [TODO] La détection de plagiat dans les productions d'IA : quelles bonnes pratiques ?
- [TODO] Comment vérifier l’originalité des sources journalistiques grâce à la détection dupliquée
- [TODO] Les impacts juridiques liés au contenu copié : protéger ses droits d’auteur
- [TODO] Le rôle des outils de duplicate content dans la lutte contre la désinformation sur internet

