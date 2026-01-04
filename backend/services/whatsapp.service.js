import axios from 'axios';
import { whatsappConfig } from '../config/whatsapp.config.js';

class WhatsAppService {
  constructor() {
    this.apiUrl = `${whatsappConfig.apiUrl}/${whatsappConfig.apiVersion}/${whatsappConfig.phoneNumberId}/messages`;
    this.headers = {
      'Authorization': `Bearer ${whatsappConfig.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Enviar mensaje de texto simple
   */
  async sendTextMessage(to, message) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: this.formatPhoneNumber(to),
          type: 'text',
          text: {
            preview_url: false,
            body: message
          }
        },
        { headers: this.headers }
      );

      console.log(`✅ WhatsApp enviado a ${to}`);
      return {
        success: true,
        messageId: response.data.messages[0].id,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error al enviar WhatsApp:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Enviar código de seguimiento al crear servicio
   */
  async sendTrackingCode(phoneNumber, trackingCode, clientName, motorcycle, serviceType) {
    const message = `¡Hola ${clientName}! 👋

Tu motocicleta *${motorcycle}* ha sido recibida en Raccoons Taller. 🏍️

📋 *Código de seguimiento:* ${trackingCode}
🔧 *Servicio:* ${serviceType}

Puedes consultar el estado de tu servicio en cualquier momento usando este código en nuestra página web.

¡Gracias por confiar en nosotros! 🦝`;

    return await this.sendTextMessage(phoneNumber, message);
  }

  /**
   * Enviar notificación de cambio de estado
   */
  async sendStatusUpdate(phoneNumber, trackingCode, newStatus, clientName) {
    const statusMessages = {
      'recibido': '✅ Tu motocicleta ha sido recibida en nuestro taller',
      'en_diagnostico': '🔍 Estamos realizando el diagnóstico de tu moto',
      'en_reparacion': '🔧 Ya estamos trabajando en la reparación',
      'listo': '✨ ¡Tu moto está lista para ser recogida!',
      'entregado': '🎉 Servicio completado y entregado'
    };

    const message = `¡Hola ${clientName}! 👋

*Actualización de tu servicio:*

${statusMessages[newStatus] || 'El estado de tu servicio ha cambiado'}

📋 *Código:* ${trackingCode}

Puedes ver más detalles en nuestra página web con tu código de seguimiento.

Raccoons Taller 🦝`;

    return await this.sendTextMessage(phoneNumber, message);
  }

  /**
   * Enviar notificación de servicio listo para recoger
   */
  async sendReadyForPickup(phoneNumber, trackingCode, clientName) {
    const message = `¡Hola ${clientName}! 🎉

✨ *¡Tu motocicleta está lista!* ✨

Puedes pasar a recogerla en nuestro horario:
📅 Lunes a Viernes: 8:00 - 18:00
📅 Sábado: 9:00 - 14:00

📋 Código: ${trackingCode}
📍 Av. Principal #123, Ciudad

¡Te esperamos! 🦝

Raccoons Taller`;

    return await this.sendTextMessage(phoneNumber, message);
  }

  /**
   * Formatear número de teléfono
   * Asegura formato internacional sin + ni espacios
   */
  formatPhoneNumber(phone) {
    // Limpiar el número
    let cleanPhone = phone.replace(/\D/g, '');

    // Si tiene 10 dígitos, agregar código de país (52 para México)
    if (cleanPhone.length === 10) {
      cleanPhone = '52' + cleanPhone;
    }

    return cleanPhone;
  }

  /**
   * Verificar estado del servicio de WhatsApp
   */
  async checkHealth() {
    try {
      // Hacer una petición simple para verificar conectividad
      const response = await axios.get(
        `${whatsappConfig.apiUrl}/${whatsappConfig.apiVersion}/${whatsappConfig.phoneNumberId}`,
        { headers: this.headers }
      );

      return {
        success: true,
        status: 'connected',
        phoneNumber: response.data.display_phone_number
      };
    } catch (error) {
      return {
        success: false,
        status: 'error',
        error: error.response?.data?.error || error.message
      };
    }
  }
}

export default new WhatsAppService();
