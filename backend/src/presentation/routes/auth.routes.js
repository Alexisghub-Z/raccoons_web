import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validation.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/auth.validators.js';

const router = Router();
const authController = new AuthController();

router.post('/register', validate(registerSchema), (req, res, next) => 
  authController.register(req, res, next)
);

router.post('/login', validate(loginSchema), (req, res, next) => 
  authController.login(req, res, next)
);

router.post('/refresh', validate(refreshTokenSchema), (req, res, next) => 
  authController.refreshToken(req, res, next)
);

router.post('/logout', (req, res, next) => 
  authController.logout(req, res, next)
);

router.get('/me', authenticate, (req, res, next) => 
  authController.me(req, res, next)
);

export default router;
