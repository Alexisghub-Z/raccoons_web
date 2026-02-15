import { useState, useEffect } from 'react';
import { User, Mail, Phone, X, Save, Loader2 } from 'lucide-react';
import './CustomerEditModal.css';

function CustomerEditModal({ isOpen, onClose, onSubmit, customer, isLoading }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (customer && isOpen) {
      setFormData({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        email: customer.email || '',
        phone: customer.phone || ''
      });
    }
  }, [customer, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar campos requeridos
    if (!formData.firstName.trim()) {
      alert('Por favor ingresa el nombre');
      return;
    }
    if (!formData.email.trim()) {
      alert('Por favor ingresa el email');
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
    onClose();
  };

  if (!isOpen) return null;

  return (
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
                required
                disabled={isLoading}
              />
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
                disabled={isLoading}
              />
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
                required
                disabled={isLoading}
              />
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
                disabled={isLoading}
              />
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
    </div>
  );
}

export default CustomerEditModal;
