import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import './MotosSoonPage.css';

const WA_URL =
  'https://wa.me/529511790349?text=' +
  encodeURIComponent('Hola, me interesa saber más sobre la venta de motos y refacciones 🏍️');

const BRANDS = [
  { name: 'Honda',   src: '/brands/honda.png' },
  { name: 'Suzuki',  src: '/brands/suzuki.png' },
  { name: 'Bajaj',   src: '/brands/bajaj.png' },
  { name: 'CF Moto', src: '/brands/cfmoto.png' },
  { name: 'BMW',     src: '/brands/bmw.png' },
  { name: 'Ducati',  src: '/brands/ducati.png' },
];

export default function MotosSoonPage() {
  const navigate = useNavigate();

  return (
    <div className="ms-page">

      {/* Imagen de fondo */}
      <div className="ms-bg">
        <img src="/clientes/cliente-featured.jpeg" alt="" className="ms-bg-img" />
        <div className="ms-bg-overlay" />
      </div>

      {/* Header */}
      <header className="ms-header">
        <button className="ms-back-btn" onClick={() => navigate(-1)} aria-label="Volver">
          <ArrowLeft size={16} strokeWidth={2} />
          <span>Volver</span>
        </button>
        <span className="ms-wordmark">RACCOONS</span>
      </header>

      {/* Contenido principal */}
      <main className="ms-main">

        {/* Columna izquierda — texto */}
        <div className="ms-content">

          <div className="ms-badge">
            <span className="ms-badge-dot" />
            En desarrollo
          </div>

          <h1 className="ms-title">
            <span className="ms-title-line ms-title-line--sm">Venta de</span>
            <span className="ms-title-line ms-title-line--lg">Motos</span>
            <span className="ms-title-line ms-title-line--accent">&amp; Refacciones</span>
          </h1>

          <p className="ms-desc">
            Pronto tendrás acceso a nuestro catálogo completo. Mientras tanto escríbenos — te asesoramos sin compromiso.
          </p>

          <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="ms-cta">
            <MessageCircle size={18} strokeWidth={2} />
            Preguntar por WhatsApp
          </a>

        </div>

        {/* Marcas — esquina inferior */}
        <div className="ms-brands">
          <p className="ms-brands-label">Marcas disponibles</p>
          <div className="ms-brands-row">
            {BRANDS.map(b => (
              <img
                key={b.name}
                src={b.src}
                alt={b.name}
                className={`ms-brand-img${b.invert ? ' ms-brand-img--invert' : ''}`}
              />
            ))}
          </div>
        </div>

      </main>

      {/* Número decorativo */}
      <div className="ms-deco-number" aria-hidden="true">2025</div>

    </div>
  );
}
