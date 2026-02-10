import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, AlertCircle } from 'lucide-react';
import './ServiceEditModal.css';

function ServiceEditModal({ isOpen, onClose, service, onSave }) {
  const [formData, setFormData] = useState({
    motorcycle: '',
    serviceType: '',
    notes: '',
    customerFirstName: '',
    customerLastName: '',
    customerPhone: '',
    customerEmail: ''
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (service) {
      setFormData({
        motorcycle: service.motorcycle || '',
        serviceType: service.serviceType || '',
        notes: service.notes || '',
        customerFirstName: service.customer?.firstName || '',
        customerLastName: service.customer?.lastName || '',
        customerPhone: service.customer?.phone || '',
        customerEmail: service.customer?.email || ''
      });
      setErrors({});
    }
  }, [service]);

  const validateForm = () => {
    const newErrors = {};

    // Validar moto
    if (!formData.motorcycle.trim()) {
      newErrors.motorcycle = 'La motocicleta es requerida';
    } else if (formData.motorcycle.trim().length < 3) {
      newErrors.motorcycle = 'Mínimo 3 caracteres';
    }

    // Validar tipo de servicio
    if (!formData.serviceType.trim()) {
      newErrors.serviceType = 'El tipo de servicio es requerido';
    }

    // Validar nombre del cliente
    if (!formData.customerFirstName.trim()) {
      newErrors.customerFirstName = 'El nombre es requerido';
    } else if (formData.customerFirstName.trim().length < 2) {
      newErrors.customerFirstName = 'Mínimo 2 caracteres';
    }

    if (!formData.customerLastName.trim()) {
      newErrors.customerLastName = 'El apellido es requerido';
    } else if (formData.customerLastName.trim().length < 2) {
      newErrors.customerLastName = 'Mínimo 2 caracteres';
    }

    // Validar teléfono (opcional pero con formato)
    if (formData.customerPhone.trim()) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.customerPhone.replace(/[\s-]/g, ''))) {
        newErrors.customerPhone = 'Formato inválido (10 dígitos)';
      }
    }

    // Validar email (opcional pero con formato)
    if (formData.customerEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.customerEmail)) {
        newErrors.customerEmail = 'Formato de email inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      await onSave(service.id, formData);
      onClose();
    } catch (error) {
      console.error('Error saving service:', error);
      setErrors({ submit: error.message || 'Error al guardar los cambios' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setFormData({
        motorcycle: '',
        serviceType: '',
        notes: '',
        customerFirstName: '',
        customerLastName: '',
        customerPhone: '',
        customerEmail: ''
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar Servicio</h2>
          <button
            className="modal-close-btn"
            onClick={handleClose}
            disabled={isSaving}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {errors.submit && (
            <div className="error-banner">
              <AlertCircle size={20} />
              <span>{errors.submit}</span>
            </div>
          )}

          <div className="form-section">
            <h3 className="section-title">Información del Servicio</h3>

            <div className="form-group">
              <label htmlFor="motorcycle">
                Motocicleta <span className="required">*</span>
              </label>
              <input
                type="text"
                id="motorcycle"
                name="motorcycle"
                value={formData.motorcycle}
                onChange={handleChange}
                className={errors.motorcycle ? 'error' : ''}
                placeholder="Ej: Honda CB190R 2020"
                disabled={isSaving}
              />
              {errors.motorcycle && (
                <span className="error-message">{errors.motorcycle}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="serviceType">
                Tipo de Servicio <span className="required">*</span>
              </label>
              <input
                type="text"
                id="serviceType"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                className={errors.serviceType ? 'error' : ''}
                placeholder="Ej: Mantenimiento preventivo"
                disabled={isSaving}
              />
              {errors.serviceType && (
                <span className="error-message">{errors.serviceType}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notas del Servicio</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Observaciones adicionales..."
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Información del Cliente</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="customerFirstName">
                  Nombre <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="customerFirstName"
                  name="customerFirstName"
                  value={formData.customerFirstName}
                  onChange={handleChange}
                  className={errors.customerFirstName ? 'error' : ''}
                  placeholder="Nombre del cliente"
                  disabled={isSaving}
                />
                {errors.customerFirstName && (
                  <span className="error-message">{errors.customerFirstName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="customerLastName">
                  Apellido <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="customerLastName"
                  name="customerLastName"
                  value={formData.customerLastName}
                  onChange={handleChange}
                  className={errors.customerLastName ? 'error' : ''}
                  placeholder="Apellido del cliente"
                  disabled={isSaving}
                />
                {errors.customerLastName && (
                  <span className="error-message">{errors.customerLastName}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="customerPhone">Teléfono</label>
                <input
                  type="tel"
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  className={errors.customerPhone ? 'error' : ''}
                  placeholder="10 dígitos"
                  disabled={isSaving}
                />
                {errors.customerPhone && (
                  <span className="error-message">{errors.customerPhone}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="customerEmail">Email</label>
                <input
                  type="email"
                  id="customerEmail"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  className={errors.customerEmail ? 'error' : ''}
                  placeholder="cliente@ejemplo.com"
                  disabled={isSaving}
                />
                {errors.customerEmail && (
                  <span className="error-message">{errors.customerEmail}</span>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleClose}
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spinner"></span>
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

export default ServiceEditModal;
