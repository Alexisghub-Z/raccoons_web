const FIELD_LABELS = {
  motorcycle: 'La motocicleta',
  serviceType: 'El tipo de servicio',
  notes: 'Las notas',
  internalNotes: 'Las notas internas',
  description: 'La descripción',
  firstName: 'El nombre',
  lastName: 'El apellido',
  email: 'El email',
  phone: 'El teléfono',
  password: 'La contraseña',
  customerId: 'El cliente',
  scheduledDate: 'La fecha',
  estimatedCost: 'El costo estimado',
  finalCost: 'El costo final',
  estimatedDate: 'La fecha estimada',
  deliveryDate: 'La fecha de entrega',
  year: 'El año',
  brand: 'La marca',
  model: 'El modelo',
  plate: 'La placa',
  status: 'El estado',
};

function fieldLabel(field) {
  if (!field) return 'El campo';
  return FIELD_LABELS[field] || `El campo "${field}"`;
}

export function translateJoiMessage(msg, field) {
  if (!msg) return 'Valor inválido';
  const label = fieldLabel(field);

  if (msg.includes('is required')) return `${label} es requerido`;
  if (msg.includes('must be a valid email')) return 'Debe ser un email válido';
  if (msg.includes('fails to match the required pattern')) {
    if (field === 'phone') return 'Teléfono inválido (ej: 9511234567 o +529511234567)';
    return `${label} tiene un formato inválido`;
  }

  const minLen = msg.match(/length must be at least (\d+)/);
  if (minLen) return `${label} debe tener al menos ${minLen[1]} caracteres`;

  const maxLen = msg.match(/length must be less than or equal to (\d+)/);
  if (maxLen) return `${label} debe tener máximo ${maxLen[1]} caracteres`;

  if (msg.includes('must be a string')) return `${label} debe ser texto`;
  if (msg.includes('must be a number')) return `${label} debe ser un número`;
  if (msg.includes('must be a valid date')) return `${label} debe ser una fecha válida`;
  if (msg.includes('must be greater than or equal to')) {
    const min = msg.match(/(\d+(\.\d+)?)/)?.[1];
    return `${label} debe ser mayor o igual a ${min}`;
  }
  if (msg.includes('must be less than or equal to')) {
    const max = msg.match(/(\d+(\.\d+)?)/)?.[1];
    return `${label} debe ser menor o igual a ${max}`;
  }
  if (msg.includes('is not allowed to be empty')) return `${label} no puede estar vacío`;
  if (msg.includes('must be one of')) {
    const opts = msg.match(/\[(.*?)\]/)?.[1];
    return `${label} debe ser uno de: ${opts || 'valores válidos'}`;
  }

  return msg;
}
