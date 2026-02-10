/**
 * Notification Repository Interface
 */
export class INotificationRepository {
  async findById(id) {
    throw new Error('Method not implemented');
  }

  async findByUserId(userId) {
    throw new Error('Method not implemented');
  }

  async create(notificationData) {
    throw new Error('Method not implemented');
  }

  async update(id, notificationData) {
    throw new Error('Method not implemented');
  }

  async delete(id) {
    throw new Error('Method not implemented');
  }

  async findAll(filters = {}) {
    throw new Error('Method not implemented');
  }

  async findPending() {
    throw new Error('Method not implemented');
  }

  async findFailed() {
    throw new Error('Method not implemented');
  }

  async markAsRead(id) {
    throw new Error('Method not implemented');
  }

  async markAsSent(id) {
    throw new Error('Method not implemented');
  }

  async markAsFailed(id, errorMessage) {
    throw new Error('Method not implemented');
  }
}
