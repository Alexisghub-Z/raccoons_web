import dotenv from 'dotenv';

dotenv.config();

export const whatsappConfig = {
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
  fromNumber: process.env.WHATSAPP_FROM_NUMBER,
  webhookVerifyToken: process.env.WEBHOOK_VERIFY_TOKEN,
  apiVersion: 'v18.0',
  apiUrl: 'https://graph.facebook.com'
};

// Validar configuración
export const validateConfig = () => {
  const required = ['phoneNumberId', 'accessToken', 'fromNumber'];
  const missing = required.filter(key => !whatsappConfig[key] || whatsappConfig[key].startsWith('TU_'));

  if (missing.length > 0) {
    console.warn(`⚠️  Advertencia: Configuración de WhatsApp incompleta`);
    console.warn(`   Faltan: ${missing.join(', ')}`);
    console.warn(`   Edita backend/.env con tus credenciales de Meta Business`);
    return false;
  }

  console.log('✅ Configuración de WhatsApp validada');
  return true;
};
