import { NotificationRepository } from '../../infrastructure/database/repositories/NotificationRepository.js';
import { ListNotificationsUseCase } from '../../core/application/notifications/list-notifications.usecase.js';
import { MarkNotificationAsReadUseCase } from '../../core/application/notifications/mark-as-read.usecase.js';

const notificationRepository = new NotificationRepository();

export class NotificationController {
  async getAll(req, res, next) {
    try {
      const listNotificationsUseCase = new ListNotificationsUseCase(notificationRepository);
      const filters = {
        userId: req.user.id,
        type: req.query.type,
        channel: req.query.channel,
        status: req.query.status,
        offset: parseInt(req.query.offset) || 0,
        limit: parseInt(req.query.limit) || 20
      };

      const notifications = await listNotificationsUseCase.execute(filters);

      res.status(200).json({
        success: true,
        data: notifications,
        message: 'Notifications retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const notification = await notificationRepository.findById(req.params.id);

      res.status(200).json({
        success: true,
        data: notification,
        message: 'Notification retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const markAsReadUseCase = new MarkNotificationAsReadUseCase(notificationRepository);
      const notification = await markAsReadUseCase.execute(req.params.id);

      res.status(200).json({
        success: true,
        data: notification,
        message: 'Notification marked as read'
      });
    } catch (error) {
      next(error);
    }
  }

  async getUnread(req, res, next) {
    try {
      const listNotificationsUseCase = new ListNotificationsUseCase(notificationRepository);
      const notifications = await listNotificationsUseCase.execute({
        userId: req.user.id,
        status: 'SENT'
      });

      res.status(200).json({
        success: true,
        data: notifications,
        message: 'Unread notifications retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await notificationRepository.delete(req.params.id);

      res.status(200).json({
        success: true,
        data: null,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
