/**
 * Service Repository Interface
 */
export class IServiceRepository {
  async findById(id) {
    throw new Error('Method not implemented');
  }

  async findByCode(code) {
    throw new Error('Method not implemented');
  }

  async findByCustomerId(customerId) {
    throw new Error('Method not implemented');
  }

  async create(serviceData) {
    throw new Error('Method not implemented');
  }

  async update(id, serviceData) {
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

  async addEvidence(serviceId, evidenceData) {
    throw new Error('Method not implemented');
  }

  async addStatusHistory(serviceId, historyData) {
    throw new Error('Method not implemented');
  }
}
