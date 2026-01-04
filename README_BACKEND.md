# 🚀 Backend WhatsApp Business API - ¡IMPLEMENTADO!

## ✅ ¿Qué se ha implementado?

Un backend completo en Node.js/Express que permite el **envío AUTOMÁTICO Y REAL** de mensajes WhatsApp desde tu número **+52 951 588 6761** usando la WhatsApp Business Cloud API oficial de Meta.

---

## 📂 Estructura del Proyecto

```
raccoons_web/
├── backend/                    # ← NUEVO Backend completo
│   ├── server.js              # Servidor Express principal
│   ├── package.json           # Dependencias del backend
│   ├── .env                   # Credenciales (configurar)
│   ├── .env.example           # Plantilla de configuración
│   ├── config/
│   │   └── whatsapp.config.js # Configuración de WhatsApp API
│   ├── services/
│   │   └── whatsapp.service.js# Lógica de envío de WhatsApp
│   ├── controllers/
│   │   └── whatsapp.controller.js # Endpoints HTTP
│   ├── routes/
│   │   └── whatsapp.routes.js # Rutas de la API
│   └── middleware/
│       └── cors.middleware.js # Configuración CORS
│
├── src/
│   └── services/
│       ├── whatsappService.js          # Método antiguo (wa.me)
│       └── backendWhatsappService.js   # ← NUEVO Conecta con backend
│
├── BACKEND_SETUP.md           # ← Guía completa paso a paso
└── README_BACKEND.md          # ← Este archivo
```

---

## 🎯 ¿Cómo Funciona?

### Antes (Método Antiguo - wa.me)

```
Frontend → Abre WhatsApp Web → Usuario hace click "Enviar"
```

**Problemas:**
- ❌ No es automático
- ❌ Requiere click manual
- ❌ Depende de WhatsApp Web abierto

### Ahora (Con Backend - WhatsApp Business API)

```
Frontend → Backend → WhatsApp Cloud API → ✅ Mensaje enviado AUTOMÁTICAMENTE
```

**Beneficios:**
- ✅ 100% automático
- ✅ Sin intervención manual
- ✅ Desde TU número verificado
- ✅ 1,000 mensajes GRATIS al mes
- ✅ Confirmaciones de entrega
- ✅ Escalable

---

## 🎛️ Controles en el Frontend

Al crear un servicio nuevo, tienes **2 toggles**:

### Toggle 1: Método de Envío

| Estado | Icono | Descripción |
|--------|-------|-------------|
| Activado | 🚀 Backend API | Envío REAL desde tu número |
| Desactivado | 🌐 Web Link | Método antiguo (abre WhatsApp) |

### Toggle 2: Auto-envío

| Estado | Icono | Descripción |
|--------|-------|-------------|
| Activado | Auto-enviar ✓ | Envía automáticamente al guardar |
| Desactivado | Auto-enviar ✗ | Pregunta antes de enviar |

---

## 🚀 Inicio Rápido

### 1. Instalar Dependencias (Ya hecho)

```bash
cd backend
npm install  # ✅ Ya ejecutado
```

### 2. Configurar Credenciales

**Edita `backend/.env`:**

```env
WHATSAPP_PHONE_NUMBER_ID=TU_PHONE_NUMBER_ID_AQUI
WHATSAPP_ACCESS_TOKEN=TU_ACCESS_TOKEN_AQUI
WHATSAPP_BUSINESS_ACCOUNT_ID=TU_BUSINESS_ACCOUNT_ID_AQUI
```

Ver **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** para obtener estas credenciales.

### 3. Iniciar Backend

```bash
cd backend
npm start
```

Deberías ver:

```
🦝 ================================
   RACCOONS BACKEND API
================================

✅ Servidor corriendo en http://localhost:3001
```

### 4. Iniciar Frontend

En otra terminal:

```bash
npm run dev
```

### 5. Usar

1. Ir a http://localhost:5173/admin
2. Login: `admin123`
3. "+ Nuevo Servicio"
4. **Activar toggle "🚀 Backend API"**
5. **Activar toggle "Auto-enviar ✓"**
6. Llenar formulario con teléfono
7. Guardar → **WhatsApp se envía AUTOMÁTICAMENTE**

---

## 📡 API Endpoints

El backend expone estos endpoints:

### GET /api/health
Verifica que la API esté funcionando.

```bash
curl http://localhost:3001/api/health
```

### POST /api/whatsapp/send-tracking-code
Envía código de seguimiento por WhatsApp.

```bash
curl -X POST http://localhost:3001/api/whatsapp/send-tracking-code \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "5551234567",
    "trackingCode": "RCN-ABC123XYZ",
    "clientName": "Juan Pérez",
    "motorcycle": "Yamaha R15 2023",
    "serviceType": "Mantenimiento General"
  }'
```

### POST /api/whatsapp/send-status-update
Envía actualización de estado.

```bash
curl -X POST http://localhost:3001/api/whatsapp/send-status-update \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "5551234567",
    "trackingCode": "RCN-ABC123XYZ",
    "newStatus": "listo",
    "clientName": "Juan Pérez"
  }'
```

