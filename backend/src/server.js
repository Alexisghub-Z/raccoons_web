import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './shared/config/index.js';
import logger from './shared/logger/index.js';
import { requestLogger } from './presentation/middlewares/request-logger.middleware.js';
import { errorHandler, notFoundHandler } from './presentation/middlewares/error-handler.middleware.js';
import routes from './presentation/routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Trust proxy para funcionar detras de Nginx (IP real, rate limiting correcto)
if (config.env === 'production') {
  app.set('trust proxy', 1);
}

app.use(helmet());

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (Postman, curl, etc.)
    if (!origin) return callback(null, true);
    if (config.cors.origins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true
}));

// Rate limiting deshabilitado - uso interno de una sola persona

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (evidencias)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(requestLogger);

app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Raccoons Taller API',
      version: '2.0.0',
      description: 'Clean Architecture Backend with PostgreSQL',
      endpoints: {
        health: '/api/v1/health',
        auth: '/api/v1/auth',
        services: '/api/v1/services',
        appointments: '/api/v1/appointments',
        notifications: '/api/v1/notifications'
      }
    },
    message: 'Welcome to Raccoons Taller API'
  });
});

app.use(`/api/${config.apiVersion}`, routes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
  logger.info('='.repeat(50));
  logger.info('   RACCOONS TALLER - BACKEND API');
  logger.info('='.repeat(50));
  logger.info(`Environment: ${config.env}`);
  logger.info(`Server running on: http://localhost:${PORT}`);
  logger.info(`API Version: ${config.apiVersion}`);
  logger.info(`Health check: http://localhost:${PORT}/api/${config.apiVersion}/health`);
  logger.info('='.repeat(50));

  if (config.env !== 'production') {
    logger.info('Available endpoints:');
    logger.info(`  Auth:          /api/${config.apiVersion}/auth/*`);
    logger.info(`  Services:      /api/${config.apiVersion}/services/*`);
    logger.info(`  Appointments:  /api/${config.apiVersion}/appointments/*`);
    logger.info(`  Notifications: /api/${config.apiVersion}/notifications/*`);
    logger.info('='.repeat(50));
  }
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app;
