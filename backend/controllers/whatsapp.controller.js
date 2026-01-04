import whatsappService from '../services/whatsapp.service.js';

/**
 * Enviar código de seguimiento por WhatsApp
 */
export const sendTrackingCode = async (req, res) => {
  try {
    const { phoneNumber, trackingCode, clientName, motorcycle, serviceType } = req.body;

    // Validar datos requeridos
    if (!phoneNumber || !trackingCode || !clientName) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos: phoneNumber, trackingCode, clientName'
      });
    }

    // Enviar mensaje
    const result = await whatsappService.sendTrackingCode(
      phoneNumber,
      trackingCode,
      clientName,
      motorcycle || 'Tu motocicleta',
      serviceType || 'Servicio general'
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'WhatsApp enviado exitosamente',
        messageId: result.messageId
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error en sendTrackingCode:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al enviar WhatsApp'
    });
  }
};

/**
 * Enviar actualización de estado por WhatsApp
 */
export const sendStatusUpdate = async (req, res) => {
  try {
    const { phoneNumber, trackingCode, newStatus, clientName } = req.body;

    if (!phoneNumber || !trackingCode || !newStatus || !clientName) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos'
      });
    }

    const result = await whatsappService.sendStatusUpdate(
      phoneNumber,
      trackingCode,
      newStatus,
      clientName
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Actualización enviada exitosamente',
        messageId: result.messageId
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error en sendStatusUpdate:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al enviar actualización'
    });
  }
};

/**
 * Enviar notificación de listo para recoger
 */
export const sendReadyForPickup = async (req, res) => {
  try {
    const { phoneNumber, trackingCode, clientName } = req.body;

    if (!phoneNumber || !trackingCode || !clientName) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos'
      });
    }

    const result = await whatsappService.sendReadyForPickup(
      phoneNumber,
      trackingCode,
      clientName
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Notificación enviada exitosamente',
        messageId: result.messageId
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error en sendReadyForPickup:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al enviar notificación'
    });
  }
};

/**
 * Verificar estado del servicio WhatsApp
 */
export const checkHealth = async (req, res) => {
  try {
    const health = await whatsappService.checkHealth();

    if (health.success) {
      return res.status(200).json({
        success: true,
        status: 'connected',
        phoneNumber: health.phoneNumber
      });
    } else {
      return res.status(500).json({
        success: false,
        status: 'error',
        error: health.error
      });
    }
  } catch (error) {
    console.error('Error en checkHealth:', error);
    return res.status(500).json({
      success: false,
      status: 'error',
      error: error.message
    });
  }
};

/**
 * Webhook para recibir mensajes de WhatsApp (opcional)
 */
export const webhookVerify = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log('✅ Webhook verificado');
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
};

export const webhookHandler = (req, res) => {
  const body = req.body;

  console.log('📨 Webhook recibido:', JSON.stringify(body, null, 2));

  // Aquí puedes procesar mensajes entrantes si lo necesitas
  // Por ejemplo, respuestas automáticas, confirmaciones, etc.

  res.status(200).send('EVENT_RECEIVED');
};
