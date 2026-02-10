import { NotFoundError } from '../../../shared/errors/AppError.js';
import { Appointment } from '../../domain/entities/Appointment.js';
import logger from '../../../shared/logger/index.js';

export class ConfirmAppointmentUseCase {
  constructor(appointmentRepository) {
    this.appointmentRepository = appointmentRepository;
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

      return appointment;
    } catch (error) {
      logger.error('Error in ConfirmAppointmentUseCase:', error);
      throw error;
    }
  }
}
