const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

class ApiClient {
  constructor() {
    this.baseURL = API_URL;
    this.token = localStorage.getItem('accessToken');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  getToken() {
    return this.token || localStorage.getItem('accessToken');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {};

    // Solo agregar Content-Type si no es FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Agregar Authorization header si hay token
    if (this.getToken() && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${this.getToken()}`;
    }

    // Mezclar con headers personalizados (pero sin sobrescribir los importantes)
    const finalHeaders = {
      ...headers,
      ...(options.headers || {}),
    };

    const config = {
      ...options,
      headers: finalHeaders,
    };

    // Solo stringify si no es FormData
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body);
    } else if (options.body instanceof FormData) {
      config.body = options.body;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Manejar diferentes tipos de errores
        if (response.status === 401) {
          // En endpoints de auth (login/register) no limpiar ni redirigir
          if (!options.skipAuth) {
            this.setToken(null);
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('admin_authenticated');

            const errorMessage = data.error?.message || '';
            if (errorMessage.includes('expired') || errorMessage.includes('Invalid')) {
              throw new Error('SESSION_EXPIRED');
            } else if (errorMessage.includes('No token')) {
              throw new Error('NO_AUTH');
            }
            throw new Error('UNAUTHORIZED');
          }
          // Login/register con credenciales incorrectas
          throw new Error(data.error?.message || 'Credenciales incorrectas');
        }

        if (response.status === 403) {
          throw new Error('FORBIDDEN');
        }

        if (response.status === 400) {
          const errorMessage = data.error?.message || 'Solicitud inválida';
          // Mejorar mensajes de validación
          if (errorMessage.includes('Cannot transition')) {
            const match = errorMessage.match(/Cannot transition from (\w+) to (\w+)/);
            if (match) {
              const statusNames = {
                'RECEIVED': 'Recibido',
                'IN_DIAGNOSIS': 'En Diagnóstico',
                'IN_REPAIR': 'En Reparación',
                'READY_FOR_PICKUP': 'Listo para Entrega',
                'DELIVERED': 'Entregado',
                'CANCELLED': 'Cancelado'
              };
              const from = statusNames[match[1]] || match[1];
              const to = statusNames[match[2]] || match[2];
              throw new Error(`No se puede cambiar de "${from}" a "${to}"`);
            }
          }
          throw new Error(errorMessage);
        }

        if (response.status === 404) {
          throw new Error(data.error?.message || 'Recurso no encontrado');
        }

        if (response.status === 500) {
          throw new Error('Error en el servidor. Por favor intenta nuevamente.');
        }

        throw new Error(data.error?.message || 'Error en la solicitud');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export default new ApiClient();
