import logger from '../../../shared/logger/index.js';

export class ListServicesUseCase {
  constructor(serviceRepository) {
    this.serviceRepository = serviceRepository;
  }

  async execute(filters = {}) {
    try {
      const services = await this.serviceRepository.findAll(filters);

      logger.info(`Services listed: ${services.length} results`);

      return services;
    } catch (error) {
      logger.error('Error in ListServicesUseCase:', error);
      throw error;
    }
  }
}
