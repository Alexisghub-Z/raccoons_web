import { useEffect, useRef } from 'react';
import { Bike, Wrench } from 'lucide-react';
import './ComingSoonSection.css';

export default function ComingSoonSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('cs-animate-in');
        });
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="cs-section" ref={sectionRef} aria-label="Próximamente: Venta de Motos y Refacciones">

      {/* Panel izquierdo — Motos */}
      <div className="cs-panel cs-panel--motos">
        <img src="/clientes/cliente-featured.jpeg" alt="Venta de motos" className="cs-panel-img" loading="lazy" />
        <div className="cs-panel-overlay" />
        <div className="cs-panel-content">
          <span className="cs-label">Próximamente</span>
          <h3 className="cs-title">Venta<br />de Motos</h3>
          <div className="cs-icon-line">
            <Bike size={16} strokeWidth={1.5} />
            <span className="cs-dot-line" />
          </div>
        </div>
      </div>

      {/* Línea diagonal */}
      <svg className="cs-diagonal" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line x1="53" y1="0" x2="47" y2="100" stroke="white" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
      </svg>

      {/* Panel derecho — Refacciones */}
      <div className="cs-panel cs-panel--refacciones">
        <img src="/servicios/reparacion.jpg" alt="Venta de refacciones" className="cs-panel-img" loading="lazy" />
        <div className="cs-panel-overlay" />
        <div className="cs-panel-content">
          <span className="cs-label">Próximamente</span>
          <h3 className="cs-title">Venta de<br />Refacciones</h3>
          <div className="cs-icon-line">
            <Wrench size={16} strokeWidth={1.5} />
            <span className="cs-dot-line" />
          </div>
        </div>
      </div>

    </section>
  );
}
