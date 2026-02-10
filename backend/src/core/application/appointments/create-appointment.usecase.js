import { ValidationError, NotFoundError } from '../../../shared/errors/AppError.js';
import logger from '../../../shared/logger/index.js';

export class CreateAppointmentUseCase {
  constructor(appointmentRepository, userRepository) {
    this.appointmentRepository = appointmentRepository;
    this.userRepository = userRepository;
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

      return appointment;
    } catch (error) {
      logger.error('Error in CreateAppointmentUseCase:', error);
      throw error;
    }
  }
}
