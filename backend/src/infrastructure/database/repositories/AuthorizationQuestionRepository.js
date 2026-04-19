import { IAuthorizationQuestionRepository } from '../../../core/domain/repositories/IAuthorizationQuestionRepository.js';
import { AuthorizationQuestion } from '../../../core/domain/entities/AuthorizationQuestion.js';
import prisma from '../prisma-client.js';
import { DatabaseError, NotFoundError } from '../../../shared/errors/AppError.js';
import logger from '../../../shared/logger/index.js';

const QUESTION_INCLUDE = {
  service: { include: { customer: true } },
  attachments: { orderBy: { createdAt: 'asc' } }
};

export class AuthorizationQuestionRepository extends IAuthorizationQuestionRepository {
  async findById(id) {
    try {
      const question = await prisma.authorizationQuestion.findUnique({
        where: { id },
        include: QUESTION_INCLUDE
      });

      if (!question) return null;
      return new AuthorizationQuestion(question);
    } catch (error) {
      logger.error('Error finding authorization question by id:', error);
      throw new DatabaseError('Error finding authorization question', error.message);
    }
  }

  async findByServiceId(serviceId) {
    try {
      const questions = await prisma.authorizationQuestion.findMany({
        where: { serviceId },
        orderBy: { createdAt: 'asc' },
        include: { attachments: { orderBy: { createdAt: 'asc' } } }
      });

      return questions.map(q => new AuthorizationQuestion(q));
    } catch (error) {
      logger.error('Error finding authorization questions by service:', error);
      throw new DatabaseError('Error finding authorization questions', error.message);
    }
  }

  async create(data) {
    try {
      const question = await prisma.authorizationQuestion.create({
        data: {
          serviceId: data.serviceId,
          question: data.question
        },
        include: QUESTION_INCLUDE
      });

      return new AuthorizationQuestion(question);
    } catch (error) {
      logger.error('Error creating authorization question:', error);
      if (error.code === 'P2003') {
        throw new NotFoundError('Service');
      }
      throw new DatabaseError('Error creating authorization question', error.message);
    }
  }

  async addAttachments(questionId, attachments) {
    try {
      await prisma.authorizationAttachment.createMany({
        data: attachments.map(a => ({
          questionId,
          type: a.type,
          url: a.url,
          filename: a.filename
        }))
      });

      const question = await prisma.authorizationQuestion.findUnique({
        where: { id: questionId },
        include: { attachments: { orderBy: { createdAt: 'asc' } } }
      });

      return new AuthorizationQuestion(question);
    } catch (error) {
      logger.error('Error adding attachments:', error);
      if (error.code === 'P2003') {
        throw new NotFoundError('AuthorizationQuestion');
      }
      throw new DatabaseError('Error adding attachments', error.message);
    }
  }

  async deleteAttachment(attachmentId) {
    try {
      const attachment = await prisma.authorizationAttachment.delete({
        where: { id: attachmentId }
      });
      return attachment;
    } catch (error) {
      logger.error('Error deleting attachment:', error);
      if (error.code === 'P2025') {
        throw new NotFoundError('AuthorizationAttachment');
      }
      throw new DatabaseError('Error deleting attachment', error.message);
    }
  }

  async updateAdminMessage(id, adminMessage) {
    try {
      const question = await prisma.authorizationQuestion.update({
        where: { id },
        data: { adminMessage, adminMessageAt: new Date() },
        include: { attachments: { orderBy: { createdAt: 'asc' } } }
      });
      return new AuthorizationQuestion(question);
    } catch (error) {
      logger.error('Error updating admin message:', error);
      if (error.code === 'P2025') {
        throw new NotFoundError('AuthorizationQuestion');
      }
      throw new DatabaseError('Error updating admin message', error.message);
    }
  }

  async updateResponse(id, response, customerMessage) {
    try {
      const question = await prisma.authorizationQuestion.update({
        where: { id },
        data: {
          response,
          customerMessage: customerMessage || null,
          respondedAt: new Date()
        },
        include: QUESTION_INCLUDE
      });

      return new AuthorizationQuestion(question);
    } catch (error) {
      logger.error('Error updating authorization question response:', error);
      if (error.code === 'P2025') {
        throw new NotFoundError('AuthorizationQuestion');
      }
      throw new DatabaseError('Error updating authorization question', error.message);
    }
  }
}
