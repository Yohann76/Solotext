# Stripe Configuration

1. Go in [https://stripe.com](https://stripe.com) and create account

- Get a API key 
- Create different product

Not need Stripe CLI on server (just create webhook on workbench test/prod)

```
SoloText Pro (prod_xxxxx) (1000) -> 8,99 Euros
SoloText Entreprise (prod_xxxxx) (3000) -> 22,99 Euros
SoloText Agence (prod_xxxx) (6000) -> 42,99 Euros
```

## Configure env (on backend)

add in `.env` backend:

```env
STRIPE_SECRET_KEY=sk_test_... 
STRIPE_WEBHOOK_SECRET=whsec_... 

STRIPE_PRICE_ID_PREMIUM1000=prod_xxxxx
STRIPE_PRICE_ID_PREMIUM3000=prod_xxxxx
STRIPE_PRICE_ID_PREMIUM6000=prod_xxxxx

FRONTEND_URL=https://votre-domaine.com # need httpS certificat
```

### Create webhook endpoint (and webhook key)

1. In dashboard, go to  **Developers** > **Webhooks**
2. Cliq on **Add endpoint**
3. URL : `https://votre-domaine.com/api/stripe/webhook`
4. Add all evenement
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy **Signing secret** and add `.env`(STRIPE_WEBHOOK_SECRET)

## Integration test

1. use key **test** (start by`sk_test_` and `pk_test_`)
2. Use test card stripe:
   - Succes : `4242 4242 4242 4242`
   - Echec : `4000 0000 0000 0002`
   - 3D Secure : `4000 0025 0000 3155`
   - Expriration date: Only date futur
   - CVC : only 3 number

## Go to production

- Activate Live mode in the Stripe dashboard
- Retrieve your Live keys (starting with sk_live_ and pk_live_)
- Update your .env file with the Live keys
- Create products and prices in Live mode
- Update the Price IDs in your .env file
- Configure the webhook in production
- Test with a real card (small amount)
