import { ValidationError, NotFoundError } from '../../../shared/errors/AppError.js';
import { Service } from '../../domain/entities/Service.js';
import logger from '../../../shared/logger/index.js';
import notificationStrategy from '../../../infrastructure/messaging/notification-strategy.js';

export class CreateServiceUseCase {
  constructor(serviceRepository, userRepository, notificationRepository = null) {
    this.serviceRepository = serviceRepository;
    this.userRepository = userRepository;
    this.notificationRepository = notificationRepository;
  }

  async execute(serviceData) {
    try {
      logger.info('CreateServiceUseCase - Received data:', serviceData);

      if (!serviceData.customerId || !serviceData.motorcycle || !serviceData.serviceType) {
        logger.error('CreateServiceUseCase - Validation failed:', {
          hasCustomerId: !!serviceData.customerId,
          hasMotorcycle: !!serviceData.motorcycle,
          hasServiceType: !!serviceData.serviceType,
          data: serviceData
        });
        throw new ValidationError('CustomerId, motorcycle and serviceType are required');
      }

      const customer = await this.userRepository.findById(serviceData.customerId);
      if (!customer) {
        throw new NotFoundError('Customer');
      }

      const code = Service.generateCode();

      const service = await this.serviceRepository.create({
        ...serviceData,
        code,
        status: 'RECEIVED'
      });

      logger.info(`Service created: ${service.code}`);

      if (this.notificationRepository && customer.phone) {
        try {
          const notification = await this.notificationRepository.create({
            userId: customer.id,
            type: 'SERVICE_CREATED',
            channel: 'SMS',
            title: 'Servicio Recibido',
            message: `Tu motocicleta ha sido recibida. Código: ${service.code}`,
            serviceId: service.id,
            metadata: {
              serviceCode: service.code,
              motorcycle: service.motorcycle
            }
          });
          logger.info(`Notification created for service: ${service.code}`);

          // Enviar la notificación inmediatamente
          try {
            const sendResult = await notificationStrategy.sendNotification(notification, customer);
            if (sendResult.success) {
              logger.info(`SMS sent successfully for service: ${service.code}`);
              await this.notificationRepository.update(notification.id, { status: 'SENT', sentAt: new Date() });
            } else {
              logger.error(`Failed to send SMS for service: ${service.code}`, sendResult);
              await this.notificationRepository.update(notification.id, {
                status: 'FAILED',
                errorMessage: sendResult.error || 'Unknown error'
              });
            }
          } catch (sendError) {
            logger.error('Error sending notification:', sendError);
            await this.notificationRepository.update(notification.id, {
              status: 'FAILED',
              errorMessage: sendError.message
            });
          }
        } catch (notifError) {
          logger.error('Error creating notification:', notifError);
        }
      }

      return service;
    } catch (error) {
      logger.error('Error in CreateServiceUseCase:', error);
      throw error;
    }
  }
}
