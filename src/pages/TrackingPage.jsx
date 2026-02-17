import { useState, useEffect, useRef } from 'react';
import { Download, Search, Inbox, Cog, CheckCircle, Bike, Package, Wrench, Image as ImageIcon, FileText as FilePdfIcon, ExternalLink, Check, User, Calendar, Settings } from 'lucide-react';
import Header from '../components/Header';
import InteractiveGrid from '../components/InteractiveGrid';
import { getStatusColor, getStatusText } from '../utils/statusHelpers';
import { useCookie } from '../hooks/useCookie';
import { serviceService } from '../api/service.service';
import './TrackingPage.css';

const STATUS_STEPS = [
  { value: 'RECEIVED',         label: 'Recibido',    icon: <Inbox size={14} /> },
  { value: 'IN_DIAGNOSIS',     label: 'Diagnóstico', icon: <Search size={14} /> },
  { value: 'IN_REPAIR',        label: 'Reparación',  icon: <Wrench size={14} /> },
  { value: 'READY_FOR_PICKUP', label: 'Listo',       icon: <CheckCircle size={14} /> },
  { value: 'DELIVERED',        label: 'Entregado',   icon: <Bike size={14} /> },
];

const STATUS_META = {
  RECEIVED:         { color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
  IN_DIAGNOSIS:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  IN_REPAIR:        { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  READY_FOR_PICKUP: { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  DELIVERED:        { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  CANCELLED:        { color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
};

function TrackingPage() {
  const [lastTrackingCode, setLastTrackingCode] = useCookie('raccoons_last_tracking_code', '', 90);
  const [trackingCode, setTrackingCode] = useState(lastTrackingCode || '');
  const [serviceData, setServiceData] = useState(null);
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const heroContentRef = useRef(null);

  useEffect(() => {
    document.title = 'Seguimiento de Servicio | Raccoons Taller de Motocicletas';
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroContentRef.current) return;
      const scrollPosition = window.scrollY;
      const heroHeight = window.innerHeight * 0.6;
      const scrollPercentage = Math.min(scrollPosition / heroHeight, 1);
      const parallaxY = scrollPosition * 0.4;
      const opacity = 1 - scrollPercentage * 1.3;
      const scale = 1 - scrollPercentage * 0.08;
      heroContentRef.current.style.transform = `translateY(${parallaxY}px) scale(${scale})`;
      heroContentRef.current.style.opacity = opacity;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      RECEIVED:         <Inbox size={28} />,
      IN_DIAGNOSIS:     <Search size={28} />,
      IN_REPAIR:        <Cog size={28} />,
      READY_FOR_PICKUP: <CheckCircle size={28} />,
      DELIVERED:        <Bike size={28} />,
      CANCELLED:        <Package size={28} />,
    };
    return icons[status] || <Package size={28} />;
  };

  const getStatusDescription = (status) => {
    const descriptions = {
      RECEIVED:         'Tu motocicleta ha sido recibida en nuestro taller',
      IN_DIAGNOSIS:     'Nuestros mecánicos están evaluando tu moto',
      IN_REPAIR:        'Estamos trabajando en tu motocicleta',
      READY_FOR_PICKUP: 'Tu moto está lista, puedes pasar a recogerla',
      DELIVERED:        'Servicio completado y entregado con éxito',
      CANCELLED:        'Este servicio fue cancelado',
    };
    return descriptions[status] || 'Estado actualizado';
  };

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  const handleDownloadPDF = () => {
    if (serviceData && serviceData.pdfFile && !isDownloading) {
      setIsDownloading(true);
      setTimeout(() => {
        const base64Data = serviceData.pdfFile.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = serviceData.pdfFileName || `Servicio_${serviceData.code}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setIsDownloading(false);
        setDownloadComplete(true);
        setTimeout(() => setDownloadComplete(false), 3000);
      }, 800);
    }
  };

  const meta = serviceData ? (STATUS_META[serviceData.status] || STATUS_META.CANCELLED) : null;
  const statusOrder = STATUS_STEPS.map(s => s.value);
  const currentStepIndex = serviceData ? statusOrder.indexOf(serviceData.status) : -1;

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
                  placeholder="Ingresa tu código (Ej: RCN-ABC123XYZ)"
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
      {serviceData && meta && (
        <section className="tracking-results">
          <div className="container">
            <div className="tracking-result-card">

              {/* ── Status Banner ── */}
              <div
                className="status-banner"
                style={{ '--sc': meta.color, '--sc-bg': meta.bg }}
              >
                <div className="status-banner-icon">
                  {getStatusIcon(serviceData.status)}
                </div>
                <div className="status-banner-body">
                  <p className="status-banner-eyebrow">Estado actual</p>
                  <h2 className="status-banner-title">{getStatusText(serviceData.status)}</h2>
                  <p className="status-banner-desc">{getStatusDescription(serviceData.status)}</p>
                </div>
                <code className="status-banner-code">{serviceData.code}</code>
              </div>

              {/* ── Horizontal Stepper ── */}
              {serviceData.status !== 'CANCELLED' && (
                <div className="tracking-stepper">
                  {STATUS_STEPS.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent   = index === currentStepIndex;
                    const isFuture    = index > currentStepIndex;
                    return (
                      <div key={step.value} className="ts-item">
                        {index > 0 && (
                          <div className={`ts-line ${isCompleted || isCurrent ? 'done' : ''}`} />
                        )}
                        <div className={`ts-dot ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isFuture ? 'future' : ''}`}
                          style={isCurrent ? { '--sc': meta.color } : {}}
                        >
                          {isCompleted ? <Check size={13} /> : step.icon}
                        </div>
                        <span className={`ts-label ${isCurrent ? 'current' : ''} ${isFuture ? 'future' : ''}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Info Cards ── */}
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-icon"><User size={16} /></span>
                  <span className="info-label">Cliente</span>
                  <span className="info-value">
                    {serviceData.customer?.firstName} {serviceData.customer?.lastName}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-icon"><Bike size={16} /></span>
                  <span className="info-label">Motocicleta</span>
                  <span className="info-value">{serviceData.motorcycle}</span>
                </div>
                <div className="info-item">
                  <span className="info-icon"><Wrench size={16} /></span>
                  <span className="info-label">Tipo de servicio</span>
                  <span className="info-value">{serviceData.serviceType}</span>
                </div>
                <div className="info-item">
                  <span className="info-icon"><Calendar size={16} /></span>
                  <span className="info-label">Fecha de ingreso</span>
                  <span className="info-value">
                    {new Date(serviceData.createdAt).toLocaleDateString('es-MX', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* ── Service Notes ── */}
              {serviceData.notes && (
                <div className="service-notes-box">
                  <span className="snb-label">Nota del servicio</span>
                  <p className="snb-text">{serviceData.notes}</p>
                </div>
              )}

              {/* ── Timeline ── */}
              <div className="timeline">
                <h3 className="timeline-heading">Historial del servicio</h3>
                {STATUS_STEPS.map((step, index) => {
                  const isActive    = currentStepIndex >= index;
                  const isCurrent   = step.value === serviceData.status;
                  const historyEntry = serviceData.statusHistory?.find(h => h.status === step.value);

                  return (
                    <div
                      key={step.value}
                      className={`timeline-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
                      style={isCurrent ? { '--sc': meta.color } : {}}
                    >
                      <div className="tl-connector">
                        <div className="tl-dot">
                          {isActive
                            ? <Check size={12} />
                            : <span style={{ fontSize: '0.75rem' }}>{index + 1}</span>
                          }
                        </div>
                        {index < STATUS_STEPS.length - 1 && (
                          <div className={`tl-line ${isActive ? 'done' : ''}`} />
                        )}
                      </div>
                      <div className="tl-content">
                        <div className="tl-header">
                          <span className="tl-step-label">{getStatusText(step.value)}</span>
                          {isCurrent && (
                            <span className="tl-current-badge" style={{ '--sc': meta.color }}>
                              En curso
                            </span>
                          )}
                          {isActive && historyEntry && (
                            <span className="tl-date">
                              {new Date(historyEntry.changedAt).toLocaleDateString('es-MX', {
                                day: '2-digit', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          )}
                        </div>
                        {isActive && historyEntry?.notes && (
                          <p className="tl-notes">{historyEntry.notes}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Evidences ── */}
              {serviceData.evidence && serviceData.evidence.length > 0 && (
                <div className="tracking-evidences">
                  <h3 className="evidences-heading">
                    <ImageIcon size={18} />
                    Evidencias del trabajo ({serviceData.evidence.length})
                  </h3>
                  <p className="evidences-subtitle">Fotos y documentos del trabajo realizado</p>
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

              {/* ── PDF Download ── */}
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
                          <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                          <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
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
