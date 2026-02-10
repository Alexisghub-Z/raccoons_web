import { UserRepository } from '../../infrastructure/database/repositories/UserRepository.js';
import { RegisterUseCase } from '../../core/application/auth/register.usecase.js';
import { LoginUseCase } from '../../core/application/auth/login.usecase.js';
import { RefreshTokenUseCase } from '../../core/application/auth/refresh-token.usecase.js';
import { LogoutUseCase } from '../../core/application/auth/logout.usecase.js';

const userRepository = new UserRepository();

export class AuthController {
  async register(req, res, next) {
    try {
      const registerUseCase = new RegisterUseCase(userRepository);
      const result = await registerUseCase.execute(req.validatedBody || req.body);

      res.status(201).json({
        success: true,
        data: result,
        message: 'User registered successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const loginUseCase = new LoginUseCase(userRepository);
      const result = await loginUseCase.execute(req.validatedBody || req.body);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Login successful'
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const refreshTokenUseCase = new RefreshTokenUseCase(userRepository);
      const result = await refreshTokenUseCase.execute(req.validatedBody || req.body);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const logoutUseCase = new LogoutUseCase();
      const result = await logoutUseCase.execute(req.body);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      const user = await userRepository.findById(req.user.id);

      res.status(200).json({
        success: true,
        data: user ? user.toJSON() : null,
        message: 'User retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
