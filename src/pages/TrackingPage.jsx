import { useState, useEffect, useRef } from 'react';
import { Download, Search, Inbox, Cog, CheckCircle, Bike, Package, Wrench, Image as ImageIcon, FileText as FilePdfIcon, ExternalLink } from 'lucide-react';
import Header from '../components/Header';
import InteractiveGrid from '../components/InteractiveGrid';
import { getStatusColor, getStatusText } from '../utils/statusHelpers';
import { useCookie } from '../hooks/useCookie';
import { serviceService } from '../api/service.service';
import './TrackingPage.css';

function TrackingPage() {
  const [lastTrackingCode, setLastTrackingCode] = useCookie('raccoons_last_tracking_code', '', 90);
  const [trackingCode, setTrackingCode] = useState(lastTrackingCode || '');
  const [serviceData, setServiceData] = useState(null);
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const heroContentRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroContentRef.current) return;

      const scrollPosition = window.scrollY;
      const heroHeight = window.innerHeight * 0.6; // 60vh
      const scrollPercentage = Math.min(scrollPosition / heroHeight, 1);

      // Parallax effect - move slower than scroll
      const parallaxY = scrollPosition * 0.4;

      // Fade out and slight scale
      const opacity = 1 - scrollPercentage * 1.3;
      const scale = 1 - scrollPercentage * 0.08;

      heroContentRef.current.style.transform = `translateY(${parallaxY}px) scale(${scale})`;
      heroContentRef.current.style.opacity = opacity;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cargar automáticamente el servicio si hay un código guardado en la cookie
  useEffect(() => {
    if (lastTrackingCode && !serviceData) {
      loadServiceByCode(lastTrackingCode);
    }
  }, [lastTrackingCode]);

  const loadServiceByCode = async (code) => {
    try {
      setIsSearching(true);
      setError('');
      const service = await serviceService.getByCode(code);
      setServiceData(service);
      setTrackingCode(code);
    } catch (err) {
      console.error('Error loading service:', err);

      if (err.message.includes('not found') || err.message.includes('no encontrado')) {
        setError('Código de seguimiento no encontrado');
      } else if (err.message.includes('network') || err.message.includes('Failed to fetch')) {
        setError('Error de conexión. Verifica tu conexión a internet.');
      } else {
        setError('No se pudo cargar el servicio. Por favor intenta nuevamente.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setIsSearching(true);

    if (!trackingCode.trim()) {
      setError('Por favor ingresa un código de seguimiento');
      setIsSearching(false);
      return;
    }

    try {
      const service = await serviceService.getByCode(trackingCode.toUpperCase());
      setServiceData(service);
      setLastTrackingCode(trackingCode.toUpperCase());
    } catch (err) {
      console.error('Error searching service:', err);

      // Manejar diferentes tipos de error
      if (err.message.includes('not found') || err.message.includes('no encontrado')) {
        setError('Código de seguimiento no encontrado. Verifica el código e intenta de nuevo.');
      } else if (err.message.includes('network') || err.message.includes('Failed to fetch')) {
        setError('Error de conexión. Verifica tu conexión a internet e intenta nuevamente.');
      } else if (err.message.includes('formato')) {
        setError('El formato del código de seguimiento es inválido. Usa el formato RCN-XXXXXXXXX');
      } else {
        setError(err.message || 'Error al buscar el servicio. Por favor intenta nuevamente.');
      }
      setServiceData(null);
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      'RECEIVED': <Inbox size={28} />,
      'IN_DIAGNOSIS': <Search size={28} />,
      'IN_REPAIR': <Cog size={28} />,
      'READY_FOR_PICKUP': <CheckCircle size={28} />,
      'DELIVERED': <Bike size={28} />,
      'CANCELLED': <Package size={28} />
    };
    return icons[status] || <Package size={28} />;
  };

  const getStatusDescription = (status) => {
    const descriptions = {
      'RECEIVED': 'Tu motocicleta ha sido recibida en nuestro taller',
      'IN_DIAGNOSIS': 'Nuestros mecánicos están evaluando tu moto',
      'IN_REPAIR': 'Estamos trabajando en tu motocicleta',
      'READY_FOR_PICKUP': 'Tu moto está lista para ser recogida',
      'DELIVERED': 'Servicio completado y entregado',
      'CANCELLED': 'Servicio cancelado'
    };
    return descriptions[status] || 'Estado actualizado';
  };

  const getProgressPercentage = (status) => {
    const percentages = {
      'RECEIVED': 20,
      'IN_DIAGNOSIS': 40,
      'IN_REPAIR': 60,
      'READY_FOR_PICKUP': 80,
      'DELIVERED': 100,
      'CANCELLED': 0
    };
    return percentages[status] || 0;
  };

  const getDaysElapsed = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diff = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  const handleDownloadPDF = () => {
    if (serviceData && serviceData.pdfFile && !isDownloading) {
      setIsDownloading(true);

      // Simular delay de descarga para mostrar animación
      setTimeout(() => {
        // Convertir base64 a blob y descargar
        const base64Data = serviceData.pdfFile.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        // Crear link y descargar
        const link = document.createElement('a');
        link.href = url;
        link.download = serviceData.pdfFileName || `Servicio_${serviceData.code}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Mostrar estado de completado
        setIsDownloading(false);
        setDownloadComplete(true);

        // Resetear después de 3 segundos
        setTimeout(() => {
          setDownloadComplete(false);
        }, 3000);
      }, 800);
    }
  };

  return (
    <div className="tracking-page">
      <Header />

      {/* Hero Section */}
      <section className="tracking-hero">
        <InteractiveGrid />
        <div className="container">
          <div className="tracking-hero-content" ref={heroContentRef}>
            <h1 className="section-title">Seguimiento de Servicio</h1>
            <p className="tracking-hero-subtitle">Consulta el estado de tu motocicleta en tiempo real</p>

            <form onSubmit={handleSearch} className="tracking-search-form">
              <div className="tracking-search-wrapper">
                <Search className="search-icon" size={24} />
                <input
                  type="text"
                  placeholder="Ingresa tu código de seguimiento (Ej: RCN-ABC123XYZ)"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                  className="tracking-search-input"
                  disabled={isSearching}
                  autoComplete="off"
                />
              </div>
              <button type="submit" className="tracking-search-btn" disabled={isSearching}>
                {isSearching ? 'Buscando...' : 'Buscar'}
              </button>
            </form>
            {error && <div className="tracking-error">{error}</div>}
          </div>
        </div>
      </section>

      {/* Results Section */}
      {serviceData && (
        <section className="tracking-results">
          <div className="container">
            <div className="tracking-result-card">
              <div className="status-header">
                <div className="status-indicator" style={{ backgroundColor: getStatusColor(serviceData.status) }}></div>
                <div>
                  <h2 className="status-title">{getStatusText(serviceData.status)}</h2>
                  <p className="status-code">{serviceData.code}</p>
                </div>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${getProgressPercentage(serviceData.status)}%`,
                    backgroundColor: getStatusColor(serviceData.status)
                  }}
                ></div>
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Cliente</span>
                  <span className="info-value">{serviceData.customer?.firstName} {serviceData.customer?.lastName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Moto</span>
                  <span className="info-value">{serviceData.motorcycle}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Servicio</span>
                  <span className="info-value">{serviceData.serviceType}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Ingreso</span>
                  <span className="info-value">
                    {new Date(serviceData.createdAt).toLocaleDateString('es-MX')}
                  </span>
                </div>
              </div>

              {serviceData.notes && (
                <div className="notes">
                  <h4>Notas del Servicio</h4>
                  <p>{serviceData.notes}</p>
                </div>
              )}

              <div className="timeline">
                {['RECEIVED', 'IN_DIAGNOSIS', 'IN_REPAIR', 'READY_FOR_PICKUP', 'DELIVERED'].map((step, index) => {
                  const statusOrder = ['RECEIVED', 'IN_DIAGNOSIS', 'IN_REPAIR', 'READY_FOR_PICKUP', 'DELIVERED'];
                  const currentIndex = statusOrder.indexOf(serviceData.status);
                  const isActive = currentIndex >= index;
                  const isCurrentStep = step === serviceData.status; // Verificar si es el estado actual

                  // Buscar la nota correspondiente a este estado en el historial
                  const historyEntry = serviceData.statusHistory?.find(h => h.status === step);

                  return (
                    <div key={step} className={`timeline-step ${isActive ? 'active' : ''}`}>
                      <div className="timeline-icon-wrapper">
                        {getStatusIcon(step)}
                      </div>
                      <div className="timeline-step-content">
                        <span className="timeline-step-label">{getStatusText(step)}</span>

                        {/* Mostrar notas del historial si existen */}
                        {isActive && historyEntry && historyEntry.notes && (
                          <div className="timeline-step-notes">
                            <p>{historyEntry.notes}</p>
                            <span className="timeline-step-date">
                              {new Date(historyEntry.changedAt).toLocaleDateString('es-MX', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>

                            {/* Evidencias: SOLO mostrar en READY_FOR_PICKUP cuando hay notas */}
                            {step === 'READY_FOR_PICKUP' &&
                             serviceData.evidence && serviceData.evidence.length > 0 && (
                              <div className="tracking-evidences">
                                <h4 className="evidences-title">
                                  <ImageIcon size={16} />
                                  Evidencias ({serviceData.evidence.length})
                                </h4>
                                <p className="evidences-subtitle">
                                  Fotos y documentos del trabajo realizado
                                </p>
                                <div className="evidences-grid">
                                  {serviceData.evidence.map((evidence, idx) => (
                                    <div key={evidence.id || idx} className="evidence-card">
                                      {evidence.type === 'IMAGE' ? (
                                        <div className="evidence-image-container">
                                          <img
                                            src={`${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'}${evidence.url}`}
                                            alt={evidence.description || `Evidencia ${idx + 1}`}
                                            className="evidence-image"
                                            loading="lazy"
                                          />
                                          <a
                                            href={`${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'}${evidence.url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="evidence-overlay"
                                          >
                                            <ExternalLink size={18} />
                                            <span>Ver completa</span>
                                          </a>
                                        </div>
                                      ) : (
                                        <a
                                          href={`${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'}${evidence.url}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="evidence-pdf-link"
                                        >
                                          <FilePdfIcon size={28} />
                                          <span className="pdf-label">PDF</span>
                                          <span className="pdf-action">Abrir</span>
                                        </a>
                                      )}
                                      {evidence.description && (
                                        <p className="evidence-description">{evidence.description}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {serviceData.pdfFile && (
                <div className="tracking-actions">
                  <button
                    className={`tracking-download-btn-animated ${isDownloading ? 'downloading' : ''} ${downloadComplete ? 'complete' : ''}`}
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                  >
                    <span className="btn-icon">
                      {downloadComplete ? (
                        <svg className="checkmark" viewBox="0 0 52 52">
                          <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                          <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                        </svg>
                      ) : (
                        <Download size={20} />
                      )}
                    </span>
                    <span className="btn-text">
                      {downloadComplete ? 'Descargado' : isDownloading ? 'Descargando...' : 'Descargar Reporte PDF'}
                    </span>
                    {isDownloading && <span className="btn-loader"></span>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default TrackingPage;
