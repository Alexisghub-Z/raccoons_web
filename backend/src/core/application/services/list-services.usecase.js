import logger from '../../../shared/logger/index.js';

export class ListServicesUseCase {
  constructor(serviceRepository) {
    this.serviceRepository = serviceRepository;
  }

  async execute(filters = {}) {
    try {
      const result = await this.serviceRepository.findAll(filters);

      logger.info(`Services listed: ${result.data.length} of ${result.total} results (page ${result.page}/${result.totalPages})`);

      return result;
    } catch (error) {
      logger.error('Error in ListServicesUseCase:', error);
      throw error;
    }
  }
}
