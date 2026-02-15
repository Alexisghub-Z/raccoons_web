import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();
const authController = new AuthController();

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/v1/users - Obtener todos los usuarios
router.get('/', authController.getAllUsers.bind(authController));

// GET /api/v1/users/:id - Obtener usuario por ID
router.get('/:id', authController.getUserById.bind(authController));

// PUT /api/v1/users/:id - Actualizar usuario
router.put('/:id', authController.updateUser.bind(authController));

// DELETE /api/v1/users/:id - Eliminar usuario
router.delete('/:id', authController.deleteUser.bind(authController));

export default router;
