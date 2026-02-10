import { NotFoundError } from '../../../shared/errors/AppError.js';
import logger from '../../../shared/logger/index.js';

export class UpdateServiceUseCase {
  constructor(serviceRepository) {
    this.serviceRepository = serviceRepository;
  }

  async execute(serviceId, updateData) {
    try {
      const existingService = await this.serviceRepository.findById(serviceId);
      if (!existingService) {
        throw new NotFoundError('Service');
      }

      const service = await this.serviceRepository.update(serviceId, updateData);

      logger.info(`Service updated: ${service.code}`);

      return service;
    } catch (error) {
      logger.error('Error in UpdateServiceUseCase:', error);
      throw error;
    }
  }
}
