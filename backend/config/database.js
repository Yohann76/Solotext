const { Sequelize } = require('sequelize');

// file for database in application 

// Database configuration
const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'solotext_db',
  username: process.env.DB_USER || 'solotext_user',
  password: process.env.DB_PASSWORD || 'solotext_password',
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to the PostgreSQL database established successfully');
  } catch (error) {
    console.error('Impossible to connect to the database:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };
