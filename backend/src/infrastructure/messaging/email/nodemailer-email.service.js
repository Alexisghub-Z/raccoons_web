import nodemailer from 'nodemailer';
import { config } from '../../../shared/config/index.js';
import { ExternalServiceError } from '../../../shared/errors/AppError.js';
import logger from '../../../shared/logger/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Ruta al logo de la empresa ──────────────────────────────────────────────
const LOGO_PATH = path.join(__dirname, '../../../../../public/logo.png');
// ─── Plantilla base HTML ──────────────────────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Raccoons Taller</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header con logo y barras de colores -->
          <tr>
            <td style="background:#1e3a8a;padding:0;text-align:center;position:relative;">
              <!-- Barras de colores superiores (trazos del logo) -->
              <div style="display:flex;height:6px;width:100%;">
                <div style="flex:1;background:#1e3a8a;"></div>
                <div style="flex:1;background:#0ea5e9;"></div>
                <div style="flex:1;background:#ef4444;"></div>
              </div>

              <!-- Contenido del header -->
              <div style="padding:28px 40px;">
                <img src="cid:raccoons-logo" alt="Raccoons Taller" width="140" height="120" style="display:block;margin:0 auto 12px;"/>
                <h1 style="margin:0;font-size:28px;font-weight:900;letter-spacing:4px;color:#ffffff;font-family:Impact,Arial Black,sans-serif;">RACCOONS TALLER</h1>
                <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.75);letter-spacing:2px;text-transform:uppercase;">Especialistas en Motocicletas · Oaxaca</p>
              </div>

              <!-- Barras de colores inferiores (trazos del logo) -->
              <div style="display:flex;height:6px;width:100%;">
                <div style="flex:1;background:#1e3a8a;"></div>
                <div style="flex:1;background:#0ea5e9;"></div>
                <div style="flex:1;background:#ef4444;"></div>
              </div>
            </td>
          </tr>

          <!-- Contenido -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8f9fa;padding:0;">
              <!-- Barras de colores superiores -->
              <div style="display:flex;height:4px;width:100%;">
                <div style="flex:1;background:#1e3a8a;"></div>
                <div style="flex:1;background:#0ea5e9;"></div>
                <div style="flex:1;background:#ef4444;"></div>
              </div>

              <div style="padding:24px 40px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="text-align:center;">
                      <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">Raccoons Taller · Lib. Atoyac 222, Eucaliptos, Oaxaca</p>
                      <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">
                        Este correo fue enviado automáticamente. Por favor no responder directamente.
                      </p>
                      <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} Raccoons Taller. Todos los derechos reservados.</p>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ─── Componentes reutilizables ────────────────────────────────────────────────
const badge = (text, color = '#1e3a8a') =>
  `<span style="display:inline-block;background-color:${color};color:#ffffff;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;padding:4px 12px;border-radius:20px;">${text}</span>`;

const codeBox = (code) =>
  `<div style="background:#f0f9ff;border-left:4px solid #1e3a8a;border-right:4px solid #0ea5e9;border-top:2px solid #f3f4f6;border-bottom:2px solid #f3f4f6;border-radius:10px;padding:20px;text-align:center;margin:24px 0;">
    <p style="margin:0 0 4px;font-size:12px;color:#6b7280;letter-spacing:2px;text-transform:uppercase;">Código de seguimiento</p>
    <p style="margin:0;font-size:28px;font-weight:700;color:#1e3a8a;letter-spacing:4px;font-family:monospace;">${code}</p>
  </div>`;

const ctaButton = (url, text) =>
  `<div style="text-align:center;margin:28px 0;">
    <a href="${url}" style="display:inline-block;background:#1e3a8a;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;letter-spacing:0.5px;border-bottom:3px solid #0ea5e9;">
      ${text}
    </a>
  </div>`;

const infoRow = (label, value) =>
  `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
      <span style="font-size:13px;color:#6b7280;">${label}</span>
    </td>
    <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;">
      <span style="font-size:13px;font-weight:600;color:#1a1a1a;">${value}</span>
    </td>
  </tr>`;

