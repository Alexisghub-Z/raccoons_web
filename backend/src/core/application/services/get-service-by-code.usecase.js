import { NotFoundError } from '../../../shared/errors/AppError.js';
import logger from '../../../shared/logger/index.js';

export class GetServiceByCodeUseCase {
  constructor(serviceRepository) {
    this.serviceRepository = serviceRepository;
  }

  async execute(code) {
    try {
      const service = await this.serviceRepository.findByCode(code);
      
      if (!service) {
        throw new NotFoundError('Service');
      }

      logger.info(`Service retrieved by code: ${code}`);

      return service;
    } catch (error) {
      logger.error('Error in GetServiceByCodeUseCase:', error);
      throw error;
    }
  }
}
