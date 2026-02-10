/**
 * Notification Entity - Representa una notificación del sistema
 */
export class Notification {
  constructor({
    id,
    userId,
    type,
    channel,
    title,
    message,
    status = 'PENDING',
    sentAt,
    readAt,
    metadata,
    serviceId,
    appointmentId,
    retryCount = 0,
    errorMessage,
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id;
    this.userId = userId;
    this.type = type;
    this.channel = channel;
    this.title = title;
    this.message = message;
    this.status = status;
    this.sentAt = sentAt;
    this.readAt = readAt;
    this.metadata = metadata;
    this.serviceId = serviceId;
    this.appointmentId = appointmentId;
    this.retryCount = retryCount;
    this.errorMessage = errorMessage;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  isPending() {
    return this.status === 'PENDING';
  }

  isSent() {
    return this.status === 'SENT';
  }

  isFailed() {
    return this.status === 'FAILED';
  }

  isRead() {
    return this.status === 'READ';
  }

  markAsSent() {
    this.status = 'SENT';
    this.sentAt = new Date();
    this.updatedAt = new Date();
  }

  markAsFailed(errorMessage) {
    this.status = 'FAILED';
    this.errorMessage = errorMessage;
    this.updatedAt = new Date();
  }

  markAsRead() {
    this.status = 'READ';
    this.readAt = new Date();
    this.updatedAt = new Date();
  }

  incrementRetry() {
    this.retryCount += 1;
    this.updatedAt = new Date();
  }

  canRetry(maxRetries = 3) {
    return this.isFailed() && this.retryCount < maxRetries;
  }
}
