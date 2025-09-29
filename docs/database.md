# Database

## Schémas:

Users:
id (PK)
email
google_id (pour connexion via Google)
created_at
updated_at


Subscriptions: (fonctionnement mois par mois, un user peut avoir plusieurs subscription, mais qu’un seul status=active)
id (PK)
user_id (FK vers Users.id) → permet de lier l’abonnement à un utilisateur
stripe_subscription_id → l’ID de l’abonnement Stripe
status → active / canceled / past_due / trialing (pour suivre le statut)
start_date → date de début de l’abonnement
current_period_start → début de la période de facturation en cours
current_period_end → fin de la période de facturation en cours
cancel_at_period_end → booléen, si l’abonnement est prévu pour se terminer
created_at
updated_at


Analyses:
id (PK)
user_id (FK -> Users.id)
analyzed_at (date et heure d’analyse)
source_text (texte complet analysé)
duplicate_percent (pourcentage de contenu dupliqué détecté)
pdf_report_path (chemin fichier PDF généré) (pas besoins car peut etre générer a la volé)
created_at
updated_at


Sentences:
id (PK)
analysis_id (FK -> Analyses.id)
sentence_text (texte de la phrase analysée)
source_url (liens de la source détectée pour cette phrase)
is_duplicate (booléen, true si cette phrase est détectée dupliquée)
created_at
updated_at

