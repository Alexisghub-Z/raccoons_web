import apiClient from './client.js';

export const serviceService = {
  async create(serviceData) {
    const response = await apiClient.post('/services', serviceData);
    return response.data;
  },

  async getAll(filters = {}) {
    const queryParams = new URLSearchParams();

    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/services?${queryString}` : '/services';

    const response = await apiClient.get(endpoint);
    return response.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/services/${id}`);
    return response.data;
  },

  async getByCode(code) {
    const response = await apiClient.get(`/services/code/${code}`, { skipAuth: true });
    return response.data;
  },

  async update(id, serviceData) {
    const response = await apiClient.put(`/services/${id}`, serviceData);
    return response.data;
  },

  async updateStatus(id, status, notes) {
    const response = await apiClient.put(`/services/${id}/status`, { status, notes });
    return response.data;
  },

  async delete(id) {
    const response = await apiClient.delete(`/services/${id}`);
    return response.data;
  },

  async uploadEvidence(id, files, description) {
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    if (description) {
      formData.append('description', description);
    }

    const response = await apiClient.request(`/services/${id}/evidence`, {
      method: 'POST',
      body: formData
      // No especificar headers para que el navegador establezca Content-Type automáticamente
    });

    return response.data;
  },

  async getEvidence(id) {
    const response = await apiClient.get(`/services/${id}/evidence`);
    return response.data;
  },

  async deleteEvidence(id, evidenceId) {
    const response = await apiClient.delete(`/services/${id}/evidence/${evidenceId}`);
    return response.data;
  }
};
