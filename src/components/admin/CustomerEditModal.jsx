import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, Mail, Phone, X, Save, Loader2, AlertCircle } from 'lucide-react';
import './CustomerEditModal.css';

function CustomerEditModal({ isOpen, onClose, onSubmit, customer, isLoading, externalErrors }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (customer && isOpen) {
      setFormData({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        email: customer.email || '',
        phone: customer.phone || ''
      });
      setFieldErrors({});
    }
  }, [customer, isOpen]);

  // Aplicar errores externos (del backend) cuando lleguen
  useEffect(() => {
    if (externalErrors && Object.keys(externalErrors).length > 0) {
      setFieldErrors(externalErrors);
    }
  }, [externalErrors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo al escribir
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFieldErrors({});

    // Validar campos requeridos
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es requerido';
    if (!formData.email.trim()) newErrors.email = 'El email es requerido';

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    onSubmit(customer.id, formData);
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    });
    setFieldErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content customer-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <User size={22} />
            Editar Cliente
          </h2>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="customer-edit-form">
          {fieldErrors.submit && (
            <div className="error-banner">
              <AlertCircle size={18} />
              <span>{fieldErrors.submit}</span>
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="firstName">
                Nombre <span className="required">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Ej: Juan"
                className={fieldErrors.firstName ? 'error' : ''}
                disabled={isLoading}
              />
              {fieldErrors.firstName && (
                <span className="field-error">{fieldErrors.firstName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">
                Apellido
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Ej: Pérez"
                className={fieldErrors.lastName ? 'error' : ''}
                disabled={isLoading}
              />
              {fieldErrors.lastName && (
                <span className="field-error">{fieldErrors.lastName}</span>
              )}
            </div>

            <div className="form-group full-width">
              <label htmlFor="email">
                <Mail size={16} />
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="cliente@email.com"
                className={fieldErrors.email ? 'error' : ''}
                disabled={isLoading}
              />
              {fieldErrors.email && (
                <span className="field-error">{fieldErrors.email}</span>
              )}
            </div>

            <div className="form-group full-width">
              <label htmlFor="phone">
                <Phone size={16} />
                Teléfono
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9511234567"
                className={fieldErrors.phone ? 'error' : ''}
                disabled={isLoading}
              />
              {fieldErrors.phone && (
                <span className="field-error">{fieldErrors.phone}</span>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="spinning" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default CustomerEditModal;
