import { IAppointmentRepository } from '../../../core/domain/repositories/IAppointmentRepository.js';
import { Appointment } from '../../../core/domain/entities/Appointment.js';
import prisma from '../prisma-client.js';
import { DatabaseError, NotFoundError } from '../../../shared/errors/AppError.js';
import logger from '../../../shared/logger/index.js';

export class AppointmentRepository extends IAppointmentRepository {
  async findById(id) {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
          customer: true
        }
      });

      if (!appointment) return null;
      return new Appointment(appointment);
    } catch (error) {
      logger.error('Error finding appointment by id:', error);
      throw new DatabaseError('Error finding appointment by id', error.message);
    }
  }

  async findByCustomerId(customerId) {
    try {
      const appointments = await prisma.appointment.findMany({
        where: { customerId },
        include: {
          customer: true
        },
        orderBy: { scheduledDate: 'desc' }
      });

      return appointments.map(appointment => new Appointment(appointment));
    } catch (error) {
      logger.error('Error finding appointments by customer:', error);
      throw new DatabaseError('Error finding appointments by customer', error.message);
    }
  }

  async create(appointmentData) {
    try {
      const appointment = await prisma.appointment.create({
        data: {
          customerId: appointmentData.customerId,
          scheduledDate: new Date(appointmentData.scheduledDate),
          motorcycle: appointmentData.motorcycle,
          serviceType: appointmentData.serviceType,
          description: appointmentData.description,
          status: appointmentData.status || 'PENDING',
          reminderSent: appointmentData.reminderSent || false,
          googleEventId: appointmentData.googleEventId,
          notes: appointmentData.notes
        },
        include: {
          customer: true
        }
      });

      return new Appointment(appointment);
    } catch (error) {
      logger.error('Error creating appointment:', error);
      if (error.code === 'P2003') {
        throw new DatabaseError('Customer not found');
      }
      throw new DatabaseError('Error creating appointment', error.message);
    }
  }

  async update(id, appointmentData) {
    try {
      const appointment = await prisma.appointment.update({
        where: { id },
        data: {
          ...(appointmentData.scheduledDate && { 
            scheduledDate: new Date(appointmentData.scheduledDate) 
          }),
          ...(appointmentData.motorcycle && { motorcycle: appointmentData.motorcycle }),
          ...(appointmentData.serviceType && { serviceType: appointmentData.serviceType }),
          ...(appointmentData.description !== undefined && { description: appointmentData.description }),
          ...(appointmentData.status && { status: appointmentData.status }),
          ...(appointmentData.reminderSent !== undefined && { reminderSent: appointmentData.reminderSent }),
          ...(appointmentData.googleEventId !== undefined && { googleEventId: appointmentData.googleEventId }),
          ...(appointmentData.notes !== undefined && { notes: appointmentData.notes }),
          ...(appointmentData.cancellationReason !== undefined && { 
            cancellationReason: appointmentData.cancellationReason 
          })
        },
        include: {
          customer: true
        }
      });

      return new Appointment(appointment);
    } catch (error) {
      logger.error('Error updating appointment:', error);
      if (error.code === 'P2025') {
        throw new NotFoundError('Appointment');
      }
      throw new DatabaseError('Error updating appointment', error.message);
    }
  }

  async delete(id) {
    try {
      await prisma.appointment.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      logger.error('Error deleting appointment:', error);
      if (error.code === 'P2025') {
        throw new NotFoundError('Appointment');
      }
      throw new DatabaseError('Error deleting appointment', error.message);
    }
  }

  async findAll(filters = {}) {
    try {
      const where = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.customerId) {
        where.customerId = filters.customerId;
      }

      if (filters.dateFrom) {
        where.scheduledDate = { gte: new Date(filters.dateFrom) };
      }

      if (filters.dateTo) {
        where.scheduledDate = {
          ...where.scheduledDate,
          lte: new Date(filters.dateTo)
        };
      }

      const appointments = await prisma.appointment.findMany({
        where,
        include: {
          customer: true
        },
        skip: filters.offset || 0,
        take: filters.limit || 100,
        orderBy: filters.orderBy || { scheduledDate: 'asc' }
      });

      return appointments.map(appointment => new Appointment(appointment));
    } catch (error) {
      logger.error('Error finding all appointments:', error);
      throw new DatabaseError('Error finding appointments', error.message);
    }
  }

  async findByStatus(status) {
    try {
      const appointments = await prisma.appointment.findMany({
        where: { status },
        include: {
          customer: true
        },
        orderBy: { scheduledDate: 'asc' }
      });

      return appointments.map(appointment => new Appointment(appointment));
    } catch (error) {
      logger.error('Error finding appointments by status:', error);
      throw new DatabaseError('Error finding appointments by status', error.message);
    }
  }

  async findByDateRange(startDate, endDate) {
    try {
      const appointments = await prisma.appointment.findMany({
        where: {
          scheduledDate: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        },
        include: {
          customer: true
        },
        orderBy: { scheduledDate: 'asc' }
      });

      return appointments.map(appointment => new Appointment(appointment));
    } catch (error) {
      logger.error('Error finding appointments by date range:', error);
      throw new DatabaseError('Error finding appointments by date range', error.message);
    }
  }

  async findUpcoming() {
    try {
      const now = new Date();
      const appointments = await prisma.appointment.findMany({
        where: {
          scheduledDate: {
            gte: now
          },
          status: {
            in: ['PENDING', 'CONFIRMED']
          }
        },
        include: {
          customer: true
        },
        orderBy: { scheduledDate: 'asc' }
      });

      return appointments.map(appointment => new Appointment(appointment));
    } catch (error) {
      logger.error('Error finding upcoming appointments:', error);
      throw new DatabaseError('Error finding upcoming appointments', error.message);
    }
  }

  async findNeedingReminders(hoursBeforeAppointment = 24) {
    try {
      const now = new Date();
      const reminderTime = new Date();
      reminderTime.setHours(reminderTime.getHours() + hoursBeforeAppointment);

      const appointments = await prisma.appointment.findMany({
        where: {
          scheduledDate: {
            gte: now,
            lte: reminderTime
          },
          status: 'CONFIRMED',
          reminderSent: false
        },
        include: {
          customer: true
        },
        orderBy: { scheduledDate: 'asc' }
      });

      return appointments.map(appointment => new Appointment(appointment));
    } catch (error) {
      logger.error('Error finding appointments needing reminders:', error);
      throw new DatabaseError('Error finding appointments needing reminders', error.message);
    }
  }
}
