import apiClient from './client.js';

export const authService = {
  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password }, { skipAuth: true });

    if (response.success && response.data.tokens) {
      apiClient.setToken(response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  },

  async register(userData) {
    const response = await apiClient.post('/auth/register', userData, { skipAuth: true });

    if (response.success && response.data.tokens) {
      apiClient.setToken(response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  },

  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');

    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiClient.setToken(null);
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('admin_authenticated');
    }
  },

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post('/auth/refresh', { refreshToken }, { skipAuth: true });

    if (response.success && response.data.accessToken) {
      apiClient.setToken(response.data.accessToken);
    }

    return response.data;
  },

  async getMe() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!apiClient.getToken();
  },

  isAdmin() {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }
};
