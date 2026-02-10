import notificationStrategy from '../../../infrastructure/messaging/notification-strategy.js';
import logger from '../../../shared/logger/index.js';

export class SendNotificationUseCase {
  constructor(notificationRepository, userRepository) {
    this.notificationRepository = notificationRepository;
    this.userRepository = userRepository;
  }

  async execute(notificationId) {
    try {
      const notification = await this.notificationRepository.findById(notificationId);
      
      if (!notification) {
        throw new Error('Notification not found');
      }

      if (notification.status !== 'PENDING') {
        logger.warn(`Notification ${notificationId} is not pending. Current status: ${notification.status}`);
        return notification;
      }

      const user = await this.userRepository.findById(notification.userId);
      if (!user) {
        throw new Error('User not found');
      }

      const result = await notificationStrategy.sendNotification(notification, user);

      if (result.success) {
        await this.notificationRepository.markAsSent(notificationId);
        logger.info(`Notification ${notificationId} sent successfully`);
      } else {
        await this.notificationRepository.markAsFailed(notificationId, result.error || 'Failed to send');
        logger.error(`Notification ${notificationId} failed to send`);
      }

      return await this.notificationRepository.findById(notificationId);
    } catch (error) {
      logger.error('Error in SendNotificationUseCase:', error);
      
      if (notificationId) {
        await this.notificationRepository.markAsFailed(notificationId, error.message);
      }
      
      throw error;
    }
  }

  async executeMultiple(notificationIds) {
    const results = [];

    for (const id of notificationIds) {
      try {
        const result = await this.execute(id);
        results.push({ id, success: true, result });
      } catch (error) {
        results.push({ id, success: false, error: error.message });
      }
    }

    return results;
  }
}
