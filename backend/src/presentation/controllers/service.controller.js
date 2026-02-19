import { ServiceRepository } from '../../infrastructure/database/repositories/ServiceRepository.js';
import { UserRepository } from '../../infrastructure/database/repositories/UserRepository.js';
import { NotificationRepository } from '../../infrastructure/database/repositories/NotificationRepository.js';
import { CreateServiceUseCase } from '../../core/application/services/create-service.usecase.js';
import { UpdateServiceUseCase } from '../../core/application/services/update-service.usecase.js';
import { UpdateServiceStatusUseCase } from '../../core/application/services/update-service-status.usecase.js';
import { GetServiceByCodeUseCase } from '../../core/application/services/get-service-by-code.usecase.js';
import { ListServicesUseCase } from '../../core/application/services/list-services.usecase.js';

const serviceRepository = new ServiceRepository();
const userRepository = new UserRepository();
const notificationRepository = new NotificationRepository();

export class ServiceController {
  async create(req, res, next) {
    try {
      const createServiceUseCase = new CreateServiceUseCase(
        serviceRepository,
        userRepository,
        notificationRepository
      );
      const service = await createServiceUseCase.execute({
        ...req.validatedBody || req.body,
        changedBy: req.user?.id
      });

      res.status(201).json({
        success: true,
        data: service,
        message: 'Service created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const listServicesUseCase = new ListServicesUseCase(serviceRepository);
      const filters = {
        status: req.query.status,
        customerId: req.query.customerId,
        search: req.query.search,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      // Support comma-separated status lists
      if (req.query.statusIn) {
        filters.statusIn = req.query.statusIn.split(',');
        delete filters.status;
      }
      if (req.query.statusNotIn) {
        filters.statusNotIn = req.query.statusNotIn.split(',');
        delete filters.status;
      }

      const result = await listServicesUseCase.execute(filters);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          limit: result.limit
        },
        message: 'Services retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await serviceRepository.getStatusCounts();

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Service stats retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const service = await serviceRepository.findById(req.params.id);

      res.status(200).json({
        success: true,
        data: service,
        message: 'Service retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getByCode(req, res, next) {
    try {
      const getServiceByCodeUseCase = new GetServiceByCodeUseCase(serviceRepository);
      const service = await getServiceByCodeUseCase.execute(req.params.code);

      res.status(200).json({
        success: true,
        data: service,
        message: 'Service retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const updateServiceUseCase = new UpdateServiceUseCase(serviceRepository);
      const service = await updateServiceUseCase.execute(
        req.params.id,
        { ...req.validatedBody || req.body, changedBy: req.user?.id }
      );

      res.status(200).json({
        success: true,
        data: service,
        message: 'Service updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const updateServiceStatusUseCase = new UpdateServiceStatusUseCase(
        serviceRepository,
        notificationRepository
      );
      const { status, notes } = req.validatedBody || req.body;

      const service = await updateServiceStatusUseCase.execute(
        req.params.id,
        status,
        notes,
        req.user?.id
      );

      res.status(200).json({
        success: true,
        data: service,
        message: 'Service status updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await serviceRepository.delete(req.params.id);

      res.status(200).json({
        success: true,
        data: null,
        message: 'Service deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadEvidence(req, res, next) {
    try {
      const serviceId = req.params.id;
      const { description } = req.body;
      const files = req.files;

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'No se han subido archivos',
            code: 'NO_FILES'
          }
        });
      }

      const evidences = [];
      for (const file of files) {
        const evidenceData = {
          type: file.mimetype.startsWith('image/') ? 'IMAGE' : 'PDF',
          url: `/uploads/evidence/${file.filename}`,
          description: description || `Evidencia - ${file.originalname}`
        };

        const evidence = await serviceRepository.addEvidence(serviceId, evidenceData);
        evidences.push(evidence);
      }

      res.status(201).json({
        success: true,
        data: evidences,
        message: 'Evidencias subidas correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  async getEvidence(req, res, next) {
    try {
      const service = await serviceRepository.findById(req.params.id);

      if (!service) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Servicio no encontrado',
            code: 'NOT_FOUND'
          }
        });
      }

      res.status(200).json({
        success: true,
        data: service.evidence || [],
        message: 'Evidencias obtenidas correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteEvidence(req, res, next) {
    try {
      const { id, evidenceId } = req.params;

      // Eliminar la evidencia de la base de datos
      const evidence = await serviceRepository.deleteEvidence(id, evidenceId);

      // Intentar eliminar el archivo físico del sistema de archivos
      if (evidence && evidence.url) {
        const fs = await import('fs/promises');
        const path = await import('path');
        const filePath = path.join(process.cwd(), evidence.url);

        try {
          await fs.unlink(filePath);
        } catch (fileError) {
          // Si no se puede eliminar el archivo, solo registrarlo pero no fallar
          console.error('Error eliminando archivo físico:', fileError.message);
        }
      }

      res.status(200).json({
        success: true,
        data: evidence,
        message: 'Evidencia eliminada correctamente'
      });
    } catch (error) {
      next(error);
    }
  }
}
