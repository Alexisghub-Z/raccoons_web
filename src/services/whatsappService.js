// WhatsApp Service
// Utiliza la API de WhatsApp Web para enviar mensajes

/**
 * Enviar mensaje de WhatsApp con el código de seguimiento
 * @param {string} phoneNumber - Número de teléfono (10 dígitos)
 * @param {string} trackingCode - Código de seguimiento del servicio
 * @param {string} clientName - Nombre del cliente
 * @param {string} motorcycle - Motocicleta del cliente
 * @param {string} serviceType - Tipo de servicio
 * @returns {boolean} - true si se abrió WhatsApp correctamente
 */
export const sendTrackingCodeWhatsApp = (phoneNumber, trackingCode, clientName, motorcycle, serviceType) => {
  // Limpiar el número de teléfono (quitar espacios, guiones, etc)
  const cleanPhone = phoneNumber.replace(/\D/g, '');

  // Agregar código de país si no lo tiene (México: 52)
  const fullPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone;

  // Crear el mensaje
  const message = `
¡Hola ${clientName}! 👋

Tu motocicleta *${motorcycle}* ha sido recibida en Raccoons Taller. 🏍️

📋 *Código de seguimiento:* ${trackingCode}
🔧 *Servicio:* ${serviceType}

Puedes consultar el estado de tu servicio en cualquier momento usando este código en nuestra página web.

¡Gracias por confiar en nosotros! 🦝
  `.trim();

  // Codificar el mensaje para URL
  const encodedMessage = encodeURIComponent(message);

  // Construir URL de WhatsApp
  const whatsappURL = `https://wa.me/${fullPhone}?text=${encodedMessage}`;

  // Abrir WhatsApp en nueva ventana
  window.open(whatsappURL, '_blank');

  return true;
};

/**
 * Enviar notificación de cambio de estado
 * @param {string} phoneNumber - Número de teléfono
 * @param {string} trackingCode - Código de seguimiento
 * @param {string} newStatus - Nuevo estado del servicio
 * @param {string} clientName - Nombre del cliente
 */
export const sendStatusUpdateWhatsApp = (phoneNumber, trackingCode, newStatus, clientName) => {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const fullPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone;

  const statusMessages = {
    'recibido': '✅ Tu motocicleta ha sido recibida en nuestro taller',
    'en_diagnostico': '🔍 Estamos realizando el diagnóstico de tu moto',
    'en_reparacion': '🔧 Ya estamos trabajando en la reparación',
    'listo': '✨ ¡Tu moto está lista para ser recogida!',
    'entregado': '🎉 Servicio completado y entregado'
  };

  const message = `
¡Hola ${clientName}! 👋

*Actualización de tu servicio:*

${statusMessages[newStatus] || 'El estado de tu servicio ha cambiado'}

📋 *Código:* ${trackingCode}

Puedes ver más detalles en nuestra página web con tu código de seguimiento.

Raccoons Taller 🦝
  `.trim();

  const encodedMessage = encodeURIComponent(message);
  const whatsappURL = `https://wa.me/${fullPhone}?text=${encodedMessage}`;

  window.open(whatsappURL, '_blank');

  return true;
};

/**
 * Enviar mensaje de servicio listo para recoger
 * @param {string} phoneNumber - Número de teléfono
 * @param {string} trackingCode - Código de seguimiento
 * @param {string} clientName - Nombre del cliente
 */
export const sendReadyForPickupWhatsApp = (phoneNumber, trackingCode, clientName) => {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const fullPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone;

  const message = `
¡Hola ${clientName}! 🎉

✨ *¡Tu motocicleta está lista!* ✨

Puedes pasar a recogerla en nuestro horario:
📅 Lunes a Viernes: 8:00 - 18:00
📅 Sábado: 9:00 - 14:00

📋 Código: ${trackingCode}
📍 Av. Principal #123, Ciudad

¡Te esperamos! 🦝

Raccoons Taller
  `.trim();

  const encodedMessage = encodeURIComponent(message);
  const whatsappURL = `https://wa.me/${fullPhone}?text=${encodedMessage}`;

  window.open(whatsappURL, '_blank');

  return true;
};
