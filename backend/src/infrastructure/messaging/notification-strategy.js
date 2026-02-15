import emailService from './email/nodemailer-email.service.js';
import logger from '../../shared/logger/index.js';

export class NotificationStrategy {
  async sendNotification(notification, user) {
    const results = [];

    try {
      if (notification.channel === 'EMAIL' && user.email) {
        const result = await this.sendEmail(notification, user);
        results.push(result);
      } else if (notification.channel === 'IN_APP') {
        results.push({ success: true, channel: 'IN_APP', message: 'Stored in database' });
      } else if (notification.channel === 'SMS') {
        // SMS desactivado — se registra como advertencia pero no falla
        logger.warn(`SMS channel is disabled. Notification ${notification.id} not sent via SMS.`);
        results.push({ success: false, channel: 'SMS', skipped: true, reason: 'SMS channel disabled' });
      }

      return {
        success: results.some(r => r.success),
        results
      };
    } catch (error) {
      logger.error('Error in NotificationStrategy:', error);
      return {
        success: false,
        error: error.message,
        results
      };
    }
  }

  async sendEmail(notification, user) {
    try {
      let result;
      const firstName = user.firstName || user.name || 'Cliente';

      switch (notification.type) {
        case 'SERVICE_CREATED':
          result = await emailService.sendServiceCreatedEmail(
            user.email,
            notification.metadata?.serviceCode,
            firstName,
            {
              motorcycle:  notification.metadata?.motorcycle,
              serviceType: notification.metadata?.serviceType,
              description: notification.metadata?.description,
            }
          );
          break;

        case 'SERVICE_STATUS_UPDATED':
          result = await emailService.sendStatusUpdateEmail(
            user.email,
            notification.metadata?.serviceCode,
            notification.metadata?.newStatus,
            firstName,
            notification.metadata?.motorcycle
          );
          break;

        case 'SERVICE_READY_FOR_PICKUP':
          result = await emailService.sendStatusUpdateEmail(
            user.email,
            notification.metadata?.serviceCode,
            'READY_FOR_PICKUP',
            firstName,
            notification.metadata?.motorcycle
          );
          break;

        case 'APPOINTMENT_CREATED':
          result = await emailService.sendAppointmentCreatedEmail(
            user.email,
            firstName,
            notification.metadata?.appointmentData || {}
          );
          break;

        case 'APPOINTMENT_CONFIRMED':
          result = await emailService.sendAppointmentConfirmedEmail(
            user.email,
            firstName,
            notification.metadata?.appointmentData || {}
          );
          break;

        case 'APPOINTMENT_CANCELLED':
          result = await emailService.sendAppointmentCancelledEmail(
            user.email,
            firstName,
            notification.metadata?.appointmentData || {}
          );
          break;

        case 'APPOINTMENT_REMINDER':
          result = await emailService.sendAppointmentReminderEmail(
            user.email,
            firstName,
            notification.metadata?.appointmentData || {}
          );
          break;

        default:
          result = await emailService.sendEmail(
            user.email,
            notification.title,
            `<p>${notification.message}</p>`
          );
      }

      return { success: true, channel: 'EMAIL', ...result };
    } catch (error) {
      logger.error('Error sending email notification:', error);
      return { success: false, channel: 'EMAIL', error: error.message };
    }
  }

  async sendMultiChannel(notification, user, channels = ['EMAIL']) {
    const results = [];

    for (const channel of channels) {
      const channelNotification = { ...notification, channel };
      const result = await this.sendNotification(channelNotification, user);
      results.push(result);
    }

    return {
      success: results.some(r => r.success),
      results
    };
  }
}

export default new NotificationStrategy();
