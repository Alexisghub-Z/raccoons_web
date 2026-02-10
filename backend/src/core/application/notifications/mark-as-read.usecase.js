import { NotFoundError } from '../../../shared/errors/AppError.js';
import logger from '../../../shared/logger/index.js';

export class MarkNotificationAsReadUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute(notificationId) {
    try {
      const notification = await this.notificationRepository.markAsRead(notificationId);

      logger.info(`Notification marked as read: ${notificationId}`);

      return notification;
    } catch (error) {
      logger.error('Error in MarkNotificationAsReadUseCase:', error);
      throw error;
    }
  }
}
