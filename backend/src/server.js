import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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

app.use(helmet());

app.use(cors({
  origin: config.cors.origins,
  credentials: true
}));

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  }
});
app.use(limiter);

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
  logger.info('Available endpoints:');
  logger.info(`  POST   /api/${config.apiVersion}/auth/register`);
  logger.info(`  POST   /api/${config.apiVersion}/auth/login`);
  logger.info(`  POST   /api/${config.apiVersion}/auth/refresh`);
  logger.info(`  POST   /api/${config.apiVersion}/auth/logout`);
  logger.info(`  GET    /api/${config.apiVersion}/auth/me`);
  logger.info(``);
  logger.info(`  POST   /api/${config.apiVersion}/services`);
  logger.info(`  GET    /api/${config.apiVersion}/services`);
  logger.info(`  GET    /api/${config.apiVersion}/services/code/:code`);
  logger.info(`  GET    /api/${config.apiVersion}/services/:id`);
  logger.info(`  PUT    /api/${config.apiVersion}/services/:id`);
  logger.info(`  PUT    /api/${config.apiVersion}/services/:id/status`);
  logger.info(`  DELETE /api/${config.apiVersion}/services/:id`);
  logger.info(``);
  logger.info(`  POST   /api/${config.apiVersion}/appointments`);
  logger.info(`  GET    /api/${config.apiVersion}/appointments`);
  logger.info(`  GET    /api/${config.apiVersion}/appointments/upcoming`);
  logger.info(`  GET    /api/${config.apiVersion}/appointments/:id`);
  logger.info(`  PUT    /api/${config.apiVersion}/appointments/:id/confirm`);
  logger.info(`  PUT    /api/${config.apiVersion}/appointments/:id/cancel`);
  logger.info(`  DELETE /api/${config.apiVersion}/appointments/:id`);
  logger.info(``);
  logger.info(`  GET    /api/${config.apiVersion}/notifications`);
  logger.info(`  GET    /api/${config.apiVersion}/notifications/unread`);
  logger.info(`  GET    /api/${config.apiVersion}/notifications/:id`);
  logger.info(`  PUT    /api/${config.apiVersion}/notifications/:id/read`);
  logger.info(`  DELETE /api/${config.apiVersion}/notifications/:id`);
  logger.info('='.repeat(50));
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app;
