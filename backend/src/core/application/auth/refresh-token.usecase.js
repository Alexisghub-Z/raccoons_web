import { AuthenticationError } from '../../../shared/errors/AppError.js';
import { verifyRefreshToken, generateAccessToken } from '../../../shared/utils/jwt.js';
import logger from '../../../shared/logger/index.js';
import prisma from '../../../infrastructure/database/prisma-client.js';

export class RefreshTokenUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ refreshToken }) {
    try {
      if (!refreshToken) {
        throw new AuthenticationError('Refresh token is required');
      }

      const decoded = verifyRefreshToken(refreshToken);

      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken }
      });

      if (!storedToken) {
        throw new AuthenticationError('Invalid refresh token');
      }

      if (new Date() > storedToken.expiresAt) {
        await prisma.refreshToken.delete({
          where: { id: storedToken.id }
        });
        throw new AuthenticationError('Refresh token expired');
      }

      const user = await this.userRepository.findById(decoded.id);
      if (!user) {
        throw new AuthenticationError('User not found');
      }

      if (!user.isActive) {
        throw new AuthenticationError('User account is inactive');
      }

      const newAccessToken = generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      logger.info(`Token refreshed for user: ${user.email}`);

      return {
        accessToken: newAccessToken
      };
    } catch (error) {
      logger.error('Error in RefreshTokenUseCase:', error);
      throw error;
    }
  }
}
