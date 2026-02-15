import { ValidationError, NotFoundError } from '../../../shared/errors/AppError.js';
import logger from '../../../shared/logger/index.js';
import notificationStrategy from '../../../infrastructure/messaging/notification-strategy.js';

export class CreateAppointmentUseCase {
  constructor(appointmentRepository, userRepository, notificationRepository = null) {
    this.appointmentRepository = appointmentRepository;
    this.userRepository = userRepository;
    this.notificationRepository = notificationRepository;
  }

  async execute(appointmentData) {
    try {
      if (!appointmentData.customerId || !appointmentData.scheduledDate ||
          !appointmentData.motorcycle || !appointmentData.serviceType) {
        throw new ValidationError(
          'CustomerId, scheduledDate, motorcycle and serviceType are required'
        );
      }

      const customer = await this.userRepository.findById(appointmentData.customerId);
      if (!customer) {
        throw new NotFoundError('Customer');
      }

      const scheduledDate = new Date(appointmentData.scheduledDate);
      if (scheduledDate < new Date()) {
        throw new ValidationError('Scheduled date must be in the future');
      }

      const appointment = await this.appointmentRepository.create({
        ...appointmentData,
        status: 'PENDING'
      });

      logger.info(`Appointment created for customer: ${customer.email}`);

      // Enviar notificación por email al cliente
      if (this.notificationRepository && customer.email) {
        try {
          const notification = await this.notificationRepository.create({
            userId: customer.id,
            type: 'APPOINTMENT_CREATED',
            channel: 'EMAIL',
            title: 'Cita Registrada',
            message: `Tu cita ha sido registrada`,
            appointmentId: appointment.id,
            metadata: {
              appointmentData: {
                scheduledDate: appointment.scheduledDate,
                motorcycle: appointment.motorcycle,
                serviceType: appointment.serviceType,
                notes: appointment.notes,
              }
            }
          });

          const sendResult = await notificationStrategy.sendNotification(notification, customer);
          if (sendResult.success) {
            logger.info(`Appointment creation email sent for customer: ${customer.email}`);
            await this.notificationRepository.update(notification.id, { status: 'SENT', sentAt: new Date() });
          } else {
            await this.notificationRepository.update(notification.id, {
              status: 'FAILED',
              errorMessage: sendResult.error || 'Unknown error'
            });
          }
        } catch (notifError) {
          logger.error('Error sending appointment creation notification:', notifError);
        }
      }

      return appointment;
    } catch (error) {
      logger.error('Error in CreateAppointmentUseCase:', error);
      throw error;
    }
  }
}
