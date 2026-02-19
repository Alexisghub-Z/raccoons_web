import { IServiceRepository } from '../../../core/domain/repositories/IServiceRepository.js';
import { Service } from '../../../core/domain/entities/Service.js';
import prisma from '../prisma-client.js';
import { DatabaseError, NotFoundError } from '../../../shared/errors/AppError.js';
import logger from '../../../shared/logger/index.js';

export class ServiceRepository extends IServiceRepository {
  async findById(id) {
    try {
      const service = await prisma.service.findUnique({
        where: { id },
        include: {
          customer: true,
          evidence: true,
          statusHistory: {
            orderBy: { changedAt: 'desc' }
          }
        }
      });

      if (!service) return null;
      return new Service(service);
    } catch (error) {
      logger.error('Error finding service by id:', error);
      throw new DatabaseError('Error finding service by id', error.message);
    }
  }

  async findByCode(code) {
    try {
      const service = await prisma.service.findUnique({
        where: { code },
        include: {
          customer: true,
          evidence: true,
          statusHistory: {
            orderBy: { changedAt: 'desc' }
          }
        }
      });

      if (!service) return null;
      return new Service(service);
    } catch (error) {
      logger.error('Error finding service by code:', error);
      throw new DatabaseError('Error finding service by code', error.message);
    }
  }

