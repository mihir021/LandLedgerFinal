import dotenv from 'dotenv';
dotenv.config();

import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import app from './app.js';
import connectDB from './config/database.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start the server
const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    logger.info(`Health check → http://localhost:${PORT}/api/health`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.warn(`Port ${PORT} is busy. Retrying connection in 1s...`);
      setTimeout(() => {
        server.close();
        server.listen(PORT);
      }, 1000);
    } else {
      logger.error(`Server Error: ${err.message}`);
    }
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

startServer();
