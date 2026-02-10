/**
 * Service Entity - Representa un servicio de mantenimiento/reparación
 */
export class Service {
  constructor({
    id,
    code,
    customerId,
    customer,
    motorcycle,
    brand,
    model,
    year,
    plate,
    serviceType,
    description,
    status = 'RECEIVED',
    estimatedCost,
    finalCost,
    estimatedDate,
    deliveryDate,
    notes,
    internalNotes,
    evidence,
    statusHistory,
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id;
    this.code = code;
    this.customerId = customerId;
    this.customer = customer;
    this.motorcycle = motorcycle;
    this.brand = brand;
    this.model = model;
    this.year = year;
    this.plate = plate;
    this.serviceType = serviceType;
    this.description = description;
    this.status = status;
    this.estimatedCost = estimatedCost;
    this.finalCost = finalCost;
    this.estimatedDate = estimatedDate;
    this.deliveryDate = deliveryDate;
    this.notes = notes;
    this.internalNotes = internalNotes;
    this.evidence = evidence;
    this.statusHistory = statusHistory;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static generateCode() {
    return 'RCN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  isReceived() {
    return this.status === 'RECEIVED';
  }

  isInDiagnosis() {
    return this.status === 'IN_DIAGNOSIS';
  }

  isInRepair() {
    return this.status === 'IN_REPAIR';
  }

  isWaitingParts() {
    return this.status === 'WAITING_PARTS';
  }

  isReadyForPickup() {
    return this.status === 'READY_FOR_PICKUP';
  }

  isDelivered() {
    return this.status === 'DELIVERED';
  }

  isCancelled() {
    return this.status === 'CANCELLED';
  }

  canUpdateStatus(newStatus) {
    // Orden de estados: RECEIVED -> IN_DIAGNOSIS -> IN_REPAIR -> READY_FOR_PICKUP -> DELIVERED
    const statusOrder = {
      RECEIVED: 0,
      IN_DIAGNOSIS: 1,
      IN_REPAIR: 2,
      READY_FOR_PICKUP: 3,
      DELIVERED: 4,
      CANCELLED: 99
    };

    const currentOrder = statusOrder[this.status];
    const newOrder = statusOrder[newStatus];

    // Si el estado actual o nuevo no existe, no permitir
    if (currentOrder === undefined || newOrder === undefined) {
      return false;
    }

    // Si ya está entregado o cancelado, no se puede cambiar
    if (this.status === 'DELIVERED' || this.status === 'CANCELLED') {
      return false;
    }

    // Siempre se puede cancelar (excepto si ya está entregado o cancelado)
    if (newStatus === 'CANCELLED') {
      return true;
    }

    // Solo se puede avanzar hacia adelante o regresar un estado
    // Permitir saltar estados hacia adelante pero no retroceder más de 1
    if (newOrder > currentOrder) {
      return true; // Permitir avanzar a cualquier estado siguiente
    }

    if (newOrder === currentOrder - 1) {
      return true; // Permitir retroceder solo 1 estado
    }

    return false;
  }

  updateStatus(newStatus) {
    if (!this.canUpdateStatus(newStatus)) {
      throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
    }
    this.status = newStatus;
    this.updatedAt = new Date();
  }
}
