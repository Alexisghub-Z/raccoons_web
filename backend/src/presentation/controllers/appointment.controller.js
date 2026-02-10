import { AppointmentRepository } from '../../infrastructure/database/repositories/AppointmentRepository.js';
import { UserRepository } from '../../infrastructure/database/repositories/UserRepository.js';
import { CreateAppointmentUseCase } from '../../core/application/appointments/create-appointment.usecase.js';
import { ConfirmAppointmentUseCase } from '../../core/application/appointments/confirm-appointment.usecase.js';
import { CancelAppointmentUseCase } from '../../core/application/appointments/cancel-appointment.usecase.js';
import { ListAppointmentsUseCase } from '../../core/application/appointments/list-appointments.usecase.js';

const appointmentRepository = new AppointmentRepository();
const userRepository = new UserRepository();

export class AppointmentController {
  async create(req, res, next) {
    try {
      const createAppointmentUseCase = new CreateAppointmentUseCase(
        appointmentRepository,
        userRepository
      );
      const appointment = await createAppointmentUseCase.execute(req.validatedBody || req.body);

      res.status(201).json({
        success: true,
        data: appointment,
        message: 'Appointment created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const listAppointmentsUseCase = new ListAppointmentsUseCase(appointmentRepository);
      const filters = {
        status: req.query.status,
        customerId: req.query.customerId,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        offset: parseInt(req.query.offset) || 0,
        limit: parseInt(req.query.limit) || 20
      };

      const appointments = await listAppointmentsUseCase.execute(filters);

      res.status(200).json({
        success: true,
        data: appointments,
        message: 'Appointments retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const appointment = await appointmentRepository.findById(req.params.id);

      res.status(200).json({
        success: true,
        data: appointment,
        message: 'Appointment retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async confirm(req, res, next) {
    try {
      const confirmAppointmentUseCase = new ConfirmAppointmentUseCase(appointmentRepository);
      const appointment = await confirmAppointmentUseCase.execute(req.params.id);

      res.status(200).json({
        success: true,
        data: appointment,
        message: 'Appointment confirmed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req, res, next) {
    try {
      const cancelAppointmentUseCase = new CancelAppointmentUseCase(appointmentRepository);
      const { reason } = req.validatedBody || req.body;
      const appointment = await cancelAppointmentUseCase.execute(req.params.id, reason);

      res.status(200).json({
        success: true,
        data: appointment,
        message: 'Appointment cancelled successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await appointmentRepository.delete(req.params.id);

      res.status(200).json({
        success: true,
        data: null,
        message: 'Appointment deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getUpcoming(req, res, next) {
    try {
      const appointments = await appointmentRepository.findUpcoming();

      res.status(200).json({
        success: true,
        data: appointments,
        message: 'Upcoming appointments retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
