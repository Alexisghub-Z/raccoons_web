import { IUserRepository } from '../../../core/domain/repositories/IUserRepository.js';
import { User } from '../../../core/domain/entities/User.js';
import prisma from '../prisma-client.js';
import { DatabaseError, NotFoundError } from '../../../shared/errors/AppError.js';
import logger from '../../../shared/logger/index.js';

export class UserRepository extends IUserRepository {
  async findById(id) {
    try {
      const user = await prisma.user.findUnique({
        where: { id }
      });

      if (!user) return null;
      return new User(user);
    } catch (error) {
      logger.error('Error finding user by id:', error);
      throw new DatabaseError('Error finding user by id', error.message);
    }
  }

  async findByEmail(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) return null;
      return new User(user);
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw new DatabaseError('Error finding user by email', error.message);
    }
  }

  async findByPhone(phone) {
    try {
      const user = await prisma.user.findFirst({
        where: { phone }
      });

      if (!user) return null;
      return new User(user);
    } catch (error) {
      logger.error('Error finding user by phone:', error);
      throw new DatabaseError('Error finding user by phone', error.message);
    }
  }

  async create(userData) {
    try {
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          role: userData.role || 'CUSTOMER',
          isActive: userData.isActive !== undefined ? userData.isActive : true,
          emailVerified: userData.emailVerified || false
        }
      });

      return new User(user);
    } catch (error) {
      logger.error('Error creating user:', error);
      if (error.code === 'P2002') {
        throw new DatabaseError('User with this email already exists');
      }
      throw new DatabaseError('Error creating user', error.message);
    }
  }

  async update(id, userData) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          ...(userData.email && { email: userData.email }),
          ...(userData.password && { password: userData.password }),
          ...(userData.firstName && { firstName: userData.firstName }),
          ...(userData.lastName && { lastName: userData.lastName }),
          ...(userData.phone && { phone: userData.phone }),
          ...(userData.role && { role: userData.role }),
          ...(userData.isActive !== undefined && { isActive: userData.isActive }),
          ...(userData.emailVerified !== undefined && { emailVerified: userData.emailVerified })
        }
      });

      return new User(user);
    } catch (error) {
      logger.error('Error updating user:', error);
      if (error.code === 'P2025') {
        throw new NotFoundError('User');
      }
      throw new DatabaseError('Error updating user', error.message);
    }
  }

  async delete(id) {
    try {
      // Usar una transacción para eliminar el usuario y sus notificaciones
      await prisma.$transaction(async (tx) => {
        // 1. Eliminar todas las notificaciones del usuario
        await tx.notification.deleteMany({
          where: { userId: id }
        });

        // 2. Eliminar el usuario (los refresh tokens se eliminan automáticamente por CASCADE)
        await tx.user.delete({
          where: { id }
        });
      });

      return true;
    } catch (error) {
      logger.error('Error deleting user:', error);
      if (error.code === 'P2025') {
        throw new NotFoundError('User');
      }
      if (error.code === 'P2003') {
        throw new DatabaseError('Cannot delete user with associated services or appointments');
      }
      throw new DatabaseError('Error deleting user', error.message);
    }
  }

  async findAll(filters = {}) {
    try {
      const where = {};

      if (filters.role) {
        where.role = filters.role;
      }

      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      if (filters.search) {
        where.OR = [
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { phone: { contains: filters.search } }
        ];
      }

      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: filters.orderBy || { createdAt: 'desc' }
        }),
        prisma.user.count({ where })
      ]);

      return {
        data: users.map(user => new User(user)),
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit
      };
    } catch (error) {
      logger.error('Error finding all users:', error);
      throw new DatabaseError('Error finding users', error.message);
    }
  }

  async existsByEmail(email) {
    try {
      const count = await prisma.user.count({
        where: { email }
      });
      return count > 0;
    } catch (error) {
      logger.error('Error checking user existence:', error);
      throw new DatabaseError('Error checking user existence', error.message);
    }
  }
}
