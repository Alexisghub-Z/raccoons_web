import { NotFoundError, ValidationError } from '../../../shared/errors/AppError.js';
import { Service } from '../../domain/entities/Service.js';
import logger from '../../../shared/logger/index.js';
import notificationStrategy from '../../../infrastructure/messaging/notification-strategy.js';

export class UpdateServiceStatusUseCase {
  constructor(serviceRepository, notificationRepository) {
    this.serviceRepository = serviceRepository;
    this.notificationRepository = notificationRepository;
  }

  async execute(serviceId, newStatus, notes, changedBy) {
    try {
      const existingService = await this.serviceRepository.findById(serviceId);
      if (!existingService) {
        throw new NotFoundError('Service');
      }

      const serviceEntity = new Service(existingService);

      if (!serviceEntity.canUpdateStatus(newStatus)) {
        throw new ValidationError(
          `Cannot transition from ${serviceEntity.status} to ${newStatus}`
        );
      }

      const service = await this.serviceRepository.update(serviceId, {
        status: newStatus,
        statusNotes: notes,
        changedBy
      });

      logger.info(`Service status updated: ${service.code} -> ${newStatus}`);

      // Debug: verificar si tenemos customer
      logger.info(`Customer data:`, { hasCustomer: !!service.customer, customerId: service.customerId });

      // Enviar notificación por email al cliente
      if (this.notificationRepository && service.customer?.email) {
        try {
          const notifType = newStatus === 'READY_FOR_PICKUP'
            ? 'SERVICE_READY_FOR_PICKUP'
            : 'SERVICE_STATUS_UPDATED';

          const notification = await this.notificationRepository.create({
            userId: service.customer.id,
            type: notifType,
            channel: 'EMAIL',
            title: 'Estado Actualizado',
            message: `Tu servicio ${service.code} ha sido actualizado`,
            serviceId: service.id,
            metadata: {
              serviceCode: service.code,
              newStatus: newStatus,
              motorcycle: service.motorcycle
            }
          });
          logger.info(`Notification created for status update: ${service.code} -> ${newStatus}`);

          try {
            const sendResult = await notificationStrategy.sendNotification(notification, service.customer);
            if (sendResult.success) {
              logger.info(`Email sent successfully for status update: ${service.code} -> ${newStatus}`);
              await this.notificationRepository.update(notification.id, {
                status: 'SENT',
                sentAt: new Date()
              });
            } else {
              logger.error(`Failed to send email for status update: ${service.code}`, sendResult);
              await this.notificationRepository.update(notification.id, {
                status: 'FAILED',
                errorMessage: sendResult.error || 'Unknown error'
              });
            }
          } catch (sendError) {
            logger.error('Error sending status update notification:', sendError);
            await this.notificationRepository.update(notification.id, {
              status: 'FAILED',
              errorMessage: sendError.message
            });
          }
        } catch (notifError) {
          logger.error('Error creating status update notification:', notifError);
        }
      }

      return service;
    } catch (error) {
      logger.error('Error in UpdateServiceStatusUseCase:', error);
      throw error;
    }
  }
}
