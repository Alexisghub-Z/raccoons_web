import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/auth.service';
import './LoginForm.css';

function LoginForm({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(formData.email, formData.password);
      onLoginSuccess();
    } catch (err) {
      console.error('Login error:', err);

      // Manejar diferentes tipos de error
      if (err.message.includes('Invalid credentials') || err.message.includes('credenciales')) {
        setError('Email o contraseña incorrectos');
      } else if (err.message.includes('not found') || err.message.includes('no existe')) {
        setError('Usuario no encontrado');
      } else if (err.message.includes('network') || err.message.includes('Failed to fetch')) {
        setError('Error de conexión. Verifica que el servidor esté funcionando.');
      } else {
        setError(err.message || 'Error al iniciar sesión. Por favor intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-login">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <h1>🦝 RACCOONS</h1>
          <p>Panel de Administración</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="admin@raccoons.com"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="admin-input-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {error && <div className="admin-error-message">{error}</div>}

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Ingresar'}
          </button>
          <button
            type="button"
            className="admin-back-btn"
            onClick={() => navigate('/')}
            disabled={loading}
          >
            Volver al sitio
          </button>
        </form>

        <div className="admin-login-hint">
          <p>Credenciales de prueba:</p>
          <p>Email: admin@raccoons.com</p>
          <p>Password: admin123</p>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
