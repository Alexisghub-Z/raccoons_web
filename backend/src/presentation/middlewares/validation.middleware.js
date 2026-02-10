import { ValidationError } from '../../shared/errors/AppError.js';
import logger from '../../shared/logger/index.js';

export const validate = (schema) => {
  return (req, res, next) => {
    logger.info('Validation middleware - Received body:', req.body);

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.error('Validation middleware - Failed:', { body: req.body, details });

      return next(new ValidationError('Validation failed', details));
    }

    req.validatedBody = value;
    next();
  };
};
