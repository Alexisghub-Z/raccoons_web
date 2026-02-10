import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller.js';
import { validate } from '../middlewares/validation.middleware.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { createAppointmentSchema, cancelAppointmentSchema } from '../validators/appointment.validators.js';

const router = Router();
const appointmentController = new AppointmentController();

router.post(
  '/',
  authenticate,
  validate(createAppointmentSchema),
  (req, res, next) => appointmentController.create(req, res, next)
);

router.get(
  '/',
  authenticate,
  (req, res, next) => appointmentController.getAll(req, res, next)
);

router.get(
  '/upcoming',
  authenticate,
  authorize('ADMIN', 'MECHANIC'),
  (req, res, next) => appointmentController.getUpcoming(req, res, next)
);

router.get(
  '/:id',
  authenticate,
  (req, res, next) => appointmentController.getById(req, res, next)
);

router.put(
  '/:id/confirm',
  authenticate,
  authorize('ADMIN', 'MECHANIC'),
  (req, res, next) => appointmentController.confirm(req, res, next)
);

router.put(
  '/:id/cancel',
  authenticate,
  validate(cancelAppointmentSchema),
  (req, res, next) => appointmentController.cancel(req, res, next)
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  (req, res, next) => appointmentController.delete(req, res, next)
);

export default router;
