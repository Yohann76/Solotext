# Dockerfile pour le frontend Vue.js (développement et production)
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances (y compris dev dependencies)
RUN npm install

# Copier le code source
COPY . .

# Exposer le port de développement
EXPOSE 8080

# Commande par défaut (développement)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
