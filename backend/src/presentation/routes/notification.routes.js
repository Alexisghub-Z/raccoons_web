import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();
const notificationController = new NotificationController();

router.get(
  '/',
  authenticate,
  (req, res, next) => notificationController.getAll(req, res, next)
);

router.get(
  '/unread',
  authenticate,
  (req, res, next) => notificationController.getUnread(req, res, next)
);

router.get(
  '/:id',
  authenticate,
  (req, res, next) => notificationController.getById(req, res, next)
);

router.put(
  '/:id/read',
  authenticate,
  (req, res, next) => notificationController.markAsRead(req, res, next)
);

router.delete(
  '/:id',
  authenticate,
  (req, res, next) => notificationController.delete(req, res, next)
);

export default router;
