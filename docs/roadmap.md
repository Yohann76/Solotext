# Roadmap

## V1

multy-provider:
- add config_provider (provider_name, api_url, cost_per_request, is_used) 
- add fixtures for this config table
- in api_calls table, replace api_provider per config_provider relation
- Add cost by request perplexity (et définir le cout total du client) (0,005 per request)(fixture config_provider)
- Add service for feature flag (from config_provider database)(in worker) (if config.perplexity = 1 use this...)
 
 improve base:
- Le % dans l’historique doit se rafraîchir automatique a chaque changement
- Les phrases non tester/dupliquer, doivent etre en surligné/gris
- Le / (home), doit renvoyer une page d'acceuil normalement
- Improve history analyse (small card, and color from analysis, add nbr sentence in card)

## V1.1

- Add stripe paiement (with différent subscription, active etc...)
- Add 3 analyse demo (free analyse) (add counter per user)
- After 3 analayse, display message -> your free version is end, you can pay for  analysis
- Add different role (admin, prenium6000, prenium3000, prenium1000, user)

## V1.2

- Update landing page with project color in chart 
- add cookie management
- add github action 
- Kubernetes for deployment
- add page : "conditions d’utilisation"  
- add page : "politique de confidentialité"  
- add backup DB (and testing)
- add red banner on top website if GPT API is not available



