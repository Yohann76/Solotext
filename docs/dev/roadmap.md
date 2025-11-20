# Roadmap

## V1.1 Payment Interface (Stripe) [In progress -> testing this]
- Add stripe paiement (with différent subscription, active etc...) -> stripe = redirect page with button..
- Ajouter une limite a un utilisateur qui sera défini par son abonnement (Table user ou une relation via stripe?)
- Un user a un freenium de 200 free phrases
- Montrer les crédits restant dans l'historique (en dessous du nombre d'analyse))
- Stop analyse if limit is full
- Add different role (admin, prenium6000, prenium3000, prenium1000, user)
- Si l'utilisateur n'a plus de crédit, afficher les crédits en rouge (et pouvoir faire évoluer son abonnement) (Ne plus pouvoir faire d'analyse (Griser le bouton avec un hover -> abonnez vous!))

## V1.2 Functionnal +
- Add post api in back (for register new email from newletter form in footer)(new table with email + activate/desactive boolean)

- Add red banner on top website (only on application) for display message (cette application est en beta test, pour tout probléme veuillez me contacter...)
    - La banner doit etre afficher que au dessus de l'application
    - la banner doit avoir une variable d'envionnement display true/false
    - la banner doit avoir une variable d'environnement pour le message
    - la banner doit avoir une variable d'environnement pour la couleur de la banner

## V1.21 Graphics
- Update landing page with color chart graphic (In progress)
- Add page : "conditions d’utilisation"  
- Add page : "politique de confidentialité"  
- Add page : CGU
- Add page : CGV
- Add Cookie management ()
- Add argument marketing in 3 row section (in homepage)
- Add Impact Header (link teachizy)
- Add Favicon (Logo)
- Edit login/register page with chart color
- Add functionnality page (argument=section)
    - Check each sentance on internet (each sentance = request in different search engine)
    - Keep history of your analysis
    - Export Analysis in PDF
    - Find source in your different occurence..

## V1.3.2 Blog
- Add blog page
- Add Single blog page
- Add structur for SEO
- Add robots.txt
- add sitemap.xml
- add link blog in footer page

- add blog article (with markdown content and vue)

## V1.3 Customer Saas
- Add support fonction (send message, receive message in infobull)
- Add contact page (per email?)
- Add mailer informations (connexion, forget password, register)

Multy-provider(Later):
- Study input/output perplexity service for have same parameter in different provider
- Create Second service with APIFY, or google content search..

## V1.3.3 Security
- See security API route
- See JWT Connexion

## V1.3.1 Worker test
- Write test worker and lib (Unit test)
- Add 5 text corpus, and create script for test different provider on this corpus text for comparate result

## V1.5 
- Diversify worker (Google search content, bing, apify...)
- Add public API (and cost Limit, link website saas) (for diversify customer type) and another application of research link (WP Plugin...)

## V2.X

- Add other source of document (search student university), and put type search in request post json for analyse different source (document/web...)(Prepare API for different marketing target)

## V3 Project (Extension for use existent API)

- Wordpress Plugin (need API, customer en website...)
- Extension chrome for need sentance

## V4 Project (New target)

- Actual website -> for content/agency SEO

- Add new website (color blue) -> for school (1 university, different professor licence...)

----------------------------------------------------------------------

## V /Maintenance

- ? 

## V /prblm /bug

- ? 

## V Deploy

TODO: 
- Verification backup DB (container postgres)
- Verification if var stagging/production in vault correspond to local var
- In prod not reload database (playbook)
- Put reload on service (only backend, or only website)
- In producation, not run adminer service (docker-compose)
- add CI/CD (deploy staging with branch staging, deploy production on branch main)



