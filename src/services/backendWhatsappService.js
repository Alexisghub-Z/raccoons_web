// Backend WhatsApp Service
// Conecta con el backend Node.js para envío real de WhatsApp

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

/**
 * Enviar código de seguimiento por WhatsApp (a través del backend)
 * @param {string} phoneNumber - Número de teléfono (10 dígitos)
 * @param {string} trackingCode - Código de seguimiento
 * @param {string} clientName - Nombre del cliente
 * @param {string} motorcycle - Motocicleta
 * @param {string} serviceType - Tipo de servicio
 * @returns {Promise<Object>} - Resultado del envío
 */
export const sendTrackingCodeBackend = async (phoneNumber, trackingCode, clientName, motorcycle, serviceType) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/whatsapp/send-tracking-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber,
        trackingCode,
        clientName,
        motorcycle,
        serviceType
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ WhatsApp enviado exitosamente desde backend');
      return {
        success: true,
        messageId: data.messageId
      };
    } else {
      console.error('❌ Error al enviar WhatsApp:', data.error);
      return {
        success: false,
        error: data.error
      };
    }
  } catch (error) {
    console.error('❌ Error de conexión con backend:', error);
    return {
      success: false,
      error: 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.'
    };
  }
};

/**
 * Enviar actualización de estado por WhatsApp
 */
export const sendStatusUpdateBackend = async (phoneNumber, trackingCode, newStatus, clientName) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/whatsapp/send-status-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber,
        trackingCode,
        newStatus,
        clientName
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al enviar actualización:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Enviar notificación de listo para recoger
 */
export const sendReadyForPickupBackend = async (phoneNumber, trackingCode, clientName) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/whatsapp/send-ready-for-pickup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber,
        trackingCode,
        clientName
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verificar si el backend está disponible
 */
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/whatsapp/health`);
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      status: 'disconnected',
      error: 'Backend no disponible'
    };
  }
};
