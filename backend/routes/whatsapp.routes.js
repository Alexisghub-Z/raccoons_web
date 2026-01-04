import express from 'express';
import {
  sendTrackingCode,
  sendStatusUpdate,
  sendReadyForPickup,
  checkHealth,
  webhookVerify,
  webhookHandler
} from '../controllers/whatsapp.controller.js';

const router = express.Router();

// Rutas de envío de mensajes
router.post('/send-tracking-code', sendTrackingCode);
router.post('/send-status-update', sendStatusUpdate);
router.post('/send-ready-for-pickup', sendReadyForPickup);

// Health check
router.get('/health', checkHealth);

// Webhook para WhatsApp (verificación y recepción)
router.get('/webhook', webhookVerify);
router.post('/webhook', webhookHandler);

export default router;
