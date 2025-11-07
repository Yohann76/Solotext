# Roadmap

## V1 Base Saas, and short therm option

- Buy stagging VPS on OVH for development

Improve base:
- Improve history analyse (small card, and color from analysis, add nbr sentence in card)
- Afficher le nombre de phrases et de mots dans le textarea pour avoir un nombre de crédit phrase qui vas etre utilisé.

RealtTime:
- Each phrase textarea must be display test in realt-time (in progress)
- Le % dans l’historique doit se rafraîchir automatique a chaque changement

## V1.1 Payment Interface
Stripe: 
- Add stripe paiement (with différent subscription, active etc...) -> redirect page with button..

## V1.1.2 Limit user
- add Limit Sentence per user/per month
- User base : 200 free sentence
- display limit under Historique des analyses (under 7 analyses..)
- Stop analyse if limit is full
- Add different role (admin, prenium6000, prenium3000, prenium1000, user)
- After use 200 free sentence credit, display message for pay

## V1.2 Functionnal +
- Add post api in back (for register new email from newletter form in footer)(new table with email + activate/desactive boolean)

Multy-provider(Later):
- Study input/output perplexity service for have same parameter in different provider
- Create Second service with APIFY, or google content search..
 
 
- Add github action (test + prettier?)
- Add backup DB (container export)
- Add red banner on top website (only on application) for display message..
- on principal textarea, display number character, word, sentance..

## V1.21 Graphics
- Update landing page with color chart graphic (In progress)
- Add page : "conditions d’utilisation"  
- Add page : "politique de confidentialité"  
- Add page : CGU
- Add page : CGV
- Add Cookie management ()
- Add argument marketing in 3 row section (in homepage)
- Add Impact Header (link teachizy)
- Add Table price in page /price (base on 50% marge on perplexity API cost)(4 offers, Decouverte, Pro, Expert, Business)

## V1.3 Customer Saas
- Add support fonction (send message, receive message in infobull)
- Add contact page (per email?)
- Add mailer informations (connexion, forget password, register)

## V1.3.1 Worker test
- Write test worker and lib (Unit test)
- Add 5 text corpus, and create script for test different provider on this corpus text for comparate result

## V1.3.2 Blog
- Add blog page
- Add Single blog page
- Add structur for SEO
- Add robots.txt
- add sitemap.xml
- add link blog in footer page

## V1.3.3 Security
- See security API route
- See JWT Connexion

## V1.4 Deploy Saas - Saas is online!

- Kubernetes for deployment/ Other simple deploy
- Buy NDD (OVH) (solotext.io)
- Buy VPS (OVH)
- Use HTTPS Certificat (Let's Encryptt)

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

- add blog article ...?

## V /prblm

- Improve database queries (a folder/repository in the backend) to separate database calls that are in files like routes, for example, sorted by model.




