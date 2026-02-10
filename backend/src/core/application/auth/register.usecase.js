import { ConflictError, ValidationError } from '../../../shared/errors/AppError.js';
import { hashPassword } from '../../../shared/utils/password.js';
import { generateAccessToken, generateRefreshToken } from '../../../shared/utils/jwt.js';
import logger from '../../../shared/logger/index.js';
import prisma from '../../../infrastructure/database/prisma-client.js';

export class RegisterUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ email, password, firstName, lastName, phone, role = 'CUSTOMER' }) {
    try {
      if (!email || !password || !firstName || !lastName) {
        throw new ValidationError('Email, password, firstName and lastName are required');
      }

      if (password.length < 6) {
        throw new ValidationError('Password must be at least 6 characters');
      }

      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      const hashedPassword = await hashPassword(password);

      const user = await this.userRepository.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role
      });

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

      logger.info(`User registered successfully: ${user.email}`);

      return {
        user: user.toJSON(),
        tokens: {
          accessToken,
          refreshToken
        }
      };
    } catch (error) {
      logger.error('Error in RegisterUseCase:', error);
      throw error;
    }
  }
}
