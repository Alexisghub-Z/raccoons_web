import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Download, Search, Inbox, Cog, CheckCircle, Bike, Package, Wrench, Image as ImageIcon, FileText as FilePdfIcon, ExternalLink, Check, User, Calendar, Settings, Facebook, Instagram, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import Header from '../components/Header';
import InteractiveGrid from '../components/InteractiveGrid';
import { getStatusColor, getStatusText } from '../utils/statusHelpers';
import { useCookie } from '../hooks/useCookie';
import { serviceService } from '../api/service.service';
import { AuthorizationQuestionsForStep } from '../components/tracking/AuthorizationQuestions';
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
  const [showDeliveredModal, setShowDeliveredModal] = useState(false);
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

  useEffect(() => {
    if (serviceData?.status === 'READY_FOR_PICKUP') {
      const t = setTimeout(() => {
        setShowDeliveredModal(true);
        const colors = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4'];
        const baseOpts = { colors, gravity: 0.6, scalar: 1.2, drift: 0.1, ticks: 600 };

        // Salva inicial — esquinas + centro
        confetti({ ...baseOpts, particleCount: 220, spread: 70, angle: 60,  origin: { x: 0,   y: 1 }, startVelocity: 70 });
        confetti({ ...baseOpts, particleCount: 220, spread: 70, angle: 120, origin: { x: 1,   y: 1 }, startVelocity: 70 });
        setTimeout(() => {
          confetti({ ...baseOpts, particleCount: 180, spread: 110, angle: 90, origin: { x: 0.5, y: 1 }, startVelocity: 60 });
        }, 200);

        // Segunda salva a 1.2s
        setTimeout(() => {
          confetti({ ...baseOpts, particleCount: 160, spread: 65, angle: 65,  origin: { x: 0.1, y: 1 }, startVelocity: 65 });
          confetti({ ...baseOpts, particleCount: 160, spread: 65, angle: 115, origin: { x: 0.9, y: 1 }, startVelocity: 65 });
        }, 1200);

        // Tercera salva a 2.4s — lluvia suave de cierre
        setTimeout(() => {
          confetti({ ...baseOpts, particleCount: 120, spread: 130, angle: 90, origin: { x: 0.3, y: 1 }, startVelocity: 50, gravity: 0.5 });
          confetti({ ...baseOpts, particleCount: 120, spread: 130, angle: 90, origin: { x: 0.7, y: 1 }, startVelocity: 50, gravity: 0.5 });
        }, 2400);
      }, 800);
      return () => clearTimeout(t);
    }
  }, [serviceData?.status]);

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
                        {isActive && serviceData.authorizationQuestions?.length > 0 && (
                          <AuthorizationQuestionsForStep
                            questions={serviceData.authorizationQuestions}
                            stepStatus={step.value}
                            statusHistory={serviceData.statusHistory}
                            serviceCode={serviceData.code}
                            onResponded={(questionId, response, customerMessage) => {
                              setServiceData(prev => ({
                                ...prev,
                                authorizationQuestions: prev.authorizationQuestions.map(q =>
                                  q.id === questionId
                                    ? { ...q, response, customerMessage: customerMessage || null, respondedAt: new Date().toISOString() }
                                    : q
                                )
                              }));
                            }}
                          />
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

              {/* ── READY_FOR_PICKUP / DELIVERED CTA ── */}
              {(serviceData.status === 'READY_FOR_PICKUP' || serviceData.status === 'DELIVERED') && (
                <div className="delivered-cta">
                  <div className="delivered-cta-header">
                    <span className="delivered-cta-icon">🏍️</span>
                    <div>
                      <h3 className="delivered-cta-title">¡Tu moto te espera!</h3>
                      <p className="delivered-cta-subtitle">Si quedaste contento, una reseña nos ayuda a seguir creciendo</p>
                    </div>
                  </div>

                  <div className="review-buttons">
                    <a
                      href="https://maps.app.goo.gl/AsX5mxTu235HR8Bv6"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="review-btn google"
                    >
                      <svg className="review-btn-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Reseña en Google
                    </a>
                    <a
                      href="https://www.facebook.com/profile.php?id=100092034219719"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="review-btn facebook"
                    >
                      <Facebook size={18} className="review-btn-icon" />
                      Reseña en Facebook
                    </a>
                  </div>

                  <hr className="cta-divider" />

                  <p className="social-follow-label">Síguenos en redes</p>
                  <div className="social-buttons">
                    <a
                      href="https://www.instagram.com/raccoons_oax/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-btn instagram"
                    >
                      <Instagram size={16} />
                      Instagram
                    </a>
                    <a
                      href="https://www.tiktok.com/@raccoons.oax"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-btn tiktok"
                    >
                      <svg className="social-btn-svg" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.35 6.35 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
                      </svg>
                      TikTok
                    </a>
                    <a
                      href="https://www.youtube.com/@RaccoonsOax/videos"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-btn youtube"
                    >
                      <svg className="social-btn-svg" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      YouTube
                    </a>
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>
      )}

      {/* ── DELIVERED Modal ── */}
      {showDeliveredModal && createPortal(
        <div className="delivered-modal-overlay" onClick={() => setShowDeliveredModal(false)}>
          <div className="delivered-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="delivered-modal-close" onClick={() => setShowDeliveredModal(false)} aria-label="Cerrar">
              <X size={20} />
            </button>

            <div className="delivered-modal-hero">
              <div className="delivered-modal-check-icon">
                <svg viewBox="0 0 52 52" width="32" height="32">
                  <path fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" d="M14 27l8 8 16-17" />
                </svg>
              </div>
              <h2 className="delivered-modal-title">¡Tu moto está lista para recoger! 🏍️</h2>
              <p className="delivered-modal-subtitle">Puedes pasar a recogerla cuando gustes</p>
            </div>

            <div className="delivered-modal-thank-you">
              <p>Fue un gusto trabajar en tu moto. Nos esforzamos en cada detalle para que salgas con la confianza de que tu moto está en su mejor estado.</p>
              <p className="thank-you-sign">¡Buen rodaje! 🤙 — El equipo Raccoons</p>
            </div>

            <div className="delivered-modal-divider" />

            <div className="delivered-modal-section">
              <p className="delivered-modal-section-label">⭐ Déjanos tu reseña</p>
              <div className="review-btn-row">
                <a
                  href="https://maps.app.goo.gl/AsX5mxTu235HR8Bv6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="review-btn google"
                >
                  <svg className="review-btn-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=100092034219719"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="review-btn facebook"
                >
                  <Facebook size={18} className="review-btn-icon" />
                  Facebook
                </a>
              </div>
            </div>

            <div className="delivered-modal-divider" />

            <div className="delivered-modal-section">
              <p className="delivered-modal-section-label">Síguenos</p>
              <div className="social-btn-row">
                <a
                  href="https://www.instagram.com/raccoons_oax/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn instagram"
                >
                  <Instagram size={16} />
                  Instagram
                </a>
                <a
                  href="https://www.tiktok.com/@raccoons.oax"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn tiktok"
                >
                  <svg className="social-btn-svg" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.35 6.35 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
                  </svg>
                  TikTok
                </a>
                <a
                  href="https://www.youtube.com/@RaccoonsOax/videos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn youtube"
                >
                  <svg className="social-btn-svg" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  YouTube
                </a>
              </div>
            </div>

            <button className="delivered-modal-dismiss" onClick={() => setShowDeliveredModal(false)}>
              Cerrar
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default TrackingPage;
