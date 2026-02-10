import twilioSMSService from './sms/twilio-sms.service.js';
import emailService from './email/nodemailer-email.service.js';
import logger from '../../shared/logger/index.js';

export class NotificationStrategy {
  async sendNotification(notification, user) {
    const results = [];

    try {
      if (notification.channel === 'SMS' && user.phone) {
        const smsResult = await this.sendSMS(notification, user);
        results.push(smsResult);
      } else if (notification.channel === 'EMAIL' && user.email) {
        const emailResult = await this.sendEmail(notification, user);
        results.push(emailResult);
      } else if (notification.channel === 'IN_APP') {
        results.push({ success: true, channel: 'IN_APP', message: 'Stored in database' });
      }

      return {
        success: results.every(r => r.success),
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

  async sendSMS(notification, user) {
    try {
      let result;

      switch (notification.type) {
        case 'SERVICE_CREATED':
          result = await twilioSMSService.sendServiceCreatedSMS(
            user.phone,
            notification.metadata?.serviceCode,
            user.firstName
          );
          break;

        case 'SERVICE_STATUS_UPDATED':
          result = await twilioSMSService.sendStatusUpdateSMS(
            user.phone,
            notification.metadata?.serviceCode,
            notification.metadata?.newStatus,
            user.firstName
          );
          break;

        case 'SERVICE_READY_FOR_PICKUP':
          result = await twilioSMSService.sendReadyForPickupSMS(
            user.phone,
            notification.metadata?.serviceCode,
            user.firstName
          );
          break;

        case 'APPOINTMENT_CONFIRMED':
          result = await twilioSMSService.sendAppointmentConfirmedSMS(
            user.phone,
            notification.metadata?.appointmentDate,
            user.firstName
          );
          break;

        case 'APPOINTMENT_REMINDER':
          result = await twilioSMSService.sendAppointmentReminderSMS(
            user.phone,
            notification.metadata?.appointmentDate,
            user.firstName
          );
          break;

        default:
          result = await twilioSMSService.sendSMS(user.phone, notification.message);
      }

      return { success: true, channel: 'SMS', ...result };
    } catch (error) {
      logger.error('Error sending SMS notification:', error);
      return { success: false, channel: 'SMS', error: error.message };
    }
  }

  async sendEmail(notification, user) {
    try {
      const result = await emailService.sendEmail(
        user.email,
        notification.title,
        `<p>${notification.message}</p>`
      );

      return { success: true, channel: 'EMAIL', ...result };
    } catch (error) {
      logger.error('Error sending email notification:', error);
      return { success: false, channel: 'EMAIL', error: error.message };
    }
  }

  async sendMultiChannel(notification, user, channels = ['SMS', 'EMAIL']) {
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
