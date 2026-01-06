/**
 * Utilidades para manejo de estados de servicios
 * Centraliza la lógica de colores y textos de estados
 */

export const SERVICE_STATUSES = {
  RECIBIDO: 'recibido',
  EN_DIAGNOSTICO: 'en_diagnostico',
  EN_REPARACION: 'en_reparacion',
  LISTO: 'listo',
  ENTREGADO: 'entregado'
};

const STATUS_COLORS = {
  [SERVICE_STATUSES.RECIBIDO]: '#06b6d4',
  [SERVICE_STATUSES.EN_DIAGNOSTICO]: '#f59e0b',
  [SERVICE_STATUSES.EN_REPARACION]: '#ef4444',
  [SERVICE_STATUSES.LISTO]: '#10b981',
  [SERVICE_STATUSES.ENTREGADO]: '#6366f1'
};

const STATUS_TEXTS = {
  [SERVICE_STATUSES.RECIBIDO]: 'Recibido',
  [SERVICE_STATUSES.EN_DIAGNOSTICO]: 'En Diagnóstico',
  [SERVICE_STATUSES.EN_REPARACION]: 'En Reparación',
  [SERVICE_STATUSES.LISTO]: 'Listo para Entrega',
  [SERVICE_STATUSES.ENTREGADO]: 'Entregado'
};

export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || '#a0a0a0';
};

export const getStatusText = (status) => {
  return STATUS_TEXTS[status] || status;
};
