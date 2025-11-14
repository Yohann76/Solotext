

// 14/11 : fix env file import .env in api for deploy 
const path = require('path');

// Charger le fichier .env depuis le répertoire api/ (pour l'application)
// ET depuis la racine du projet (pour Docker Compose)
// On essaie d'abord api/.env, puis ../.env (racine)
const apiEnvPath = path.resolve(__dirname, '../.env');
const rootEnvPath = path.resolve(__dirname, '../../.env');

// Charger les deux fichiers .env si ils existent (le dernier écrase les précédents)
require('dotenv').config({ path: apiEnvPath });
require('dotenv').config({ path: rootEnvPath });

// config for sequelize-cli in development, test, production, staging

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres'
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_TEST,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres'
  },
  staging: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres'
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_PROD || process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres'
  }
};
