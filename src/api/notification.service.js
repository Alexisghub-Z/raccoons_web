import apiClient from './client.js';

export const notificationService = {
  async getUnread() {
    const response = await apiClient.get('/notifications/unread');
    return response.data;
  },

  async getAll(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') queryParams.append(k, v);
    });
    const qs = queryParams.toString();
    const response = await apiClient.get(qs ? `/notifications?${qs}` : '/notifications');
    return response.data;
  },

  async markRead(id) {
    const response = await apiClient.put(`/notifications/${id}/read`);
    return response.data;
  },
};