  async findByCustomerId(customerId) {
    try {
      const services = await prisma.service.findMany({
        where: { customerId },
        include: {
          customer: true,
          evidence: true,
          statusHistory: {
            orderBy: { changedAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return services.map(service => new Service(service));
    } catch (error) {
      logger.error('Error finding services by customer:', error);
      throw new DatabaseError('Error finding services by customer', error.message);
    }
  }

  async create(serviceData) {
    try {
      const service = await prisma.service.create({
        data: {
          code: serviceData.code || Service.generateCode(),
          customerId: serviceData.customerId,
          motorcycle: serviceData.motorcycle,
          brand: serviceData.brand,
          model: serviceData.model,
          year: serviceData.year,
          plate: serviceData.plate,
          serviceType: serviceData.serviceType,
          description: serviceData.description,
          status: serviceData.status || 'RECEIVED',
          estimatedCost: serviceData.estimatedCost,
          finalCost: serviceData.finalCost,
          estimatedDate: serviceData.estimatedDate,
          deliveryDate: serviceData.deliveryDate,
          notes: serviceData.notes,
          internalNotes: serviceData.internalNotes
        },
        include: {
          customer: true,
          evidence: true,
          statusHistory: true
        }
      });

      await prisma.serviceHistory.create({
        data: {
          serviceId: service.id,
          status: service.status,
          notes: 'Servicio creado',
          changedBy: serviceData.changedBy || 'system'
        }
      });

      return new Service(service);
    } catch (error) {
      logger.error('Error creating service:', error);
      if (error.code === 'P2002') {
        throw new DatabaseError('Service code already exists');
      }
      if (error.code === 'P2003') {
        throw new DatabaseError('Customer not found');
      }
      throw new DatabaseError('Error creating service', error.message);
    }
  }

  async update(id, serviceData) {
    try {
      const currentService = await prisma.service.findUnique({
        where: { id }
      });

      if (!currentService) {
        throw new NotFoundError('Service');
      }

      const service = await prisma.service.update({
        where: { id },
        data: {
          ...(serviceData.motorcycle && { motorcycle: serviceData.motorcycle }),
          ...(serviceData.brand && { brand: serviceData.brand }),
          ...(serviceData.model && { model: serviceData.model }),
          ...(serviceData.year && { year: serviceData.year }),
          ...(serviceData.plate && { plate: serviceData.plate }),
          ...(serviceData.serviceType && { serviceType: serviceData.serviceType }),
          ...(serviceData.description !== undefined && { description: serviceData.description }),
          ...(serviceData.status && { status: serviceData.status }),
          ...(serviceData.estimatedCost !== undefined && { estimatedCost: serviceData.estimatedCost }),
          ...(serviceData.finalCost !== undefined && { finalCost: serviceData.finalCost }),
          ...(serviceData.estimatedDate !== undefined && { estimatedDate: serviceData.estimatedDate }),
          ...(serviceData.deliveryDate !== undefined && { deliveryDate: serviceData.deliveryDate }),
          ...(serviceData.notes !== undefined && { notes: serviceData.notes }),
          ...(serviceData.internalNotes !== undefined && { internalNotes: serviceData.internalNotes })
        },
        include: {
          customer: true,
          evidence: true,
          statusHistory: {
            orderBy: { changedAt: 'desc' }
          }
        }
      });

      if (serviceData.status && serviceData.status !== currentService.status) {
        // Mapeo de estados a nombres legibles en español
        const statusNames = {
          'RECEIVED': 'Recibido',
          'IN_DIAGNOSIS': 'En Diagnóstico',
          'IN_REPAIR': 'En Reparación',
          'READY_FOR_PICKUP': 'Listo para Entrega',
          'DELIVERED': 'Entregado',
          'CANCELLED': 'Cancelado'
        };

        const statusName = statusNames[serviceData.status] || serviceData.status;

        await prisma.serviceHistory.create({
          data: {
            serviceId: id,
            status: serviceData.status,
            notes: serviceData.statusNotes || `Estado actualizado a: ${statusName}`,
            changedBy: serviceData.changedBy || 'system'
          }
        });
      }

      return new Service(service);
    } catch (error) {
      logger.error('Error updating service:', error);
      if (error.code === 'P2025') {
        throw new NotFoundError('Service');
      }
      throw new DatabaseError('Error updating service', error.message);
    }
  }

  async delete(id) {
    try {
      await prisma.service.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      logger.error('Error deleting service:', error);
      if (error.code === 'P2025') {
        throw new NotFoundError('Service');
      }
      throw new DatabaseError('Error deleting service', error.message);
    }
  }

  async findAll(filters = {}) {
    try {
      const where = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.statusIn) {
        where.status = { in: filters.statusIn };
      }

      if (filters.statusNotIn) {
        where.status = { notIn: filters.statusNotIn };
      }

      if (filters.customerId) {
        where.customerId = filters.customerId;
      }

      if (filters.search) {
        where.OR = [
          { code: { contains: filters.search, mode: 'insensitive' } },
          { motorcycle: { contains: filters.search, mode: 'insensitive' } },
          { plate: { contains: filters.search, mode: 'insensitive' } },
          { customer: { firstName: { contains: filters.search, mode: 'insensitive' } } },
          { customer: { lastName: { contains: filters.search, mode: 'insensitive' } } }
        ];
      }

      if (filters.dateFrom) {
        where.createdAt = { gte: new Date(filters.dateFrom) };
      }

      if (filters.dateTo) {
        where.createdAt = { ...where.createdAt, lte: new Date(filters.dateTo) };
      }

      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const skip = (page - 1) * limit;

      const [services, total] = await Promise.all([
        prisma.service.findMany({
          where,
          include: {
            customer: true,
            evidence: true,
            statusHistory: {
              orderBy: { changedAt: 'desc' },
              take: 1
            }
          },
          skip,
          take: limit,
          orderBy: filters.orderBy || { createdAt: 'desc' }
        }),
        prisma.service.count({ where })
      ]);

      return {
        data: services.map(service => new Service(service)),
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit
      };
    } catch (error) {
      logger.error('Error finding all services:', error);
      throw new DatabaseError('Error finding services', error.message);
    }
  }

  async getStatusCounts() {
    try {
      const counts = await prisma.service.groupBy({
        by: ['status'],
        _count: { status: true }
      });

      const result = {
        RECEIVED: 0,
        IN_DIAGNOSIS: 0,
        IN_REPAIR: 0,
        READY_FOR_PICKUP: 0,
        DELIVERED: 0,
        CANCELLED: 0
      };

      counts.forEach(c => {
        result[c.status] = c._count.status;
      });

      result.active = result.RECEIVED + result.IN_DIAGNOSIS + result.IN_REPAIR + result.READY_FOR_PICKUP;
      result.completed = result.DELIVERED + result.CANCELLED;
      result.total = result.active + result.completed;

      return result;
    } catch (error) {
      logger.error('Error getting status counts:', error);
      throw new DatabaseError('Error getting service stats', error.message);
    }
  }

  async findByStatus(status) {
    try {
      const services = await prisma.service.findMany({
        where: { status },
        include: {
          customer: true,
          evidence: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return services.map(service => new Service(service));
    } catch (error) {
      logger.error('Error finding services by status:', error);
      throw new DatabaseError('Error finding services by status', error.message);
    }
  }

  async addEvidence(serviceId, evidenceData) {
    try {
      const evidence = await prisma.serviceEvidence.create({
        data: {
          serviceId,
          type: evidenceData.type,
          url: evidenceData.url,
          description: evidenceData.description
        }
      });

      return evidence;
    } catch (error) {
      logger.error('Error adding service evidence:', error);
      if (error.code === 'P2003') {
        throw new NotFoundError('Service');
      }
      throw new DatabaseError('Error adding service evidence', error.message);
    }
  }

  async deleteEvidence(serviceId, evidenceId) {
    try {
      // Verificar que la evidencia pertenezca al servicio
      const evidence = await prisma.serviceEvidence.findUnique({
        where: { id: evidenceId }
      });

      if (!evidence) {
        throw new NotFoundError('Evidence');
      }

      if (evidence.serviceId !== serviceId) {
        throw new DatabaseError('Evidence does not belong to this service', 'INVALID_EVIDENCE');
      }

      // Eliminar la evidencia de la base de datos
      await prisma.serviceEvidence.delete({
        where: { id: evidenceId }
      });

      return evidence;
    } catch (error) {
      logger.error('Error deleting service evidence:', error);
      if (error.code === 'P2025') {
        throw new NotFoundError('Evidence');
      }
      throw error instanceof NotFoundError || error instanceof DatabaseError
        ? error
        : new DatabaseError('Error deleting service evidence', error.message);
    }
  }

  async addStatusHistory(serviceId, historyData) {
    try {
      const history = await prisma.serviceHistory.create({
        data: {
          serviceId,
          status: historyData.status,
          notes: historyData.notes,
          changedBy: historyData.changedBy || 'system'
        }
      });

      return history;
    } catch (error) {
      logger.error('Error adding service history:', error);
      if (error.code === 'P2003') {
        throw new NotFoundError('Service');
      }
      throw new DatabaseError('Error adding service history', error.message);
    }
  }
}
