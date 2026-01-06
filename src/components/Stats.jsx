import { useState, useEffect, useRef } from 'react';
import { Wrench, Users, Award, Clock } from 'lucide-react';
import './Stats.css';

function Stats() {
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef(null);

  // Hook para animar el contador de números
  const useCountUp = (end, duration = 2000, isVisible) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!isVisible) return;

      let startTime;
      let animationFrame;

      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);

        // Easing function para suavizar la animación
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(easeOutQuart * end));

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);

      return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, isVisible]);

    return count;
  };

  // Intersection Observer para detectar cuando la sección es visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);

  // Valores de las estadísticas
  const motosReparadas = useCountUp(1200, 2500, isVisible);
  const anosExperiencia = useCountUp(10, 2000, isVisible);
  const clientesSatisfechos = useCountUp(98, 2000, isVisible);
  const tiempoPromedio = useCountUp(24, 2000, isVisible);

  return (
    <section ref={statsRef} className="stats-section">
      {/* Gráfica animada de fondo - colorida pero elegante */}
      <div className="stats-background">
        <svg className="stats-graph" viewBox="0 0 1200 400" preserveAspectRatio="none">
          {/* Grid de fondo */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Líneas de gráfica coloridas - estilo dashboard */}
          <path
            className="graph-line graph-line-1"
            d="M0,250 Q200,180 400,200 Q600,220 800,160 Q1000,140 1200,180"
            fill="none"
            stroke="url(#lineGradient1)"
            strokeWidth="2.5"
          />
          <path
            className="graph-line graph-line-2"
            d="M0,280 Q200,240 400,260 Q600,280 800,220 Q1000,200 1200,240"
            fill="none"
            stroke="url(#lineGradient2)"
            strokeWidth="2.5"
          />
          <path
            className="graph-line graph-line-3"
            d="M0,310 Q200,280 400,300 Q600,320 800,270 Q1000,250 1200,290"
            fill="none"
            stroke="url(#lineGradient3)"
            strokeWidth="2"
          />

          {/* Áreas de relleno con gradientes */}
          <path
            d="M0,250 Q200,180 400,200 Q600,220 800,160 Q1000,140 1200,180 L1200,400 L0,400 Z"
            fill="url(#areaGradient1)"
            opacity="0.4"
          />
          <path
            d="M0,280 Q200,240 400,260 Q600,280 800,220 Q1000,200 1200,240 L1200,400 L0,400 Z"
            fill="url(#areaGradient2)"
            opacity="0.3"
          />

          {/* Gradientes para las líneas */}
          <defs>
            <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="lineGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#6d28d9" />
            </linearGradient>

            {/* Gradientes para áreas de relleno */}
            <linearGradient id="areaGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.15)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
            </linearGradient>
            <linearGradient id="areaGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.1)" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Contenido de estadísticas */}
      <div className="container">
        <div className="stats-header">
          <h2 className="stats-title">Números que Hablan por Nosotros</h2>
          <p className="stats-subtitle">
            Más de una década de excelencia en el servicio de motocicletas
          </p>
        </div>

        <div className="stats-grid">
          {/* Estadística 1: Motos Reparadas */}
          <div className="stat-card" style={{ animationDelay: '0.1s' }}>
            <div className="stat-icon-wrapper">
              <Wrench className="stat-icon" size={48} />
            </div>
            <div className="stat-number">
              {motosReparadas.toLocaleString()}+
            </div>
            <div className="stat-label">Motos Reparadas</div>
            <div className="stat-description">
              Servicios completados con éxito
            </div>
          </div>

          {/* Estadística 2: Años de Experiencia */}
          <div className="stat-card" style={{ animationDelay: '0.2s' }}>
            <div className="stat-icon-wrapper">
              <Award className="stat-icon" size={48} />
            </div>
            <div className="stat-number">
              {anosExperiencia}+
            </div>
            <div className="stat-label">Años de Experiencia</div>
            <div className="stat-description">
              Trayectoria en el sector
            </div>
          </div>

          {/* Estadística 3: Clientes Satisfechos */}
          <div className="stat-card" style={{ animationDelay: '0.3s' }}>
            <div className="stat-icon-wrapper">
              <Users className="stat-icon" size={48} />
            </div>
            <div className="stat-number">
              {clientesSatisfechos}%
            </div>
            <div className="stat-label">Clientes Satisfechos</div>
            <div className="stat-description">
              Índice de satisfacción
            </div>
          </div>

          {/* Estadística 4: Tiempo Promedio */}
          <div className="stat-card" style={{ animationDelay: '0.4s' }}>
            <div className="stat-icon-wrapper">
              <Clock className="stat-icon" size={48} />
            </div>
            <div className="stat-number">
              {tiempoPromedio}h
            </div>
            <div className="stat-label">Tiempo Promedio</div>
            <div className="stat-description">
              Entrega de servicios básicos
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Stats;
