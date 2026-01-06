import { useState, useEffect, useRef } from 'react';
import { Download, Search, Inbox, Cog, CheckCircle, Bike, Package } from 'lucide-react';
import Header from '../components/Header';
import InteractiveGrid from '../components/InteractiveGrid';
import { getStatusColor, getStatusText } from '../utils/statusHelpers';
import { useCookie } from '../hooks/useCookie';
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
      const services = JSON.parse(localStorage.getItem('raccoons_services') || '[]');
      const service = services.find(s => s.code === lastTrackingCode);

      if (service) {
        setServiceData(service);
        setTrackingCode(lastTrackingCode);
      }
    }
  }, [lastTrackingCode]);

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
        // Guardar el código en la cookie para uso futuro
        setLastTrackingCode(trackingCode.toUpperCase());
      } else {
        setError('Código de seguimiento no encontrado. Verifica e intenta de nuevo.');
        setServiceData(null);
      }
      setIsSearching(false);
    }, 500);
  };

  const getStatusIcon = (status) => {
    const icons = {
      'recibido': <Inbox size={28} />,
      'en_diagnostico': <Search size={28} />,
      'en_reparacion': <Cog size={28} />,
      'listo': <CheckCircle size={28} />,
      'entregado': <Bike size={28} />
    };
    return icons[status] || <Package size={28} />;
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
                  <span className="info-value">{serviceData.clientName}</span>
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
                    {new Date(serviceData.dateCreated).toLocaleDateString('es-MX')}
                  </span>
                </div>
              </div>

              {serviceData.notes && (
                <div className="notes">
                  <h4>Notas</h4>
                  <p>{serviceData.notes}</p>
                </div>
              )}

              <div className="timeline">
                {['recibido', 'en_diagnostico', 'en_reparacion', 'listo', 'entregado'].map((step, index) => {
                  const stepIndex = ['recibido', 'en_diagnostico', 'en_reparacion', 'listo', 'entregado'].indexOf(serviceData.status);
                  const isActive = stepIndex >= index;

                  return (
                    <div key={step} className={`timeline-step ${isActive ? 'active' : ''}`}>
                      <div className="timeline-icon-wrapper">
                        {getStatusIcon(step)}
                      </div>
                      <span className="timeline-step-label">{getStatusText(step)}</span>
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
