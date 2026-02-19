import apiClient from './client.js';

export const userService = {
  async create(userData) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  async getAll(filters = {}) {
    const queryParams = new URLSearchParams();

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';

    const response = await apiClient.get(endpoint);
    return response;
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
