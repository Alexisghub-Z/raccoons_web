# 🚀 Guía Completa: Backend con WhatsApp Business API

Esta guía te llevará paso a paso para configurar el envío **AUTOMÁTICO Y REAL** de WhatsApp desde tu número **9515886761** usando WhatsApp Business Cloud API (Meta).

---

## 📋 Tabla de Contenido

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de Meta Business](#configuración-de-meta-business)
3. [Instalación del Backend](#instalación-del-backend)
4. [Configuración de Credenciales](#configuración-de-credenciales)
5. [Iniciar el Backend](#iniciar-el-backend)
6. [Probar la Integración](#probar-la-integración)
7. [Uso desde el Frontend](#uso-desde-el-frontend)
8. [Troubleshooting](#troubleshooting)

---

## 1. Requisitos Previos

### ✅ Necesitas:

- [x] Cuenta de Facebook Business
- [x] Número de teléfono (9515886761) **NO registrado** en WhatsApp personal
- [x] Node.js instalado (v16 o superior)
- [x] Acceso a tu teléfono para verificación

### ⚠️ Importante:
- El número **9515886761** debe estar **disponible** (no usado en WhatsApp personal)
- Si ya lo usas en personal, necesitas otro número o migrar

---

## 2. Configuración de Meta Business

### Paso 1: Crear Cuenta de Meta Business

1. Ve a: **https://business.facebook.com/**
2. Click en **"Crear cuenta"**
3. Completa los datos:
   - Nombre del negocio: `Raccoons Taller`
   - Tu nombre
   - Email de trabajo

### Paso 2: Crear App de Meta

1. Ve a: **https://developers.facebook.com/apps/**
2. Click **"Crear app"**
3. Selecciona **"Empresa"** como tipo
4. Nombre de la app: `Raccoons WhatsApp`
5. Email de contacto
6. Click **"Crear app"**

### Paso 3: Configurar WhatsApp

1. En el dashboard de tu app, busca **"WhatsApp"**
2. Click en **"Configurar"**
3. Selecciona tu Meta Business Account
4. Click **"Continuar"**

### Paso 4: Agregar Número de Teléfono

1. En WhatsApp > **"Inicio rápido"**
2. Click en **"Agregar número de teléfono"**
3. Ingresa: **+52 951 588 6761**
4. Método de verificación: **SMS** o **llamada**
5. Ingresa el código que recibes
6. ✅ **Número verificado**

### Paso 5: Obtener Credenciales

#### A) Phone Number ID

1. En WhatsApp > **"API Setup"**
2. Busca **"Phone number ID"**
3. Copia el número (ejemplo: `107604012345678`)

#### B) Access Token (Temporal)

1. En la misma página, busca **"Temporary access token"**
2. Click **"Generate token"**
3. Copia el token (ejemplo: `EAALdJ2...`)

⚠️ **Este token expira en 24 horas**. Necesitas crear uno permanente:

#### C) Access Token Permanente

1. Ve a **Configuración** > **Básico**
2. Copia tu **App ID** y **App Secret**
3. Ve a: https://developers.facebook.com/tools/explorer/
4. Selecciona tu app
5. En "Permisos" agrega:
   - `whatsapp_business_management`
   - `whatsapp_business_messaging`
6. Click **"Generate Access Token"**
7. Acepta los permisos
8. Guarda el token en un lugar seguro

**O más fácil:**

1. Ve a **Configuración del sistema** > **Tokens de acceso**
2. Click **"Generar nuevo token"**
3. Selecciona permisos de WhatsApp
4. Nunca caduca: ✅
5. Copia y guarda

#### D) Business Account ID

1. En WhatsApp > **"API Setup"**
2. Busca **"WhatsApp Business Account ID"**
3. Copia el ID

---

## 3. Instalación del Backend

### Paso 1: Instalar Dependencias

```bash
cd backend
npm install
```

Esto instalará:
- `express` - Framework web
- `cors` - Para permitir requests del frontend
- `axios` - Para hacer requests a WhatsApp API
- `dotenv` - Variables de entorno
- `body-parser` - Parsear requests JSON

---

## 4. Configuración de Credenciales

### Paso 1: Editar archivo `.env`

```bash
cd backend
nano .env
```

O abre con cualquier editor:

```env
# WhatsApp Business Cloud API Configuration
WHATSAPP_PHONE_NUMBER_ID=107604012345678
WHATSAPP_ACCESS_TOKEN=EAALdJ2tZCbHYBO7rR3... (tu token permanente)
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012345

# Tu número de WhatsApp Business
WHATSAPP_FROM_NUMBER=529515886761

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:5173

# Webhook Verification Token
WEBHOOK_VERIFY_TOKEN=raccoons_webhook_secret_2024
```

### Paso 2: Reemplazar Valores

Reemplaza:
- `WHATSAPP_PHONE_NUMBER_ID` → Tu Phone Number ID de Meta
- `WHATSAPP_ACCESS_TOKEN` → Tu token permanente
- `WHATSAPP_BUSINESS_ACCOUNT_ID` → Tu Business Account ID

---

## 5. Iniciar el Backend

### Desarrollo:

```bash
cd backend
npm run dev
```

### Producción:

```bash
cd backend
npm start
```

### Verificar que está corriendo:

Deberías ver:

```
🦝 ================================
   RACCOONS BACKEND API
================================

✅ Servidor corriendo en http://localhost:3001
📡 Endpoints disponibles:
   - GET  http://localhost:3001/
   - GET  http://localhost:3001/api/health
   - POST http://localhost:3001/api/whatsapp/send-tracking-code
   ...

✅ Configuración de WhatsApp validada
```

Si ves ⚠️ advertencias de configuración:
- Revisa que `.env` tenga los valores correctos
- No deben empezar con `TU_`

---

## 6. Probar la Integración

### Opción A: Con curl

```bash
curl -X POST http://localhost:3001/api/whatsapp/send-tracking-code \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "5551234567",
    "trackingCode": "RCN-TEST123",
    "clientName": "Juan Pérez",
    "motorcycle": "Yamaha R15 2023",
    "serviceType": "Mantenimiento"
  }'
```

### Opción B: Con Postman

1. Abre Postman
2. Nueva request POST
3. URL: `http://localhost:3001/api/whatsapp/send-tracking-code`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
```json
{
  "phoneNumber": "5551234567",
  "trackingCode": "RCN-TEST123",
  "clientName": "Juan Pérez",
  "motorcycle": "Yamaha R15",
  "serviceType": "Mantenimiento"
}
```
6. Send

### Resultado Esperado:

```json
{
  "success": true,
  "message": "WhatsApp enviado exitosamente",
  "messageId": "wamid.HBgNNTIxOTQ..."
}
```

### Verificar:

El número **5551234567** debe recibir un mensaje de WhatsApp de tu número **9515886761** con el texto del código de seguimiento.

---

## 7. Uso desde el Frontend

### Ya está configurado! 🎉

El frontend tiene dos toggles en el formulario de nuevo servicio:

#### Toggle 1: 🚀 Backend API / 🌐 Web Link

- **Backend API (Activado):** Envía WhatsApp REAL desde tu número
- **Web Link (Desactivado):** Método antiguo (abre WhatsApp Web)

#### Toggle 2: Auto-enviar ✓ / ✗

- **Activado:** Envía automáticamente al guardar
- **Desactivado:** Pregunta antes de enviar

### Flujo de Uso:

1. Frontend corriendo: `npm run dev` (puerto 5173)
2. Backend corriendo: `cd backend && npm run dev` (puerto 3001)
3. Ir a: http://localhost:5173/admin
4. Login: `admin123`
5. "+ Nuevo Servicio"
6. **Activar toggle "🚀 Backend API"**
7. **Activar toggle "Auto-enviar ✓"**
8. Llenar formulario con teléfono
9. Guardar
10. **WhatsApp se envía AUTOMÁTICAMENTE desde tu número**

---

## 8. Troubleshooting

### Error: "No se pudo conectar con el servidor"

**Causa:** Backend no está corriendo

**Solución:**
```bash
cd backend
npm run dev
```

### Error: "Error al enviar WhatsApp: Invalid access token"

**Causa:** Access token incorrecto o expirado

**Solución:**
1. Generar nuevo token permanente
2. Actualizar en `backend/.env`
3. Reiniciar backend

### Error: "Error al enviar WhatsApp: Unsupported post request"

**Causa:** Phone Number ID incorrecto

**Solución:**
1. Verificar Phone Number ID en Meta
2. Actualizar en `backend/.env`
3. Reiniciar backend

### Error: "Error al enviar WhatsApp: (#100) Param to must be a valid WhatsApp ID"

**Causa:** Formato de número incorrecto

**Solución:**
- El número debe ser 10 dígitos (sin código de país)
- Ejemplo: `9515886761` ✅
- No usar: `+52 951 588 6761` ❌

### El mensaje no llega

**Verificar:**

1. **Número destino tiene WhatsApp:**
   - El destinatario debe tener WhatsApp instalado

2. **Número está verificado en Meta:**
   - Ve a WhatsApp > API Setup
   - Verifica que tu número esté **"Verified"**

3. **Límites de API:**
   - Cuenta nueva: 50 mensajes/día
   - Después: 250, luego 1000+
   - Para más: solicitar aumento de límite

4. **Sandbox vs Producción:**
   - Si usas número de prueba, solo puedes enviar a números registrados
   - Tu número real puede enviar a cualquiera

### Backend no inicia

**Error común:** `Cannot find module 'express'`

**Solución:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Límites y Costos

### Límites de Mensajes (Gratis)

| Nivel | Mensajes/mes | Cómo llegar |
|-------|--------------|-------------|
| Nivel 1 | 1,000 | Cuenta nueva |
| Nivel 2 | 10,000 | Enviar 1K en 7 días |
| Nivel 3 | 100,000 | Buena reputación |
| Nivel 4 | Ilimitado | Solicitar |

### Costos (después de 1,000 gratuitos)

- **México:** ~$0.007 USD por mensaje
- **EE.UU.:** ~$0.005 USD por mensaje

### Incrementar Límites

1. Envía mensajes consistentemente
2. Mantén calidad alta (baja tasa de spam)
3. Verifica tu negocio en Meta
4. Solicita aumento en Meta Business

---

## 🔒 Seguridad

### Variables de Entorno

**NUNCA subas `.env` a Git:**

```bash
# Ya está en .gitignore
backend/.env
```

### Access Token

- Usa tokens **permanentes**
- Guárdalos en lugar seguro
- No los compartas
- Si se comprometen, revócalos inmediatamente

### Webhook Security

El webhook usa un token de verificación:
```env
WEBHOOK_VERIFY_TOKEN=raccoons_webhook_secret_2024
```

Cámbialo a algo único y seguro.

---

## 🚀 Deploy a Producción

### Opciones de Hosting

1. **Railway.app** (Recomendado, gratis)
2. **Render.com** (Gratis)
3. **Heroku** (Gratis limitado)
4. **VPS** (Digital Ocean, Linode)
5. **Vercel** (Solo funciones serverless)

### Ejemplo: Railway

1. Crear cuenta en railway.app
2. "New Project" > "Deploy from GitHub"
3. Seleccionar repositorio
4. Configurar variables de entorno
5. Deploy automático

### Variables de Entorno en Producción

Configurar en el panel de hosting:
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_BUSINESS_ACCOUNT_ID`
- `WHATSAPP_FROM_NUMBER`
- `PORT`
- `FRONTEND_URL` (tu dominio real)

---

## 📚 Recursos Adicionales

- **Meta for Developers:** https://developers.facebook.com/docs/whatsapp
- **Cloud API Docs:** https://developers.facebook.com/docs/whatsapp/cloud-api
- **API Reference:** https://developers.facebook.com/docs/whatsapp/cloud-api/reference
- **Consola de Meta Business:** https://business.facebook.com/
- **Soporte:** https://developers.facebook.com/support/

---

## 🎉 ¡Listo!

Ahora tienes un backend completo que envía WhatsApp **AUTOMÁTICAMENTE** desde tu número **9515886761** usando la API oficial de Meta.

**Beneficios:**
- ✅ Envío 100% automático
- ✅ No requiere intervención manual
- ✅ Desde TU número verificado
- ✅ 1,000 mensajes gratis/mes
- ✅ Escalable a millones
- ✅ API oficial de Meta

**¿Necesitas ayuda?**
- Revisa la sección de Troubleshooting
- Verifica los logs del backend
- Prueba con curl/Postman primero
