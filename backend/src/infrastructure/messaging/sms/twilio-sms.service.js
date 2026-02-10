import twilio from 'twilio';
import { config } from '../../../shared/config/index.js';
import { ExternalServiceError } from '../../../shared/errors/AppError.js';
import logger from '../../../shared/logger/index.js';

export class TwilioSMSService {
  constructor() {
    this.enabled = config.twilio.enabled;
    
    if (this.enabled) {
      if (!config.twilio.accountSid || !config.twilio.authToken || !config.twilio.phoneNumber) {
        logger.warn('Twilio credentials not configured. SMS service disabled.');
        this.enabled = false;
        return;
      }

      this.client = twilio(config.twilio.accountSid, config.twilio.authToken);
      this.fromPhone = config.twilio.phoneNumber;
      logger.info('Twilio SMS service initialized');
    } else {
      logger.info('Twilio SMS service is disabled');
    }
  }

  async sendSMS(to, message) {
    if (!this.enabled) {
      logger.warn('Twilio SMS service is disabled. Simulating SMS send.');
      return {
        success: true,
        simulated: true,
        to,
        message
      };
    }

    try {
      const formattedPhone = this.formatPhoneNumber(to);

      const result = await this.client.messages.create({
        body: message,
        from: this.fromPhone,
        to: formattedPhone
      });

      logger.info(`SMS sent successfully to ${formattedPhone}`, {
        messageSid: result.sid,
        status: result.status
      });

      return {
        success: true,
        messageSid: result.sid,
        status: result.status,
        to: formattedPhone
      };
    } catch (error) {
      logger.error('Error sending SMS via Twilio:', error);
      throw new ExternalServiceError('Twilio', error.message, {
        to,
        code: error.code
      });
    }
  }

  async sendServiceCreatedSMS(customerPhone, serviceCode, customerName) {
    const message = `Hola ${customerName}! 🦝 Tu motocicleta ha sido recibida en Raccoons Taller.\n\nCódigo de seguimiento: ${serviceCode}\n\nConsulta el estado en: ${config.frontend.url}/seguimiento`;

    return await this.sendSMS(customerPhone, message);
  }

  async sendStatusUpdateSMS(customerPhone, serviceCode, newStatus, customerName) {
    const statusMessages = {
      IN_DIAGNOSIS: 'en diagnóstico',
      IN_REPAIR: 'en reparación',
      READY_FOR_PICKUP: 'lista para entrega',
      DELIVERED: 'entregada',
      CANCELLED: 'cancelada'
    };

    const statusText = statusMessages[newStatus] || newStatus;

    const message = `Hola ${customerName}! 🦝\n\nActualización del servicio ${serviceCode}:\nEstado: ${statusText}\n\nConsulta más detalles en: ${config.frontend.url}/seguimiento`;

    return await this.sendSMS(customerPhone, message);
  }

  async sendReadyForPickupSMS(customerPhone, serviceCode, customerName) {
    const message = `Hola ${customerName}! 🦝\n\n¡Buenas noticias! Tu motocicleta está lista para ser recogida.\n\nCódigo: ${serviceCode}\n\nGracias por confiar en Raccoons Taller!`;

    return await this.sendSMS(customerPhone, message);
  }

  async sendAppointmentConfirmedSMS(customerPhone, appointmentDate, customerName) {
    const date = new Date(appointmentDate);
    const formattedDate = date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const message = `Hola ${customerName}! 🦝\n\nTu cita ha sido confirmada para:\n${formattedDate}\n\nTe esperamos en Raccoons Taller!`;

    return await this.sendSMS(customerPhone, message);
  }

  async sendAppointmentReminderSMS(customerPhone, appointmentDate, customerName) {
    const date = new Date(appointmentDate);
    const formattedDate = date.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });

    const message = `Hola ${customerName}! 🦝\n\nRecordatorio: Tienes una cita mañana:\n${formattedDate}\n\n¿Necesitas reprogramar? Contáctanos.`;

    return await this.sendSMS(customerPhone, message);
  }

  formatPhoneNumber(phone) {
    let cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('52') && cleaned.length === 12) {
      return `+${cleaned}`;
    }
    
    if (cleaned.length === 10) {
      return `+52${cleaned}`;
    }
    
    if (!cleaned.startsWith('+')) {
      return `+${cleaned}`;
    }
    
    return phone;
  }

  isEnabled() {
    return this.enabled;
  }
}

export default new TwilioSMSService();
