import { NotFoundError, ValidationError } from '../../../shared/errors/AppError.js';
import { Appointment } from '../../domain/entities/Appointment.js';
import logger from '../../../shared/logger/index.js';

export class CancelAppointmentUseCase {
  constructor(appointmentRepository) {
    this.appointmentRepository = appointmentRepository;
  }

  async execute(appointmentId, reason) {
    try {
      if (!reason) {
        throw new ValidationError('Cancellation reason is required');
      }

      const existingAppointment = await this.appointmentRepository.findById(appointmentId);
      if (!existingAppointment) {
        throw new NotFoundError('Appointment');
      }

      const appointmentEntity = new Appointment(existingAppointment);
      appointmentEntity.cancel(reason);

      const appointment = await this.appointmentRepository.update(appointmentId, {
        status: 'CANCELLED',
        cancellationReason: reason
      });

      logger.info(`Appointment cancelled: ${appointmentId}`);

      return appointment;
    } catch (error) {
      logger.error('Error in CancelAppointmentUseCase:', error);
      throw error;
    }
  }
}
