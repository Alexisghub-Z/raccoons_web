/**
 * Appointment Entity - Representa una cita agendada
 */
export class Appointment {
  constructor({
    id,
    customerId,
    scheduledDate,
    motorcycle,
    serviceType,
    description,
    status = 'PENDING',
    reminderSent = false,
    googleEventId,
    notes,
    cancellationReason,
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id;
    this.customerId = customerId;
    this.scheduledDate = scheduledDate;
    this.motorcycle = motorcycle;
    this.serviceType = serviceType;
    this.description = description;
    this.status = status;
    this.reminderSent = reminderSent;
    this.googleEventId = googleEventId;
    this.notes = notes;
    this.cancellationReason = cancellationReason;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  isPending() {
    return this.status === 'PENDING';
  }

  isConfirmed() {
    return this.status === 'CONFIRMED';
  }

  isCompleted() {
    return this.status === 'COMPLETED';
  }

  isCancelled() {
    return this.status === 'CANCELLED';
  }

  isNoShow() {
    return this.status === 'NO_SHOW';
  }

  confirm() {
    if (!this.isPending()) {
      throw new Error('Only pending appointments can be confirmed');
    }
    this.status = 'CONFIRMED';
    this.updatedAt = new Date();
  }

  complete() {
    if (!this.isConfirmed()) {
      throw new Error('Only confirmed appointments can be completed');
    }
    this.status = 'COMPLETED';
    this.updatedAt = new Date();
  }

  cancel(reason) {
    if (this.isCompleted()) {
      throw new Error('Cannot cancel completed appointments');
    }
    this.status = 'CANCELLED';
    this.cancellationReason = reason;
    this.updatedAt = new Date();
  }

  markAsNoShow() {
    if (!this.isConfirmed()) {
      throw new Error('Only confirmed appointments can be marked as no-show');
    }
    this.status = 'NO_SHOW';
    this.updatedAt = new Date();
  }

  markReminderSent() {
    this.reminderSent = true;
    this.updatedAt = new Date();
  }

  isPastDue() {
    return new Date() > new Date(this.scheduledDate);
  }

  needsReminder(hoursBeforeAppointment = 24) {
    if (this.reminderSent || !this.isConfirmed()) {
      return false;
    }
    const reminderTime = new Date(this.scheduledDate);
    reminderTime.setHours(reminderTime.getHours() - hoursBeforeAppointment);
    return new Date() >= reminderTime;
  }
}
