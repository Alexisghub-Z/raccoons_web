import { ServiceRepository } from '../../infrastructure/database/repositories/ServiceRepository.js';
import { NotificationRepository } from '../../infrastructure/database/repositories/NotificationRepository.js';
import { UserRepository } from '../../infrastructure/database/repositories/UserRepository.js';
import { AuthorizationQuestionRepository } from '../../infrastructure/database/repositories/AuthorizationQuestionRepository.js';
import { CreateAuthorizationQuestionUseCase } from '../../core/application/authorization-questions/create-authorization-question.usecase.js';
import { RespondAuthorizationQuestionUseCase } from '../../core/application/authorization-questions/respond-authorization-question.usecase.js';

const serviceRepository = new ServiceRepository();
const notificationRepository = new NotificationRepository();
const userRepository = new UserRepository();
const authQuestionRepository = new AuthorizationQuestionRepository();

export class AuthorizationQuestionController {
  async create(req, res, next) {
    try {
      const useCase = new CreateAuthorizationQuestionUseCase(
        authQuestionRepository,
        serviceRepository,
        notificationRepository
      );
      const question = await useCase.execute({
        serviceId: req.params.id,
        question: req.validatedBody?.question || req.body.question
      });

      res.status(201).json({
        success: true,
        data: question,
        message: 'Authorization question created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getByServiceId(req, res, next) {
    try {
      const questions = await authQuestionRepository.findByServiceId(req.params.id);

      res.status(200).json({
        success: true,
        data: questions
      });
    } catch (error) {
      next(error);
    }
  }

  async reply(req, res, next) {
    try {
      const { questionId } = req.params;
      const { message } = req.validatedBody || req.body;
      const question = await authQuestionRepository.updateAdminMessage(questionId, message);

      res.status(200).json({
        success: true,
        data: question,
        message: 'Admin reply saved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadAttachments(req, res, next) {
    try {
      const { questionId } = req.params;
      const files = req.files;

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'No se enviaron archivos', code: 'NO_FILES' }
        });
      }

      const question = await authQuestionRepository.findById(questionId);
      if (!question) {
        return res.status(404).json({
          success: false,
          error: { message: 'Pregunta no encontrada', code: 'NOT_FOUND' }
        });
      }

      const attachments = files.map(file => ({
        type: file.mimetype.startsWith('image/') ? 'IMAGE' : 'PDF',
        url: `/uploads/authorizations/${file.filename}`,
        filename: file.originalname
      }));

      const updated = await authQuestionRepository.addAttachments(questionId, attachments);

      res.status(201).json({
        success: true,
        data: updated,
        message: 'Archivos subidos correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAttachment(req, res, next) {
    try {
      const { attachmentId } = req.params;
      const attachment = await authQuestionRepository.deleteAttachment(attachmentId);

      if (attachment && attachment.url) {
        const fs = await import('fs/promises');
        const path = await import('path');
        const filePath = path.join(process.cwd(), attachment.url);
        try {
          await fs.unlink(filePath);
        } catch (fileError) {
          console.error('Error eliminando archivo:', fileError.message);
        }
      }

      res.status(200).json({
        success: true,
        data: attachment,
        message: 'Archivo eliminado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  async respond(req, res, next) {
    try {
      const useCase = new RespondAuthorizationQuestionUseCase(
        authQuestionRepository,
        notificationRepository,
        userRepository
      );
      const body = req.validatedBody || req.body;
      const question = await useCase.execute(
        req.params.questionId,
        body.response,
        body.customerMessage
      );

      res.status(200).json({
        success: true,
        data: question,
        message: 'Response recorded successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
