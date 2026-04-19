import { ValidationError, NotFoundError } from '../../../shared/errors/AppError.js';
import logger from '../../../shared/logger/index.js';

export class RespondAuthorizationQuestionUseCase {
  constructor(authQuestionRepository, notificationRepository, userRepository) {
    this.authQuestionRepository = authQuestionRepository;
    this.notificationRepository = notificationRepository;
    this.userRepository = userRepository;
  }

  async execute(questionId, response, customerMessage) {
    const validResponses = ['AUTHORIZED', 'REJECTED', 'WHATSAPP_CONTACT'];
    if (!validResponses.includes(response)) {
      throw new ValidationError(`Invalid response. Must be one of: ${validResponses.join(', ')}`);
    }

    const question = await this.authQuestionRepository.findById(questionId);
    if (!question) {
      throw new NotFoundError('AuthorizationQuestion');
    }

    if (question.response !== 'PENDING') {
      throw new ValidationError('This question has already been answered');
    }

    const updated = await this.authQuestionRepository.updateResponse(questionId, response, customerMessage);

    logger.info(`Authorization question ${questionId} responded with: ${response}`);

    // Notificar a todos los admins vía IN_APP
    if (this.notificationRepository && this.userRepository) {
      try {
        const service = updated.service;
        const customerName = service?.customer
          ? `${service.customer.firstName} ${service.customer.lastName}`.trim()
          : 'Cliente';

        const responseLabels = {
          AUTHORIZED: 'Autorizado',
          REJECTED: 'No autorizado',
          WHATSAPP_CONTACT: 'Solicita comunicación',
        };

        const { data: admins } = await this.userRepository.findAll({ role: 'ADMIN', limit: 100 });

        await Promise.all(admins.map(admin =>
          this.notificationRepository.create({
            userId: admin.id,
            type: 'AUTHORIZATION_ANSWERED',
            channel: 'IN_APP',
            status: 'SENT',
            title: `${responseLabels[response] || response} — ${service?.code || ''}`,
            message: `${customerName} respondió a la solicitud de autorización`,
            serviceId: updated.serviceId,
            metadata: {
              questionId,
              response,
              customerMessage: customerMessage || null,
              serviceCode: service?.code || '',
              motorcycle: service?.motorcycle || '',
              customerName,
            },
          })
        ));
      } catch (notifError) {
        // No romper el flujo si falla la notificación
        logger.error('Error creating admin notification for authorization answer:', notifError);
      }
    }

    return updated;
  }
}
