import { NotFoundError } from '../../../shared/errors/AppError.js';
import { Appointment } from '../../domain/entities/Appointment.js';
import logger from '../../../shared/logger/index.js';
import notificationStrategy from '../../../infrastructure/messaging/notification-strategy.js';

export class ConfirmAppointmentUseCase {
  constructor(appointmentRepository, notificationRepository = null, userRepository = null) {
    this.appointmentRepository = appointmentRepository;
    this.notificationRepository = notificationRepository;
    this.userRepository = userRepository;
  }

  async execute(appointmentId) {
    try {
      const existingAppointment = await this.appointmentRepository.findById(appointmentId);
      if (!existingAppointment) {
        throw new NotFoundError('Appointment');
      }

      const appointmentEntity = new Appointment(existingAppointment);
      appointmentEntity.confirm();

      const appointment = await this.appointmentRepository.update(appointmentId, {
        status: 'CONFIRMED'
      });

      logger.info(`Appointment confirmed: ${appointmentId}`);

      // Enviar notificación por email al cliente
      const customer = appointment.customer ||
        (this.userRepository ? await this.userRepository.findById(appointment.customerId) : null);

      if (this.notificationRepository && customer?.email) {
        try {
          const notification = await this.notificationRepository.create({
            userId: customer.id,
            type: 'APPOINTMENT_CONFIRMED',
            channel: 'EMAIL',
            title: 'Cita Confirmada',
            message: `Tu cita ha sido confirmada`,
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
            logger.info(`Confirmation email sent for appointment: ${appointmentId}`);
            await this.notificationRepository.update(notification.id, { status: 'SENT', sentAt: new Date() });
          } else {
            await this.notificationRepository.update(notification.id, {
              status: 'FAILED',
              errorMessage: sendResult.error || 'Unknown error'
            });
          }
        } catch (notifError) {
          logger.error('Error sending appointment confirmation notification:', notifError);
        }
      }

      return appointment;
    } catch (error) {
      logger.error('Error in ConfirmAppointmentUseCase:', error);
      throw error;
    }
  }
}
