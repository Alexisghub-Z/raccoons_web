import { AuthenticationError, ValidationError } from '../../../shared/errors/AppError.js';
import { comparePassword } from '../../../shared/utils/password.js';
import { generateAccessToken, generateRefreshToken } from '../../../shared/utils/jwt.js';
import logger from '../../../shared/logger/index.js';
import prisma from '../../../infrastructure/database/prisma-client.js';

export class LoginUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ email, password }) {
    try {
      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      if (!user.isActive) {
        throw new AuthenticationError('User account is inactive');
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password');
      }

      const accessToken = generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      const refreshToken = generateRefreshToken({
        id: user.id,
        email: user.email
      });

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      logger.info(`User logged in successfully: ${user.email}`);

      return {
        user: user.toJSON(),
        tokens: {
          accessToken,
          refreshToken
        }
      };
    } catch (error) {
      logger.error('Error in LoginUseCase:', error);
      throw error;
    }
  }
}
