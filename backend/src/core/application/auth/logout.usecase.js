import { ValidationError } from '../../../shared/errors/AppError.js';
import logger from '../../../shared/logger/index.js';
import prisma from '../../../infrastructure/database/prisma-client.js';

export class LogoutUseCase {
  async execute({ refreshToken }) {
    try {
      if (!refreshToken) {
        throw new ValidationError('Refresh token is required');
      }

      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken }
      });

      logger.info('User logged out successfully');

      return { message: 'Logged out successfully' };
    } catch (error) {
      logger.error('Error in LogoutUseCase:', error);
      throw error;
    }
  }
}
