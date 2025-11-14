# Workers Directory

use 1 worker ? 

Or split 
- 1. split text to sentence
- 2. Analyse each sentance.

### Monitoring

```bash
# Logs worker
docker logs solotext-analysis-worker --follow

# Interface RabbitMQ
# http://localhost:15672 (admin/admin123)
```

## ⚙️ Configuration

Les workers utilisent les variables d'environnement suivantes :

- `RABBITMQ_URL` : URL de connexion RabbitMQ
- `ANALYSIS_QUEUE` : Nom de la queue d'analyses
- `DB_*` : Configuration de la base de données
