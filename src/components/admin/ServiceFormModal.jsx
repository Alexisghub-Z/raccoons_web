import { useState, useEffect } from 'react';
import { Wrench, User, Bike, CheckCircle2, Loader2, X, UserCheck } from 'lucide-react';
import { userService } from '../../api/user.service';
import './ServiceFormModal.css';

function ServiceFormModal({ isOpen, onClose, onSubmit, isLoading, selectedCustomer }) {
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    motorcycle: '',
    serviceType: '',
    notes: ''
  });

  const [existingCustomer, setExistingCustomer] = useState(null);
  const [searchingCustomer, setSearchingCustomer] = useState(false);

  // Cargar datos del cliente seleccionado
  useEffect(() => {
    if (selectedCustomer && isOpen) {
      setFormData(prev => ({
        ...prev,
        clientName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`.trim(),
        clientEmail: selectedCustomer.email || '',
        clientPhone: selectedCustomer.phone || ''
      }));
      setExistingCustomer(selectedCustomer);
    }
  }, [selectedCustomer, isOpen]);

  // Buscar cliente existente cuando cambie email o teléfono
  useEffect(() => {
    // No buscar si ya tenemos un cliente seleccionado
    if (selectedCustomer) return;

    const searchCustomer = async () => {
      if (!formData.clientEmail && !formData.clientPhone) {
        setExistingCustomer(null);
        return;
      }

      setSearchingCustomer(true);
      try {
        const response = await userService.getAll({ role: 'CUSTOMER', limit: 1000 });
        const allUsers = response.data || [];
        const found = allUsers.find(user => {
          if (formData.clientEmail && user.email === formData.clientEmail) {
            return true;
          }
          if (formData.clientPhone && user.phone === formData.clientPhone) {
            return true;
          }
          return false;
        });

        if (found) {
          setExistingCustomer(found);
          // Autocompletar nombre si está vacío
          if (!formData.clientName) {
            setFormData(prev => ({
              ...prev,
              clientName: `${found.firstName} ${found.lastName}`.trim(),
              clientEmail: found.email || prev.clientEmail,
              clientPhone: found.phone || prev.clientPhone
            }));
          }
        } else {
          setExistingCustomer(null);
        }
      } catch (error) {
        console.error('Error buscando cliente:', error);
        setExistingCustomer(null);
      } finally {
        setSearchingCustomer(false);
      }
    };

    const timeoutId = setTimeout(searchCustomer, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.clientEmail, formData.clientPhone]);

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
    setExistingCustomer(null);
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
    setExistingCustomer(null);
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
            <div className="section-header-with-badge">
              <h3>
                <User size={20} />
                Información del Cliente
              </h3>
              {existingCustomer && (
                <div className="customer-found-badge">
                  <UserCheck size={16} />
                  Cliente Existente
                </div>
              )}
            </div>
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
