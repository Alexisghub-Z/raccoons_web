import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Wrench, User, Bike, CheckCircle2, Loader2, X, UserCheck, AlertCircle, Clock } from 'lucide-react';
import { serviceService } from '../../api/service.service';
import './ServiceFormModal.css';

function ServiceFormModal({ isOpen, onClose, onSubmit, isLoading, selectedCustomer, externalErrors }) {
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    motorcycle: '',
    serviceType: '',
    notes: '',
    customerId: null
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [existingCustomer, setExistingCustomer] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const suggestionsRef = useRef(null);
  const searchDebounce = useRef(null);

  // Cargar datos del cliente seleccionado desde fuera (ej: pestaña Clientes)
  useEffect(() => {
    if (selectedCustomer && isOpen) {
      const lastMoto = selectedCustomer.services?.[0]?.motorcycle || '';
      setFormData(prev => ({
        ...prev,
        clientName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`.trim(),
        clientEmail: selectedCustomer.email || '',
        clientPhone: selectedCustomer.phone || '',
        motorcycle: lastMoto,
        customerId: selectedCustomer.id
      }));
      setExistingCustomer(selectedCustomer);
    }
  }, [selectedCustomer, isOpen]);

  // Aplicar errores externos del backend
  useEffect(() => {
    if (externalErrors && Object.keys(externalErrors).length > 0) {
      setFieldErrors(externalErrors);
    }
  }, [externalErrors]);

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerSearch = (value) => {
    clearTimeout(searchDebounce.current);
    if (!value || value.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    searchDebounce.current = setTimeout(async () => {
      setSearching(true);
      try {
        setSuggestions(await serviceService.searchCustomers(value.trim()));
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value, customerId: null }));
    setExistingCustomer(null);
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: null }));

    if (['clientName', 'clientPhone', 'clientEmail'].includes(name)) {
      setActiveField(name);
      triggerSearch(value);
    }
  };

  const selectCustomer = (c) => {
    const lastMoto = c.services?.[0]?.motorcycle || '';
    setFormData(prev => ({
      ...prev,
      clientName: `${c.firstName} ${c.lastName}`.trim(),
      clientEmail: c.email || '',
      clientPhone: c.phone || '',
      motorcycle: lastMoto || prev.motorcycle,
      customerId: c.id
    }));
    setExistingCustomer(c);
    setSuggestions([]);
    setFieldErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFieldErrors({});

    const newErrors = {};
    if (!formData.clientName.trim()) newErrors.clientName = 'El nombre del cliente es requerido';
    if (!formData.clientPhone.trim()) newErrors.clientPhone = 'El teléfono del cliente es requerido';
    if (!formData.motorcycle.trim()) newErrors.motorcycle = 'La motocicleta es requerida';
    if (!formData.serviceType.trim()) newErrors.serviceType = 'El tipo de servicio es requerido';

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({ clientName: '', clientPhone: '', clientEmail: '', motorcycle: '', serviceType: '', notes: '', customerId: null });
    setExistingCustomer(null);
    setSuggestions([]);
    setFieldErrors({});
    onClose();
  };

  const uniqueMotos = (services) => {
    const seen = new Set();
    return services.filter(s => s.motorcycle && !seen.has(s.motorcycle) && seen.add(s.motorcycle));
  };

  if (!isOpen) return null;

  return createPortal(
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
          {fieldErrors.submit && (
            <div className="error-banner">
              <AlertCircle size={18} />
              <span>{fieldErrors.submit}</span>
            </div>
          )}

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
                  {existingCustomer.services?.length > 0 && (
                    <span className="customer-service-count">
                      · {existingCustomer.services.length} servicio{existingCustomer.services.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="form-grid" ref={suggestionsRef}>
              {/* Nombre */}
              <div className="form-group customer-autocomplete-wrap">
                <label htmlFor="clientName">
                  Nombre Completo <span className="required">*</span>
                </label>
                <div className="input-with-spinner">
                  <input
                    type="text"
                    id="clientName"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    onFocus={() => setActiveField('clientName')}
                    placeholder="Ej: Juan Pérez"
                    className={fieldErrors.clientName ? 'error' : ''}
                    autoComplete="off"
                  />
                  {searching && activeField === 'clientName' && <Loader2 size={14} className="input-spinner spinning" />}
                </div>
                {fieldErrors.clientName && <span className="field-error">{fieldErrors.clientName}</span>}
                {suggestions.length > 0 && activeField === 'clientName' && (
                  <SuggestionDropdown suggestions={suggestions} onSelect={selectCustomer} uniqueMotos={uniqueMotos} />
                )}
              </div>

              {/* Teléfono */}
              <div className="form-group customer-autocomplete-wrap">
                <label htmlFor="clientPhone">
                  Teléfono <span className="required">*</span>
                </label>
                <div className="input-with-spinner">
                  <input
                    type="tel"
                    id="clientPhone"
                    name="clientPhone"
                    value={formData.clientPhone}
                    onChange={handleChange}
                    onFocus={() => setActiveField('clientPhone')}
                    placeholder="Ej: 9511234567"
                    className={fieldErrors.clientPhone ? 'error' : ''}
                    autoComplete="off"
                  />
                  {searching && activeField === 'clientPhone' && <Loader2 size={14} className="input-spinner spinning" />}
                </div>
                {fieldErrors.clientPhone
                  ? <span className="field-error">{fieldErrors.clientPhone}</span>
                  : <span className="form-hint">Se enviará SMS automático si se proporciona</span>
                }
                {suggestions.length > 0 && activeField === 'clientPhone' && (
                  <SuggestionDropdown suggestions={suggestions} onSelect={selectCustomer} uniqueMotos={uniqueMotos} />
                )}
              </div>

              {/* Email */}
              <div className="form-group full-width customer-autocomplete-wrap">
                <label htmlFor="clientEmail">Email (Opcional)</label>
                <div className="input-with-spinner">
                  <input
                    type="email"
                    id="clientEmail"
                    name="clientEmail"
                    value={formData.clientEmail}
                    onChange={handleChange}
                    onFocus={() => setActiveField('clientEmail')}
                    placeholder="Ej: cliente@email.com"
                    className={fieldErrors.clientEmail ? 'error' : ''}
                    autoComplete="off"
                  />
                  {searching && activeField === 'clientEmail' && <Loader2 size={14} className="input-spinner spinning" />}
                </div>
                {fieldErrors.clientEmail && <span className="field-error">{fieldErrors.clientEmail}</span>}
                {suggestions.length > 0 && activeField === 'clientEmail' && (
                  <SuggestionDropdown suggestions={suggestions} onSelect={selectCustomer} uniqueMotos={uniqueMotos} />
                )}
              </div>

              {/* Motos previas del cliente seleccionado */}
              {existingCustomer?.services?.length > 0 && (
                <div className="form-group full-width">
                  <div className="prev-motos-hint">
                    <Clock size={13} />
                    <span>Motos anteriores:</span>
                    {uniqueMotos(existingCustomer.services).map(s => (
                      <button
                        key={s.motorcycle}
                        type="button"
                        className="prev-moto-chip"
                        onClick={() => setFormData(prev => ({ ...prev, motorcycle: s.motorcycle }))}
                      >
                        {s.motorcycle}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
                  className={fieldErrors.motorcycle ? 'error' : ''}
                />
                {fieldErrors.motorcycle && <span className="field-error">{fieldErrors.motorcycle}</span>}
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
                  className={fieldErrors.serviceType ? 'error' : ''}
                />
                {fieldErrors.serviceType && <span className="field-error">{fieldErrors.serviceType}</span>}
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
            <button type="button" onClick={handleClose} className="btn btn-secondary" disabled={isLoading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 size={18} className="spinning" />Creando...</>
              ) : (
                <><CheckCircle2 size={18} />Crear Servicio</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

function SuggestionDropdown({ suggestions, onSelect, uniqueMotos }) {
  return (
    <ul className="customer-suggestions">
      {suggestions.map(c => {
        const motos = uniqueMotos(c.services || []);
        return (
          <li key={c.id} onMouseDown={() => onSelect(c)}>
            <UserCheck size={15} className="suggestion-icon" />
            <div className="suggestion-info">
              <span className="suggestion-name">{c.firstName} {c.lastName}</span>
              <span className="suggestion-meta">
                {c.phone}
                {motos.length > 0 && ` · ${motos[0].motorcycle}`}
                {c.services?.length > 0 && ` · ${c.services.length} servicio${c.services.length !== 1 ? 's' : ''}`}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default ServiceFormModal;
