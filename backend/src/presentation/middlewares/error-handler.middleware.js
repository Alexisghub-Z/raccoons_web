import { AppError } from '../../shared/errors/AppError.js';
import logger from '../../shared/logger/index.js';
import { config } from '../../shared/config/index.js';

export const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    logger.warn(`Application error: ${err.message}`, {
      code: err.code,
      statusCode: err.statusCode,
      path: req.path
    });

    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details })
      }
    });
  }

  logger.error('Unexpected error:', {
    message: err.message,
    stack: err.stack,
    path: req.path
  });

  const isDevelopment = config.env === 'development';

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: isDevelopment ? err.message : 'Internal server error',
      ...(isDevelopment && { stack: err.stack })
    }
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`
    }
  });
};
