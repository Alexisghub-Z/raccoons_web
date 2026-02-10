import apiClient from './client.js';

export const userService = {
  async create(userData) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  async getAll() {
    const response = await apiClient.get('/users');
    return response.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  async update(id, userData) {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  },

  async delete(id) {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  }
};
