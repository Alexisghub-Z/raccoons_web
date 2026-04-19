/**
 * AuthorizationQuestion Entity
 */
export class AuthorizationQuestion {
  constructor({
    id,
    serviceId,
    service,
    question,
    response = 'PENDING',
    customerMessage,
    adminMessage,
    respondedAt,
    attachments,
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id;
    this.serviceId = serviceId;
    this.service = service;
    this.question = question;
    this.response = response;
    this.customerMessage = customerMessage;
    this.adminMessage = adminMessage;
    this.respondedAt = respondedAt;
    this.attachments = attachments || [];
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  isPending() {
    return this.response === 'PENDING';
  }

  isAuthorized() {
    return this.response === 'AUTHORIZED';
  }

  isRejected() {
    return this.response === 'REJECTED';
  }
}
