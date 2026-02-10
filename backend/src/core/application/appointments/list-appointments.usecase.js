import logger from '../../../shared/logger/index.js';

export class ListAppointmentsUseCase {
  constructor(appointmentRepository) {
    this.appointmentRepository = appointmentRepository;
  }

  async execute(filters = {}) {
    try {
      const appointments = await this.appointmentRepository.findAll(filters);

      logger.info(`Appointments listed: ${appointments.length} results`);

      return appointments;
    } catch (error) {
      logger.error('Error in ListAppointmentsUseCase:', error);
      throw error;
    }
  }
}
