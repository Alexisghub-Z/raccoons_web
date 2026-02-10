/**
 * Appointment Repository Interface
 */
export class IAppointmentRepository {
  async findById(id) {
    throw new Error('Method not implemented');
  }

  async findByCustomerId(customerId) {
    throw new Error('Method not implemented');
  }

  async create(appointmentData) {
    throw new Error('Method not implemented');
  }

  async update(id, appointmentData) {
    throw new Error('Method not implemented');
  }

  async delete(id) {
    throw new Error('Method not implemented');
  }

  async findAll(filters = {}) {
    throw new Error('Method not implemented');
  }

  async findByStatus(status) {
    throw new Error('Method not implemented');
  }

  async findByDateRange(startDate, endDate) {
    throw new Error('Method not implemented');
  }

  async findUpcoming() {
    throw new Error('Method not implemented');
  }

  async findNeedingReminders(hoursBeforeAppointment) {
    throw new Error('Method not implemented');
  }
}
