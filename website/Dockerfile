# Dockerfile pour le frontend Website Vue.js (développement et production)
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances (y compris dev dependencies)
RUN npm install && \
    chmod -R 755 /app/node_modules/.bin

# Copier le code source
COPY . .

# S'assurer que les permissions sont correctes
RUN chmod -R 755 /app/node_modules/.bin || true

# Exposer le port de développement (sera surchargé par docker-compose)
EXPOSE 8091

# Commande par défaut (développement)
# Le port sera surchargé par docker-compose selon l'environnement
CMD ["npm", "run", "dev:server", "--", "--host", "0.0.0.0", "--port", "8091"]

