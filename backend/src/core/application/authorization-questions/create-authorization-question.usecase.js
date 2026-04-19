import { ValidationError, NotFoundError } from '../../../shared/errors/AppError.js';
import logger from '../../../shared/logger/index.js';
import notificationStrategy from '../../../infrastructure/messaging/notification-strategy.js';

export class CreateAuthorizationQuestionUseCase {
  constructor(authQuestionRepository, serviceRepository, notificationRepository) {
    this.authQuestionRepository = authQuestionRepository;
    this.serviceRepository = serviceRepository;
    this.notificationRepository = notificationRepository;
  }

  async execute({ serviceId, question }) {
    if (!serviceId || !question) {
      throw new ValidationError('serviceId and question are required');
    }

    const service = await this.serviceRepository.findById(serviceId);
    if (!service) {
      throw new NotFoundError('Service');
    }

    if (service.status === 'DELIVERED' || service.status === 'CANCELLED') {
      throw new ValidationError('Cannot create authorization questions for delivered or cancelled services');
    }

    const authQuestion = await this.authQuestionRepository.create({ serviceId, question });

    logger.info(`Authorization question created for service ${service.code}`);

    // Send email notification to customer
    if (this.notificationRepository && service.customer?.email) {
      try {
        const notification = await this.notificationRepository.create({
          userId: service.customer.id,
          type: 'AUTHORIZATION_REQUESTED',
          channel: 'EMAIL',
          title: 'Solicitud de autorizacion',
          message: question,
          serviceId: service.id,
          metadata: {
            serviceCode: service.code,
            motorcycle: service.motorcycle,
            questionText: question
          }
        });

        try {
          const sendResult = await notificationStrategy.sendNotification(notification, service.customer);
          if (sendResult.success) {
            logger.info(`Authorization email sent for service: ${service.code}`);
            await this.notificationRepository.update(notification.id, { status: 'SENT', sentAt: new Date() });
          } else {
            logger.error(`Failed to send authorization email for service: ${service.code}`, sendResult);
            await this.notificationRepository.update(notification.id, {
              status: 'FAILED',
              errorMessage: sendResult.error || 'Unknown error'
            });
          }
        } catch (sendError) {
          logger.error('Error sending authorization notification:', sendError);
          await this.notificationRepository.update(notification.id, {
            status: 'FAILED',
            errorMessage: sendError.message
          });
        }
      } catch (notifError) {
        logger.error('Error creating authorization notification:', notifError);
      }
    }

    return authQuestion;
  }
}