const statusLabel = (status) => {
  const map = {
    RECEIVED:          { text: 'Recibido',            color: '#6b7280' },
    IN_DIAGNOSIS:      { text: 'En Diagnóstico',      color: '#d97706' },
    IN_REPAIR:         { text: 'En Reparación',        color: '#2563eb' },
    READY_FOR_PICKUP:  { text: 'Listo para Entrega',   color: '#059669' },
    DELIVERED:         { text: 'Entregado',            color: '#7c3aed' },
    CANCELLED:         { text: 'Cancelado',            color: '#dc2626' },
  };
  const s = map[status] || { text: status, color: '#6b7280' };
  return badge(s.text, s.color);
};

// ─── Servicio de email ────────────────────────────────────────────────────────
export class NodemailerEmailService {
  constructor() {
    this.enabled = config.email.enabled;

    if (this.enabled) {
      if (!config.email.user || !config.email.password ||
          config.email.password === 'your-app-specific-password') {
        logger.warn('Email credentials not configured. Email service will simulate sends.');
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

      // Verificar conexión al iniciar
      this.transporter.verify((error) => {
        if (error) {
          logger.error('Email transporter verification failed:', error.message);
        } else {
          logger.info('Email service initialized and verified successfully');
        }
      });
    } else {
      logger.info('Email service is disabled');
    }
  }

  // ── Método base ─────────────────────────────────────────────────────────────
  async sendEmail(to, subject, html) {
    if (!this.enabled) {
      logger.warn(`[EMAIL SIMULADO] Para: ${to} | Asunto: ${subject}`);
      return { success: true, simulated: true, to, subject };
    }

    try {
      const result = await this.transporter.sendMail({
        from: `"${config.email.fromName}" <${config.email.fromAddress}>`,
        to,
        subject,
        html,
        attachments: [
          {
            filename: 'logo.png',
            path: LOGO_PATH,
            cid: 'raccoons-logo' // CID para referenciar en el HTML con cid:raccoons-logo
          }
        ]
      });

      logger.info(`Email enviado a ${to}`, { messageId: result.messageId, subject });
      return { success: true, messageId: result.messageId, to };
    } catch (error) {
      logger.error('Error enviando email:', { to, subject, error: error.message });
      throw new ExternalServiceError('Nodemailer', error.message, { to });
    }
  }

  // ── Servicio creado ──────────────────────────────────────────────────────────
  async sendServiceCreatedEmail(customerEmail, serviceCode, customerName, serviceDetails) {
    const subject = `🦝 Tu moto ha ingresado al taller — ${serviceCode}`;

    const content = `
      <p style="margin:0 0 8px;font-size:16px;color:#1a1a1a;">Hola, <strong>${customerName}</strong></p>
      <p style="margin:0 0 24px;font-size:15px;color:#4a5568;line-height:1.6;">
        Hemos recibido tu motocicleta en <strong>Raccoons Taller</strong>. A continuación encontrarás los detalles de tu servicio.
      </p>

      ${codeBox(serviceCode)}

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
        ${infoRow('Motocicleta', serviceDetails.motorcycle || '—')}
        ${infoRow('Tipo de servicio', serviceDetails.serviceType || '—')}
        ${infoRow('Estado actual', 'Recibido')}
        ${serviceDetails.description ? infoRow('Descripción', serviceDetails.description) : ''}
      </table>

      <p style="margin:0 0 8px;font-size:14px;color:#4a5568;line-height:1.6;">
        Puedes consultar el estado de tu moto en cualquier momento con tu código de seguimiento:
      </p>

      ${ctaButton(`${config.frontend?.url || 'http://localhost:5173'}/seguimiento`, 'Ver estado de mi moto')}

      <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;line-height:1.6;">
        Si tienes alguna pregunta, no dudes en contactarnos por WhatsApp o visitar nuestro taller.
      </p>
    `;

    return await this.sendEmail(customerEmail, subject, baseTemplate(content));
  }

  // ── Actualización de estado ──────────────────────────────────────────────────
  async sendStatusUpdateEmail(customerEmail, serviceCode, newStatus, customerName, motorcycle) {
    const statusMessages = {
      IN_DIAGNOSIS:     'Tu moto está siendo diagnosticada por nuestros técnicos.',
      IN_REPAIR:        'Nuestro equipo ya está trabajando en tu motocicleta.',
      READY_FOR_PICKUP: '¡Tu moto está lista! Puedes pasar a recogerla al taller.',
      DELIVERED:        'Tu motocicleta ha sido entregada. ¡Gracias por confiar en nosotros!',
      CANCELLED:        'Tu servicio ha sido cancelado. Contáctanos si tienes preguntas.',
    };

    const isReadyForPickup = newStatus === 'READY_FOR_PICKUP';
    const subject = isReadyForPickup
      ? `🟢 ¡Tu moto está lista para recoger! — ${serviceCode}`
      : `🔄 Actualización de servicio — ${serviceCode}`;

    const content = `
      <p style="margin:0 0 8px;font-size:16px;color:#1a1a1a;">Hola, <strong>${customerName}</strong></p>
      <p style="margin:0 0 24px;font-size:15px;color:#4a5568;line-height:1.6;">
        ${statusMessages[newStatus] || `El estado de tu servicio ha sido actualizado.`}
      </p>

      ${codeBox(serviceCode)}

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
        ${infoRow('Motocicleta', motorcycle || '—')}
        ${infoRow('Código de servicio', serviceCode)}
        ${infoRow('Nuevo estado', statusLabel(newStatus).replace(/style="[^"]*"/g, ''))}
      </table>

      ${ctaButton(`${config.frontend?.url || 'http://localhost:5173'}/seguimiento`, 'Ver detalles de mi servicio')}

      ${isReadyForPickup ? `
        <div style="background:#f0fdf4;border-left:4px solid #059669;border-radius:0 8px 8px 0;padding:16px 20px;margin:16px 0;">
          <p style="margin:0;font-size:14px;color:#065f46;line-height:1.6;">
            <strong>📍 Horario de entrega:</strong><br/>
            Lunes a Viernes: 8:00 — 18:00 hrs<br/>
            Sábado: 9:00 — 14:00 hrs
          </p>
        </div>
      ` : ''}
    `;

    return await this.sendEmail(customerEmail, subject, baseTemplate(content));
  }

  // ── Cita creada ──────────────────────────────────────────────────────────────
  async sendAppointmentCreatedEmail(customerEmail, customerName, appointmentData) {
    const date = new Date(appointmentData.scheduledDate);
    const formattedDate = date.toLocaleDateString('es-MX', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('es-MX', {
      hour: '2-digit', minute: '2-digit'
    });

    const subject = `📅 Cita registrada en Raccoons Taller`;

    const content = `
      <p style="margin:0 0 8px;font-size:16px;color:#1a1a1a;">Hola, <strong>${customerName}</strong></p>
      <p style="margin:0 0 24px;font-size:15px;color:#4a5568;line-height:1.6;">
        Hemos registrado tu cita en <strong>Raccoons Taller</strong>. Te esperamos en la fecha indicada.
      </p>

      <div style="background:#f0f4ff;border-radius:10px;padding:24px;margin:0 0 24px;text-align:center;">
        <p style="margin:0 0 4px;font-size:12px;color:#6b7280;letter-spacing:2px;text-transform:uppercase;">Fecha y hora</p>
        <p style="margin:0;font-size:22px;font-weight:700;color:#1e3a8a;">${formattedDate}</p>
        <p style="margin:4px 0 0;font-size:18px;color:#2563eb;">${formattedTime} hrs</p>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
        ${infoRow('Motocicleta', appointmentData.motorcycle || '—')}
        ${infoRow('Tipo de servicio', appointmentData.serviceType || '—')}
        ${infoRow('Estado', 'Pendiente de confirmación')}
        ${appointmentData.notes ? infoRow('Notas', appointmentData.notes) : ''}
      </table>

      <div style="background:#fffbeb;border-left:4px solid #d97706;border-radius:0 8px 8px 0;padding:16px 20px;margin:16px 0;">
        <p style="margin:0;font-size:14px;color:#92400e;line-height:1.6;">
          <strong>⚠️ Importante:</strong> Tu cita está pendiente de confirmación por parte de nuestro equipo. Te notificaremos cuando sea confirmada.
        </p>
      </div>

      ${ctaButton(`${config.frontend?.url || 'http://localhost:5173'}/citas`, 'Ver mis citas')}
    `;

    return await this.sendEmail(customerEmail, subject, baseTemplate(content));
  }

  // ── Cita confirmada ──────────────────────────────────────────────────────────
  async sendAppointmentConfirmedEmail(customerEmail, customerName, appointmentData) {
    const date = new Date(appointmentData.scheduledDate);
    const formattedDate = date.toLocaleDateString('es-MX', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('es-MX', {
      hour: '2-digit', minute: '2-digit'
    });

    const subject = `✅ Cita confirmada — ${formattedDate}`;

    const content = `
      <p style="margin:0 0 8px;font-size:16px;color:#1a1a1a;">Hola, <strong>${customerName}</strong></p>
      <p style="margin:0 0 24px;font-size:15px;color:#4a5568;line-height:1.6;">
        Tu cita ha sido <strong>confirmada</strong>. Te esperamos en Raccoons Taller.
      </p>

      <div style="background:#f0fdf4;border-radius:10px;padding:24px;margin:0 0 24px;text-align:center;">
        <p style="margin:0 0 4px;font-size:12px;color:#059669;letter-spacing:2px;text-transform:uppercase;">✓ Confirmada</p>
        <p style="margin:0;font-size:22px;font-weight:700;color:#065f46;">${formattedDate}</p>
        <p style="margin:4px 0 0;font-size:18px;color:#059669;">${formattedTime} hrs</p>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
        ${infoRow('Motocicleta', appointmentData.motorcycle || '—')}
        ${infoRow('Tipo de servicio', appointmentData.serviceType || '—')}
        ${appointmentData.notes ? infoRow('Notas', appointmentData.notes) : ''}
      </table>

      <div style="background:#f0f4ff;border-left:4px solid #2563eb;border-radius:0 8px 8px 0;padding:16px 20px;margin:16px 0;">
        <p style="margin:0;font-size:14px;color:#1e3a8a;line-height:1.6;">
          <strong>📍 Dirección:</strong><br/>
          Lib. Atoyac 222, Eucaliptos, 68050 Oaxaca de Juárez, Oax.<br/><br/>
          <strong>🕐 Horario:</strong><br/>
          Lunes a Viernes: 8:00 — 18:00 hrs · Sábado: 9:00 — 14:00 hrs
        </p>
      </div>
    `;

    return await this.sendEmail(customerEmail, subject, baseTemplate(content));
  }

  // ── Cita cancelada ───────────────────────────────────────────────────────────
  async sendAppointmentCancelledEmail(customerEmail, customerName, appointmentData) {
    const date = new Date(appointmentData.scheduledDate);
    const formattedDate = date.toLocaleDateString('es-MX', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const subject = `❌ Cita cancelada — ${formattedDate}`;

    const content = `
      <p style="margin:0 0 8px;font-size:16px;color:#1a1a1a;">Hola, <strong>${customerName}</strong></p>
      <p style="margin:0 0 24px;font-size:15px;color:#4a5568;line-height:1.6;">
        Tu cita del <strong>${formattedDate}</strong> ha sido cancelada.
        ${appointmentData.cancellationReason ? `<br/><br/>Motivo: <em>${appointmentData.cancellationReason}</em>` : ''}
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
        ${infoRow('Motocicleta', appointmentData.motorcycle || '—')}
        ${infoRow('Tipo de servicio', appointmentData.serviceType || '—')}
        ${infoRow('Estado', badge('Cancelada', '#dc2626'))}
      </table>

      <p style="margin:0 0 16px;font-size:14px;color:#4a5568;line-height:1.6;">
        Si deseas reagendar o tienes alguna pregunta, contáctanos:
      </p>

      ${ctaButton(`${config.frontend?.url || 'http://localhost:5173'}/citas`, 'Agendar nueva cita')}
    `;

    return await this.sendEmail(customerEmail, subject, baseTemplate(content));
  }

  // ── Recordatorio de cita ─────────────────────────────────────────────────────
  async sendAppointmentReminderEmail(customerEmail, customerName, appointmentData) {
    const date = new Date(appointmentData.scheduledDate);
    const formattedDate = date.toLocaleDateString('es-MX', {
      weekday: 'long', day: 'numeric', month: 'long'
    });
    const formattedTime = date.toLocaleTimeString('es-MX', {
      hour: '2-digit', minute: '2-digit'
    });

    const subject = `⏰ Recordatorio: tu cita es mañana — ${formattedDate}`;

    const content = `
      <p style="margin:0 0 8px;font-size:16px;color:#1a1a1a;">Hola, <strong>${customerName}</strong></p>
      <p style="margin:0 0 24px;font-size:15px;color:#4a5568;line-height:1.6;">
        Te recordamos que tienes una cita programada <strong>mañana</strong> en Raccoons Taller.
      </p>

      <div style="background:#f0f4ff;border-radius:10px;padding:24px;margin:0 0 24px;text-align:center;">
        <p style="margin:0 0 4px;font-size:12px;color:#6b7280;letter-spacing:2px;text-transform:uppercase;">Mañana</p>
        <p style="margin:0;font-size:22px;font-weight:700;color:#1e3a8a;">${formattedDate}</p>
        <p style="margin:4px 0 0;font-size:18px;color:#2563eb;">${formattedTime} hrs</p>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
        ${infoRow('Motocicleta', appointmentData.motorcycle || '—')}
        ${infoRow('Servicio', appointmentData.serviceType || '—')}
      </table>

      <div style="background:#f0f4ff;border-left:4px solid #2563eb;border-radius:0 8px 8px 0;padding:16px 20px;margin:16px 0;">
        <p style="margin:0;font-size:14px;color:#1e3a8a;line-height:1.6;">
          <strong>📍 Lib. Atoyac 222, Eucaliptos, Oaxaca</strong>
        </p>
      </div>

      <p style="margin:16px 0 0;font-size:13px;color:#9ca3af;line-height:1.6;">
        ¿Necesitas cancelar o reprogramar? Contáctanos con anticipación.
      </p>
    `;

    return await this.sendEmail(customerEmail, subject, baseTemplate(content));
  }

  // ── Solicitud de autorizacion ────────────────────────────────────────────────
  async sendAuthorizationRequestEmail(customerEmail, customerName, serviceCode, motorcycle, questionText) {
    const subject = `⚠️ Solicitud de autorizacion — ${serviceCode}`;

    const content = `
      <p style="margin:0 0 8px;font-size:16px;color:#1a1a1a;">Hola, <strong>${customerName}</strong></p>
      <p style="margin:0 0 24px;font-size:15px;color:#4a5568;line-height:1.6;">
        Necesitamos tu autorizacion para continuar con el servicio de tu motocicleta.
      </p>

      ${codeBox(serviceCode)}

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
        ${infoRow('Motocicleta', motorcycle || '—')}
        ${infoRow('Codigo de servicio', serviceCode)}
      </table>

      <div style="background:#fffbeb;border-left:4px solid #d97706;border-radius:0 8px 8px 0;padding:20px;margin:24px 0;">
        <p style="margin:0 0 4px;font-size:12px;color:#92400e;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Mensaje del taller:</p>
        <p style="margin:0;font-size:15px;color:#1a1a1a;line-height:1.6;">${questionText}</p>
      </div>

      <p style="margin:0 0 8px;font-size:14px;color:#4a5568;line-height:1.6;">
        Ingresa a la pagina de seguimiento con tu codigo para responder:
      </p>

      ${ctaButton(`${config.frontend?.url || 'http://localhost:5173'}/seguimiento`, 'Responder ahora')}

      <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;line-height:1.6;">
        Si prefieres, tambien puedes contactarnos directamente por WhatsApp.
      </p>
    `;

    return await this.sendEmail(customerEmail, subject, baseTemplate(content));
  }

  isEnabled() {
    return this.enabled;
  }
}

export default new NodemailerEmailService();
