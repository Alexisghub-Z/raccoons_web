/**
 * Utilidades para manejo de estados de servicios
 * Centraliza la lógica de colores y textos de estados
 */

export const SERVICE_STATUSES = {
  RECEIVED: 'RECEIVED',
  IN_DIAGNOSIS: 'IN_DIAGNOSIS',
  IN_REPAIR: 'IN_REPAIR',
  READY_FOR_PICKUP: 'READY_FOR_PICKUP',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

const STATUS_COLORS = {
  'RECEIVED': '#06b6d4',
  'IN_DIAGNOSIS': '#f59e0b',
  'IN_REPAIR': '#ef4444',
  'READY_FOR_PICKUP': '#10b981',
  'DELIVERED': '#6366f1',
  'CANCELLED': '#94a3b8',
  // Mantener compatibilidad con formato antiguo
  'recibido': '#06b6d4',
  'en_diagnostico': '#f59e0b',
  'en_reparacion': '#ef4444',
  'listo': '#10b981',
  'entregado': '#6366f1'
};

const STATUS_TEXTS = {
  'RECEIVED': 'Recibido',
  'IN_DIAGNOSIS': 'En Diagnóstico',
  'IN_REPAIR': 'En Reparación',
  'READY_FOR_PICKUP': 'Listo para Entrega',
  'DELIVERED': 'Entregado',
  'CANCELLED': 'Cancelado',
  // Mantener compatibilidad con formato antiguo
  'recibido': 'Recibido',
  'en_diagnostico': 'En Diagnóstico',
  'en_reparacion': 'En Reparación',
  'listo': 'Listo para Entrega',
  'entregado': 'Entregado'
};

export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || '#a0a0a0';
};

export const getStatusText = (status) => {
  return STATUS_TEXTS[status] || status;
};
