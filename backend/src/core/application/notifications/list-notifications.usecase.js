import logger from '../../../shared/logger/index.js';

export class ListNotificationsUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute(filters = {}) {
    try {
      const notifications = await this.notificationRepository.findAll(filters);

      logger.info(`Notifications listed: ${notifications.length} results`);

      return notifications;
    } catch (error) {
      logger.error('Error in ListNotificationsUseCase:', error);
      throw error;
    }
  }
}
