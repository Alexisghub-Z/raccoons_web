import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import corsMiddleware from './middleware/cors.middleware.js';
import whatsappRoutes from './routes/whatsapp.routes.js';
import { validateConfig } from './config/whatsapp.config.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(corsMiddleware);
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Logger de requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api/whatsapp', whatsappRoutes);

// Ruta de health check general
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Raccoons Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: '🦝 Raccoons Taller - Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      whatsapp: {
        sendTrackingCode: 'POST /api/whatsapp/send-tracking-code',
        sendStatusUpdate: 'POST /api/whatsapp/send-status-update',
        sendReadyForPickup: 'POST /api/whatsapp/send-ready-for-pickup',
        health: 'GET /api/whatsapp/health'
      }
    }
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.path
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('\n🦝 ================================');
  console.log('   RACCOONS BACKEND API');
  console.log('================================\n');
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 Endpoints disponibles:`);
  console.log(`   - GET  http://localhost:${PORT}/`);
  console.log(`   - GET  http://localhost:${PORT}/api/health`);
  console.log(`   - POST http://localhost:${PORT}/api/whatsapp/send-tracking-code`);
  console.log(`   - POST http://localhost:${PORT}/api/whatsapp/send-status-update`);
  console.log(`   - GET  http://localhost:${PORT}/api/whatsapp/health`);
  console.log('\n================================\n');

  // Validar configuración de WhatsApp
  const isConfigured = validateConfig();
  if (!isConfigured) {
    console.log('⚠️  Para usar WhatsApp Business API:');
    console.log('   1. Edita backend/.env');
    console.log('   2. Configura tus credenciales de Meta');
    console.log('   3. Reinicia el servidor\n');
  }
});

export default app;
