import { ValidationError, NotFoundError } from '../../../shared/errors/AppError.js';
import logger from '../../../shared/logger/index.js';

export class CreateNotificationUseCase {
  constructor(notificationRepository, userRepository) {
    this.notificationRepository = notificationRepository;
    this.userRepository = userRepository;
  }

  async execute(notificationData) {
    try {
      if (!notificationData.userId || !notificationData.type || 
          !notificationData.channel || !notificationData.title || 
          !notificationData.message) {
        throw new ValidationError(
          'UserId, type, channel, title and message are required'
        );
      }

      const user = await this.userRepository.findById(notificationData.userId);
      if (!user) {
        throw new NotFoundError('User');
      }

      const notification = await this.notificationRepository.create({
        ...notificationData,
        status: 'PENDING'
      });

      logger.info(`Notification created for user: ${user.email}`);

      return notification;
    } catch (error) {
      logger.error('Error in CreateNotificationUseCase:', error);
      throw error;
    }
  }
}
