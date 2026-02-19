import { Router } from 'express';
import { ServiceController } from '../controllers/service.controller.js';
import { validate } from '../middlewares/validation.middleware.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { uploadEvidence, handleMulterError } from '../middlewares/upload.middleware.js';
import { createServiceSchema, updateServiceSchema, updateServiceStatusSchema } from '../validators/service.validators.js';

const router = Router();
const serviceController = new ServiceController();

router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'MECHANIC'),
  validate(createServiceSchema),
  (req, res, next) => serviceController.create(req, res, next)
);

router.get(
  '/',
  authenticate,
  (req, res, next) => serviceController.getAll(req, res, next)
);

router.get(
  '/stats',
  authenticate,
  authorize('ADMIN', 'MECHANIC'),
  (req, res, next) => serviceController.getStats(req, res, next)
);

router.get(
  '/code/:code',
  (req, res, next) => serviceController.getByCode(req, res, next)
);

router.get(
  '/:id',
  authenticate,
  (req, res, next) => serviceController.getById(req, res, next)
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'MECHANIC'),
  validate(updateServiceSchema),
  (req, res, next) => serviceController.update(req, res, next)
);

router.put(
  '/:id/status',
  authenticate,
  authorize('ADMIN', 'MECHANIC'),
  validate(updateServiceStatusSchema),
  (req, res, next) => serviceController.updateStatus(req, res, next)
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  (req, res, next) => serviceController.delete(req, res, next)
);

// Rutas para evidencias
router.post(
  '/:id/evidence',
  authenticate,
  authorize('ADMIN', 'MECHANIC'),
  uploadEvidence,
  handleMulterError,
  (req, res, next) => serviceController.uploadEvidence(req, res, next)
);

router.get(
  '/:id/evidence',
  authenticate,
  (req, res, next) => serviceController.getEvidence(req, res, next)
);

router.delete(
  '/:id/evidence/:evidenceId',
  authenticate,
  authorize('ADMIN', 'MECHANIC'),
  (req, res, next) => serviceController.deleteEvidence(req, res, next)
);

export default router;
