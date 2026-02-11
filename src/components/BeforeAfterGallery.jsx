import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import './BeforeAfterGallery.css';

function BeforeAfterGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const beforeAfterData = [
    {
      id: 1,
      title: "Restauración Completa",
      description: "Reparación integral de motor, suspensión y sistema eléctrico. La moto entró con daños graves y salió lista para rodar como nueva.",
      tags: ["Motor", "Suspensión", "Eléctrico"],
      beforeImage: "/before-after/before-1.jpg",
      afterImage: "/before-after/after-1.jpg"
    },
    {
      id: 2,
      title: "Personalización de Pintura",
      description: "Diseño personalizado con acabado profesional. Cada detalle fue trabajado a mano para lograr un resultado único.",
      tags: ["Pintura", "Carrocería", "Acabados"],
      beforeImage: "/before-after/before-2.jpg",
      afterImage: "/before-after/after-2.jpg"
    },
    {
      id: 3,
      title: "Reparación de Carrocería",
      description: "Restauración completa de daños por accidente. Estructura, pintura y detalles recuperados al 100%.",
      tags: ["Carrocería", "Estructura", "Pintura"],
      beforeImage: "/before-after/before-3.jpg",
      afterImage: "/before-after/after-3.jpg"
    }
  ];

  const currentData = beforeAfterData[currentIndex];

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const handleTouchMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? beforeAfterData.length - 1 : prev - 1));
    setSliderPosition(50);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === beforeAfterData.length - 1 ? 0 : prev + 1));
    setSliderPosition(50);
  };

  return (
    <section className="before-after-gallery">
      <div className="container">

        {/* Header minimalista */}
        <div className="ba-header">
          <span className="ba-eyebrow">Resultados reales</span>
          <h2 className="section-title">Transformaciones Increíbles</h2>
        </div>

        {/* Layout principal: comparador + panel */}
        <div className="ba-layout">

          {/* Comparador */}
          <div
            className="before-after-slider"
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={() => setIsDragging(true)}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => setIsDragging(false)}
          >
            <div className="image-container after-image">
              <img src={currentData.afterImage} alt={`Después - ${currentData.title}`} draggable="false" />
              <div className="image-label label-after" style={{ opacity: sliderPosition < 85 ? 1 : 0 }}>
                Después
              </div>
            </div>

            <div
              className="image-container before-image"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <img src={currentData.beforeImage} alt={`Antes - ${currentData.title}`} draggable="false" />
              <div className="image-label label-before" style={{ opacity: sliderPosition > 15 ? 1 : 0 }}>
                Antes
              </div>
            </div>

            <div className="slider-divider" style={{ left: `${sliderPosition}%` }}>
              <div className="slider-button">
                <ChevronLeft size={16} />
                <ChevronRight size={16} />
              </div>
            </div>

            {/* Hint de arrastre */}
            <div className="drag-hint">← Desliza →</div>
          </div>

          {/* Panel editorial */}
          <div className="ba-panel">
            <span className="ba-case-number">
              {String(currentIndex + 1).padStart(2, '0')} / {String(beforeAfterData.length).padStart(2, '0')}
            </span>

            <h3 className="ba-panel-title">{currentData.title}</h3>

            <div className="ba-divider"></div>

            <p className="ba-panel-description">{currentData.description}</p>

            <div className="ba-tags">
              {currentData.tags.map((tag) => (
                <span key={tag} className="ba-tag">{tag}</span>
              ))}
            </div>

            <div className="ba-nav">
              <button className="ba-nav-btn" onClick={goToPrevious} aria-label="Anterior">
                <ChevronLeft size={20} />
              </button>

              <div className="ba-dots">
                {beforeAfterData.map((_, index) => (
                  <button
                    key={index}
                    className={`dot ${index === currentIndex ? 'active' : ''}`}
                    onClick={() => { setCurrentIndex(index); setSliderPosition(50); }}
                    aria-label={`Caso ${index + 1}`}
                  />
                ))}
              </div>

              <button className="ba-nav-btn" onClick={goToNext} aria-label="Siguiente">
                <ChevronRight size={20} />
              </button>
            </div>

            <a href="#contacto" className="ba-cta">
              Solicita tu servicio
              <ArrowRight size={16} />
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}

export default BeforeAfterGallery;
