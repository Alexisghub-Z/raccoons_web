import nodemailer from 'nodemailer';
import { config } from '../../../shared/config/index.js';
import { ExternalServiceError } from '../../../shared/errors/AppError.js';
import logger from '../../../shared/logger/index.js';

export class NodemailerEmailService {
  constructor() {
    this.enabled = config.email.enabled;

    if (this.enabled) {
      if (!config.email.user || !config.email.password) {
        logger.warn('Email credentials not configured. Email service disabled.');
        this.enabled = false;
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure,
        auth: {
          user: config.email.user,
          pass: config.email.password
        }
      });

      logger.info('Email service initialized');
    } else {
      logger.info('Email service is disabled');
    }
  }

  async sendEmail(to, subject, html) {
    if (!this.enabled) {
      logger.warn('Email service is disabled. Simulating email send.');
      return {
        success: true,
        simulated: true,
        to,
        subject
      };
    }

    try {
      const mailOptions = {
        from: `"${config.email.fromName}" <${config.email.fromAddress}>`,
        to,
        subject,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);

      logger.info(`Email sent successfully to ${to}`, {
        messageId: result.messageId
      });

      return {
        success: true,
        messageId: result.messageId,
        to
      };
    } catch (error) {
      logger.error('Error sending email:', error);
      throw new ExternalServiceError('Nodemailer', error.message, { to });
    }
  }

  async sendServiceCreatedEmail(customerEmail, serviceCode, customerName, serviceDetails) {
    const subject = `Servicio Recibido - ${serviceCode}`;
    const html = `
      <h2>¡Hola ${customerName}!</h2>
      <p>Tu motocicleta ha sido recibida en Raccoons Taller.</p>
      <h3>Detalles del Servicio:</h3>
      <ul>
        <li><strong>Código de seguimiento:</strong> ${serviceCode}</li>
        <li><strong>Motocicleta:</strong> ${serviceDetails.motorcycle}</li>
        <li><strong>Tipo de servicio:</strong> ${serviceDetails.serviceType}</li>
        <li><strong>Estado:</strong> Recibido</li>
      </ul>
      <p>Puedes consultar el estado de tu servicio en cualquier momento en:</p>
      <a href="${config.frontend.url}/seguimiento">${config.frontend.url}/seguimiento</a>
      <p>Gracias por confiar en nosotros!</p>
      <p>- Raccoons Taller 🦝</p>
    `;

    return await this.sendEmail(customerEmail, subject, html);
  }

  isEnabled() {
    return this.enabled;
  }
}

export default new NodemailerEmailService();
