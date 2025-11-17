const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

let sequelize = null;

/**
 * Connect to PostgreSQL database
 */
async function connectDatabase() {
  try {
    sequelize = new Sequelize(
      process.env.DATABASE_URL || {
        database: process.env.DB_NAME || 'gambit_stocks',
        username: process.env.DB_USER || 'user',
        password: process.env.DB_PASSWORD || 'password',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        dialect: 'postgres'
      },
      {
        logging: process.env.NODE_ENV === 'development' 
          ? (msg) => logger.debug(msg) 
          : false,
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        dialectOptions: {
          ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
          } : false
        }
      }
    );

    // Test connection
    await sequelize.authenticate();
    logger.info('Database: Connected successfully');

    // Sync models (only in development)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      logger.info('Database: Models synchronized');
    }

    return sequelize;

  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

/**
 * Get Sequelize instance
 */
function getSequelize() {
  if (!sequelize) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return sequelize;
}

/**
 * Disconnect from database
 */
async function disconnectDatabase() {
  if (sequelize) {
    await sequelize.close();
    sequelize = null;
    logger.info('Database: Disconnected');
  }
}

module.exports = {
  connectDatabase,
  getSequelize,
  disconnectDatabase
};
