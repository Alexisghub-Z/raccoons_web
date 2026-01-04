import { useState, useEffect } from 'react';
import './ServiceTracking.css';

function ServiceTracking({ onClose }) {
  const [trackingCode, setTrackingCode] = useState('');
  const [serviceData, setServiceData] = useState(null);
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');
    setIsSearching(true);

    if (!trackingCode.trim()) {
      setError('Por favor ingresa un código de seguimiento');
      setIsSearching(false);
      return;
    }

    // Simular búsqueda con delay para mejor UX
    setTimeout(() => {
      const services = JSON.parse(localStorage.getItem('raccoons_services') || '[]');
      const service = services.find(s => s.code === trackingCode.toUpperCase());

      if (service) {
        setServiceData(service);
      } else {
        setError('Código de seguimiento no encontrado. Verifica e intenta de nuevo.');
        setServiceData(null);
      }
      setIsSearching(false);
    }, 500);
  };

  const getStatusColor = (status) => {
    const colors = {
      'recibido': '#06b6d4',
      'en_diagnostico': '#f59e0b',
      'en_reparacion': '#ef4444',
      'listo': '#10b981',
      'entregado': '#6366f1'
    };
    return colors[status] || '#a0a0a0';
  };

  const getStatusText = (status) => {
    const texts = {
      'recibido': 'Recibido',
      'en_diagnostico': 'En Diagnóstico',
      'en_reparacion': 'En Reparación',
      'listo': 'Listo para Entrega',
      'entregado': 'Entregado'
    };
    return texts[status] || status;
  };

  const getStatusIcon = (status) => {
    const icons = {
      'recibido': '◉',
      'en_diagnostico': '◎',
      'en_reparacion': '◈',
      'listo': '✓',
      'entregado': '★'
    };
    return icons[status] || '●';
  };

  const getStatusDescription = (status) => {
    const descriptions = {
      'recibido': 'Tu motocicleta ha sido recibida en nuestro taller',
      'en_diagnostico': 'Nuestros mecánicos están evaluando tu moto',
      'en_reparacion': 'Estamos trabajando en tu motocicleta',
      'listo': 'Tu moto está lista para ser recogida',
      'entregado': 'Servicio completado y entregado'
    };
    return descriptions[status] || 'Estado actualizado';
  };

  const getProgressPercentage = (status) => {
    const percentages = {
      'recibido': 20,
      'en_diagnostico': 40,
      'en_reparacion': 60,
      'listo': 80,
      'entregado': 100
    };
    return percentages[status] || 0;
  };

  const getDaysElapsed = (dateCreated) => {
    const created = new Date(dateCreated);
    const now = new Date();
    const diff = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="tracking-modal" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="tracking-title">
      <div className="tracking-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="tracking-close" onClick={onClose} aria-label="Cerrar modal">×</button>

        <div className="tracking-header-section">
          <h2 className="tracking-title" id="tracking-title">Seguimiento de Servicio</h2>
          <p className="tracking-subtitle">Consulta el estado de tu motocicleta en tiempo real</p>
        </div>

        <form onSubmit={handleSearch} className="tracking-form">
          <div className="tracking-input-group">
            <div className="tracking-input-wrapper">
              <input
                type="text"
                placeholder="Ej: RCN-ABC123XYZ"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                className="tracking-input"
                disabled={isSearching}
                aria-label="Código de seguimiento"
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              className="tracking-search-btn"
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <span className="tracking-spinner"></span>
                  Buscando...
                </>
              ) : (
                'Buscar'
              )}
            </button>
          </div>
          {error && (
            <div className="tracking-error" role="alert" aria-live="polite">
              {error}
            </div>
          )}
        </form>

        {serviceData && (
          <div className="tracking-result">
            {/* Status Card Principal */}
            <div className="tracking-status-card">
              <div className="tracking-status-icon" style={{ backgroundColor: getStatusColor(serviceData.status) }}>
                {getStatusIcon(serviceData.status)}
              </div>
              <div className="tracking-status-content">
                <h3 className="tracking-status-title">{getStatusText(serviceData.status)}</h3>
                <p className="tracking-status-description">{getStatusDescription(serviceData.status)}</p>
              </div>
              <div className="tracking-code-badge">
                <span className="tracking-code-label">Código</span>
                <span className="tracking-code-value">{serviceData.code}</span>
              </div>
            </div>

            {/* Barra de Progreso */}
            <div className="tracking-progress-section">
              <div className="tracking-progress-header">
                <span className="tracking-progress-label">Progreso del Servicio</span>
                <span className="tracking-progress-percentage">{getProgressPercentage(serviceData.status)}%</span>
              </div>
              <div className="tracking-progress-bar">
                <div
                  className="tracking-progress-fill"
                  style={{
                    width: `${getProgressPercentage(serviceData.status)}%`,
                    backgroundColor: getStatusColor(serviceData.status)
                  }}
                ></div>
              </div>
            </div>

            {/* Información Detallada */}
            <div className="tracking-details-grid">
              <div className="tracking-detail-card">
                <div className="tracking-detail-content">
                  <span className="tracking-detail-label">Cliente</span>
                  <span className="tracking-detail-value">{serviceData.clientName}</span>
                </div>
              </div>

              <div className="tracking-detail-card">
                <div className="tracking-detail-content">
                  <span className="tracking-detail-label">Motocicleta</span>
                  <span className="tracking-detail-value">{serviceData.motorcycle}</span>
                </div>
              </div>

              <div className="tracking-detail-card">
                <div className="tracking-detail-content">
                  <span className="tracking-detail-label">Tipo de Servicio</span>
                  <span className="tracking-detail-value">{serviceData.serviceType}</span>
                </div>
              </div>

              <div className="tracking-detail-card">
                <div className="tracking-detail-content">
                  <span className="tracking-detail-label">Ingreso</span>
                  <span className="tracking-detail-value">
                    {new Date(serviceData.dateCreated).toLocaleDateString('es-MX', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="tracking-detail-extra">
                    {getDaysElapsed(serviceData.dateCreated) === 0
                      ? 'Hoy'
                      : `Hace ${getDaysElapsed(serviceData.dateCreated)} ${getDaysElapsed(serviceData.dateCreated) === 1 ? 'día' : 'días'}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Notas del Servicio */}
            {serviceData.notes && (
              <div className="tracking-notes-card">
                <div className="tracking-notes-header">
                  <h4>Notas del Servicio</h4>
                </div>
                <p className="tracking-notes-text">{serviceData.notes}</p>
              </div>
            )}

            {/* Timeline Mejorado */}
            <div className="tracking-timeline-section">
              <h4 className="tracking-timeline-title">Historial de Estados</h4>
              <div className="tracking-timeline" role="list" aria-label="Progreso del servicio">
                {['recibido', 'en_diagnostico', 'en_reparacion', 'listo', 'entregado'].map((step, index) => {
                  const stepIndex = ['recibido', 'en_diagnostico', 'en_reparacion', 'listo', 'entregado'].indexOf(serviceData.status);
                  const isActive = stepIndex >= index;
                  const isCurrent = stepIndex === index;

                  return (
                    <div
                      key={step}
                      className={`timeline-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
                      role="listitem"
                      aria-current={isCurrent ? 'step' : undefined}
                    >
                      <div className="timeline-marker" aria-label={isActive ? 'Completado' : 'Pendiente'}>
                        <div className="timeline-marker-inner">
                          {isActive ? '✓' : index + 1}
                        </div>
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-status">{getStatusText(step)}</div>
                        <div className="timeline-icon" aria-hidden="true">{getStatusIcon(step)}</div>
                      </div>
                      {index < 4 && <div className="timeline-line" aria-hidden="true"></div>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Botón de Acción */}
            {serviceData.status === 'listo' && (
              <div className="tracking-action-section">
                <div className="tracking-alert">
                  <div className="tracking-alert-content">
                    <h4>¡Tu moto está lista!</h4>
                    <p>Puedes pasar a recogerla en nuestro taller</p>
                  </div>
                </div>
                <button className="tracking-contact-btn">
                  Contactar al Taller
                </button>
              </div>
            )}
          </div>
        )}

        {!serviceData && !error && !isSearching && (
          <div className="tracking-placeholder">
            <h3>¿Cómo funciona?</h3>
            <ol className="tracking-instructions">
              <li>
                <span className="instruction-number">1</span>
                <span className="instruction-text">Ingresa el código de seguimiento que recibiste</span>
              </li>
              <li>
                <span className="instruction-number">2</span>
                <span className="instruction-text">Presiona el botón "Buscar"</span>
              </li>
              <li>
                <span className="instruction-number">3</span>
                <span className="instruction-text">Ve el estado actualizado de tu servicio</span>
              </li>
            </ol>
            <div className="tracking-help">
              <p>¿No tienes tu código? Contáctanos al taller</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ServiceTracking;