### GET /api/whatsapp/health
Verifica conexión con WhatsApp Business API.

```bash
curl http://localhost:3001/api/whatsapp/health
```

---

## ⚙️ Configuración de Meta (Resumen)

### Necesitas obtener 3 credenciales:

1. **Phone Number ID**
   - Dónde: WhatsApp > API Setup
   - Ejemplo: `107604012345678`

2. **Access Token (Permanente)**
   - Dónde: Configuración del sistema > Tokens de acceso
   - Ejemplo: `EAALdJ2tZCbHYBO7rR3...`

3. **Business Account ID**
   - Dónde: WhatsApp > API Setup
   - Ejemplo: `123456789012345`

### Pasos Completos:

Ver **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** - Guía paso a paso con capturas.

---

## 🧪 Testing

### Test 1: Verificar Backend

```bash
curl http://localhost:3001/api/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "message": "Raccoons Backend API is running",
  "timestamp": "2026-01-02T18:56:00.000Z",
  "version": "1.0.0"
}
```

### Test 2: Verificar WhatsApp API

```bash
curl http://localhost:3001/api/whatsapp/health
```

Si está configurado:
```json
{
  "success": true,
  "status": "connected",
  "phoneNumber": "+52 951 588 6761"
}
```

Si falta configuración:
```json
{
  "success": false,
  "status": "error",
  "error": "..."
}
```

### Test 3: Enviar Mensaje de Prueba

```bash
curl -X POST http://localhost:3001/api/whatsapp/send-tracking-code \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "5551234567",
    "trackingCode": "RCN-TEST123",
    "clientName": "Test User",
    "motorcycle": "Test Bike",
    "serviceType": "Test Service"
  }'
```

El número debería recibir el WhatsApp.

---

## 🔧 Troubleshooting

### Backend no inicia

**Error:**
```
Cannot find module 'express'
```

**Solución:**
```bash
cd backend
npm install
```

### Error: "Configuración incompleta"

**Causa:** Faltan credenciales en `.env`

**Solución:**
1. Edita `backend/.env`
2. Agrega tus credenciales de Meta
3. Reinicia backend

### Error: "No se pudo conectar con el servidor"

**Causa:** Backend no está corriendo

**Solución:**
```bash
cd backend
npm start
```

### Mensaje no llega

**Verificar:**
1. ✅ Backend corriendo
2. ✅ Credenciales configuradas
3. ✅ Número destino tiene WhatsApp
4. ✅ Número verificado en Meta
5. ✅ No excediste límites (50/día inicial)

---

## 💰 Costos y Límites

### Mensajes Gratis

- **1,000 mensajes/mes** completamente GRATIS
- Para taller pequeño: suficiente
- Meta subsidia los primeros 1,000

### Después de 1,000 (si necesitas más)

- México: **~$0.007 USD/mensaje** (~$0.14 MXN)
- Si envías 100 mensajes extra: ~$0.70 USD (~$14 MXN)
- **Muy barato**

### Límites de Cuenta

| Nivel | Mensajes/Día |
|-------|--------------|
| Inicial | 50 |
| Después de verificar | 250 |
| Con buena reputación | 1,000+ |

---

## 📚 Documentación

- **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** - Guía completa paso a paso
- **[NUEVAS_FUNCIONALIDADES.md](./NUEVAS_FUNCIONALIDADES.md)** - Todas las features
- **[WHATSAPP_AUTO.md](./WHATSAPP_AUTO.md)** - Toggle de auto-envío

---

## 🎉 ¡Todo Listo!

### Implementado:

✅ Backend Node.js/Express completo
✅ Integración con WhatsApp Business Cloud API
✅ Endpoints RESTful funcionando
✅ Frontend conectado al backend
✅ Toggles de configuración
✅ Envío automático REAL
✅ Documentación completa

### Pendiente (TU PARTE):

🔲 Configurar credenciales en `backend/.env`
🔲 Verificar número en Meta Business
🔲 ¡Probar y disfrutar!

### Para Configurar:

1. Lee **[BACKEND_SETUP.md](./BACKEND_SETUP.md)**
2. Sigue los pasos para Meta Business
3. Copia credenciales a `backend/.env`
4. Reinicia backend
5. **¡Listo para envío automático!**

---

## 🆘 Soporte

Si tienes problemas:

1. Revisa [BACKEND_SETUP.md](./BACKEND_SETUP.md) - Sección Troubleshooting
2. Verifica logs del backend
3. Prueba con curl/Postman
4. Verifica credenciales en Meta

---

## 🚀 Deploy a Producción (Futuro)

Cuando quieras poner en producción:

- **Railway.app** (Gratis, recomendado)
- **Render.com** (Gratis)
- **Heroku** (Gratis limitado)
- **VPS** (Digital Ocean, $4/mes)

Ver sección de Deploy en [BACKEND_SETUP.md](./BACKEND_SETUP.md)

---

**¡El backend está listo! Solo falta configurar las credenciales de Meta y empezar a enviar WhatsApp automáticamente desde tu número! 🎉📱**
