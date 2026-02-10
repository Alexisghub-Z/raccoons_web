import { INotificationRepository } from '../../../core/domain/repositories/INotificationRepository.js';
import { Notification } from '../../../core/domain/entities/Notification.js';
import prisma from '../prisma-client.js';
import { DatabaseError, NotFoundError } from '../../../shared/errors/AppError.js';
import logger from '../../../shared/logger/index.js';

export class NotificationRepository extends INotificationRepository {
  async findById(id) {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id },
        include: {
          user: true,
          service: true,
          appointment: true
        }
      });

      if (!notification) return null;
      return new Notification(notification);
    } catch (error) {
      logger.error('Error finding notification by id:', error);
      throw new DatabaseError('Error finding notification by id', error.message);
    }
  }

  async findByUserId(userId) {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId },
        include: {
          service: true,
          appointment: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return notifications.map(notification => new Notification(notification));
    } catch (error) {
      logger.error('Error finding notifications by user:', error);
      throw new DatabaseError('Error finding notifications by user', error.message);
    }
  }

  async create(notificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: notificationData.userId,
          type: notificationData.type,
          channel: notificationData.channel,
          title: notificationData.title,
          message: notificationData.message,
          status: notificationData.status || 'PENDING',
          metadata: notificationData.metadata,
          serviceId: notificationData.serviceId,
          appointmentId: notificationData.appointmentId
        },
        include: {
          user: true,
          service: true,
          appointment: true
        }
      });

      return new Notification(notification);
    } catch (error) {
      logger.error('Error creating notification:', error);
      if (error.code === 'P2003') {
        throw new DatabaseError('Related entity not found (user, service, or appointment)');
      }
      throw new DatabaseError('Error creating notification', error.message);
    }
  }

  async update(id, notificationData) {
    try {
      const notification = await prisma.notification.update({
        where: { id },
        data: {
          ...(notificationData.status && { status: notificationData.status }),
          ...(notificationData.sentAt && { sentAt: new Date(notificationData.sentAt) }),
          ...(notificationData.readAt && { readAt: new Date(notificationData.readAt) }),
          ...(notificationData.retryCount !== undefined && { retryCount: notificationData.retryCount }),
          ...(notificationData.errorMessage !== undefined && { errorMessage: notificationData.errorMessage }),
          ...(notificationData.metadata && { metadata: notificationData.metadata })
        },
        include: {
          user: true,
          service: true,
          appointment: true
        }
      });

      return new Notification(notification);
    } catch (error) {
      logger.error('Error updating notification:', error);
      if (error.code === 'P2025') {
        throw new NotFoundError('Notification');
      }
      throw new DatabaseError('Error updating notification', error.message);
    }
  }

  async delete(id) {
    try {
      await prisma.notification.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      logger.error('Error deleting notification:', error);
      if (error.code === 'P2025') {
        throw new NotFoundError('Notification');
      }
      throw new DatabaseError('Error deleting notification', error.message);
    }
  }

  async findAll(filters = {}) {
    try {
      const where = {};

      if (filters.userId) {
        where.userId = filters.userId;
      }

      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.channel) {
        where.channel = filters.channel;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.serviceId) {
        where.serviceId = filters.serviceId;
      }

      if (filters.appointmentId) {
        where.appointmentId = filters.appointmentId;
      }

      const notifications = await prisma.notification.findMany({
        where,
        include: {
          user: true,
          service: true,
          appointment: true
        },
        skip: filters.offset || 0,
        take: filters.limit || 100,
        orderBy: filters.orderBy || { createdAt: 'desc' }
      });

      return notifications.map(notification => new Notification(notification));
    } catch (error) {
      logger.error('Error finding all notifications:', error);
      throw new DatabaseError('Error finding notifications', error.message);
    }
  }

  async findPending() {
    try {
      const notifications = await prisma.notification.findMany({
        where: { status: 'PENDING' },
        include: {
          user: true,
          service: true,
          appointment: true
        },
        orderBy: { createdAt: 'asc' }
      });

      return notifications.map(notification => new Notification(notification));
    } catch (error) {
      logger.error('Error finding pending notifications:', error);
      throw new DatabaseError('Error finding pending notifications', error.message);
    }
  }

  async findFailed() {
    try {
      const notifications = await prisma.notification.findMany({
        where: { status: 'FAILED' },
        include: {
          user: true,
          service: true,
          appointment: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return notifications.map(notification => new Notification(notification));
    } catch (error) {
      logger.error('Error finding failed notifications:', error);
      throw new DatabaseError('Error finding failed notifications', error.message);
    }
  }

  async markAsRead(id) {
    try {
      const notification = await prisma.notification.update({
        where: { id },
        data: {
          status: 'READ',
          readAt: new Date()
        },
        include: {
          user: true,
          service: true,
          appointment: true
        }
      });

      return new Notification(notification);
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      if (error.code === 'P2025') {
        throw new NotFoundError('Notification');
      }
      throw new DatabaseError('Error marking notification as read', error.message);
    }
  }

  async markAsSent(id) {
    try {
      const notification = await prisma.notification.update({
        where: { id },
        data: {
          status: 'SENT',
          sentAt: new Date()
        },
        include: {
          user: true,
          service: true,
          appointment: true
        }
      });

      return new Notification(notification);
    } catch (error) {
      logger.error('Error marking notification as sent:', error);
      if (error.code === 'P2025') {
        throw new NotFoundError('Notification');
      }
      throw new DatabaseError('Error marking notification as sent', error.message);
    }
  }

  async markAsFailed(id, errorMessage) {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id }
      });

      if (!notification) {
        throw new NotFoundError('Notification');
      }

      const updated = await prisma.notification.update({
        where: { id },
        data: {
          status: 'FAILED',
          errorMessage,
          retryCount: notification.retryCount + 1
        },
        include: {
          user: true,
          service: true,
          appointment: true
        }
      });

      return new Notification(updated);
    } catch (error) {
      logger.error('Error marking notification as failed:', error);
      if (error.code === 'P2025') {
        throw new NotFoundError('Notification');
      }
      throw new DatabaseError('Error marking notification as failed', error.message);
    }
  }
}
