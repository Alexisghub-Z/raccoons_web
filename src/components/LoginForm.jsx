import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowLeft, Shield, Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Leer valores directamente del DOM para cubrir autofill que no dispara onChange
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const email = (emailInput?.value || formData.email).trim();
    const password = passwordInput?.value || formData.password;

    try {
      await authService.login(email, password);
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
      <div className="login-background-pattern"></div>

      <div className="admin-login-container">
        {/* Logo y Header */}
        <div className="admin-login-header">
          <div className="login-logo-wrapper">
            <div className="login-logo-icon">
              <img src="/logo.png" alt="Raccoons Taller Logo" className="login-logo-image" />
            </div>
          </div>
          <h1>Raccoons Taller</h1>
          <p className="login-subtitle">
            <Shield size={16} />
            Panel de Administración
          </p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {/* Email Input */}
          <div className="admin-input-group">
            <label htmlFor="email">
              <Mail size={16} />
              Email
            </label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="admin@raccoons.com"
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="admin-input-group">
            <label htmlFor="password">
              <Lock size={16} />
              Contraseña
            </label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="admin-error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Iniciando sesión...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Ingresar al Panel
              </>
            )}
          </button>

          {/* Back Button */}
          <button
            type="button"
            className="admin-back-btn"
            onClick={() => navigate('/')}
            disabled={loading}
          >
            <ArrowLeft size={18} />
            Volver al Sitio
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
