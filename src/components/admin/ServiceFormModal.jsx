import { useState } from 'react';
import { Wrench, User, Bike, CheckCircle2, Loader2, X } from 'lucide-react';
import './ServiceFormModal.css';

function ServiceFormModal({ isOpen, onClose, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    motorcycle: '',
    serviceType: '',
    notes: ''
  });

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
    if (!formData.clientName.trim()) {
      alert('Por favor ingresa el nombre del cliente');
      return;
    }
    if (!formData.motorcycle.trim()) {
      alert('Por favor ingresa la motocicleta');
      return;
    }
    if (!formData.serviceType.trim()) {
      alert('Por favor ingresa el tipo de servicio');
      return;
    }

    onSubmit(formData);

    // Reset form
    setFormData({
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      motorcycle: '',
      serviceType: '',
      notes: ''
    });
  };

  const handleClose = () => {
    setFormData({
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      motorcycle: '',
      serviceType: '',
      notes: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Wrench size={22} />
            Nuevo Servicio
          </h2>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="service-form">
          <div className="form-section">
            <h3>
              <User size={20} />
              Información del Cliente
            </h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="clientName">
                  Nombre Completo <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="clientPhone">Teléfono</label>
                <input
                  type="tel"
                  id="clientPhone"
                  name="clientPhone"
                  value={formData.clientPhone}
                  onChange={handleChange}
                  placeholder="Ej: 9511234567"
                />
                <span className="form-hint">Se enviará SMS automático si se proporciona</span>
              </div>

              <div className="form-group full-width">
                <label htmlFor="clientEmail">Email (Opcional)</label>
                <input
                  type="email"
                  id="clientEmail"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleChange}
                  placeholder="Ej: cliente@email.com"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>
              <Bike size={20} />
              Información del Servicio
            </h3>
            <div className="form-grid">
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
                  placeholder="Ej: Yamaha R1"
                  required
                />
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
                  placeholder="Ej: Mantenimiento General"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="notes">Notas (Opcional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Detalles adicionales sobre el servicio..."
                  rows="3"
                />
              </div>
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
                  Creando...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Crear Servicio
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ServiceFormModal;
