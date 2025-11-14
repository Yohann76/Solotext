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


# New system : On branch feat-test-separate-api-frontend-website-with-ansible (check)

## 📋 Enregistrements DNS pour SoloText

### 🧪 STAGING (Serveur : 51.178.80.14)

#### Enregistrements A (IPv4)

| Type | Nom | Valeur | TTL | Description |
|------|-----|--------|-----|-------------|
| A | `staging` | `51.178.80.14` | 300 | Website staging (staging.solotext.io) |
| A | `app.staging` | `51.178.80.14` | 300 | Application staging (app.staging.solotext.io) |
| A | `api.staging` | `51.178.80.14` | 300 | API backend staging (api.staging.solotext.io) |

**Résultat :**
- `staging.solotext.io` → `51.178.80.14`
- `app.staging.solotext.io` → `51.178.80.14`
- `api.staging.solotext.io` → `51.178.80.14`

---

### 🚀 PRODUCTION (Serveur : 51.38.178.137)

#### Enregistrements A (IPv4)

| Type | Nom | Valeur | TTL | Description |
|------|-----|--------|-----|-------------|
| A | `@` (ou vide) | `51.38.178.137` | 300 | Website production (solotext.io) |
| A | `app` | `51.38.178.137` | 300 | Application production (app.solotext.io) |
| A | `api` | `51.38.178.137` | 300 | API backend production (api.solotext.io) |

**Résultat :**
- `solotext.io` → `51.38.178.137`
- `app.solotext.io` → `51.38.178.137`
- `api.solotext.io` → `51.38.178.137`

