import { Router } from 'express';
import { ServiceController } from '../controllers/service.controller.js';
import { AuthorizationQuestionController } from '../controllers/authorization-question.controller.js';
import { validate } from '../middlewares/validation.middleware.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { uploadEvidence, uploadAuthAttachments, handleMulterError } from '../middlewares/upload.middleware.js';
import { createServiceSchema, updateServiceSchema, updateServiceStatusSchema } from '../validators/service.validators.js';
import { createAuthQuestionSchema, respondAuthQuestionSchema, replyAuthQuestionSchema } from '../validators/authorization-question.validators.js';

const router = Router();
const serviceController = new ServiceController();
const authQuestionController = new AuthorizationQuestionController();

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
  '/dashboard',
  authenticate,
  authorize('ADMIN', 'MECHANIC'),
  (req, res, next) => serviceController.getDashboard(req, res, next)
);

router.get(
  '/code/:code',
  (req, res, next) => serviceController.getByCode(req, res, next)
);

// Endpoint publico para que el cliente responda (antes de /:id para evitar conflicto)
router.put(
  '/authorization-questions/:questionId/respond',
  validate(respondAuthQuestionSchema),
  (req, res, next) => authQuestionController.respond(req, res, next)
);

// Endpoint admin para responder con mensaje
router.put(
  '/authorization-questions/:questionId/reply',
  authenticate,
  authorize('ADMIN', 'MECHANIC'),
  validate(replyAuthQuestionSchema),
  (req, res, next) => authQuestionController.reply(req, res, next)
);

// Endpoints para archivos adjuntos de autorizaciones
router.post(
  '/authorization-questions/:questionId/attachments',
  authenticate,
  authorize('ADMIN', 'MECHANIC'),
  uploadAuthAttachments,
  handleMulterError,
  (req, res, next) => authQuestionController.uploadAttachments(req, res, next)
);

router.delete(
  '/authorization-questions/attachments/:attachmentId',
  authenticate,
  authorize('ADMIN', 'MECHANIC'),
  (req, res, next) => authQuestionController.deleteAttachment(req, res, next)
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

// Rutas para preguntas de autorizacion
router.post(
  '/:id/authorization-questions',
  authenticate,
  authorize('ADMIN', 'MECHANIC'),
  validate(createAuthQuestionSchema),
  (req, res, next) => authQuestionController.create(req, res, next)
);

router.get(
  '/:id/authorization-questions',
  authenticate,
  (req, res, next) => authQuestionController.getByServiceId(req, res, next)
);

export default router;
