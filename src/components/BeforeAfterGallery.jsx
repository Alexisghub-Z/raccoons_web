import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './BeforeAfterGallery.css';

function BeforeAfterGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  // Datos de antes y después - El usuario puede agregar más casos aquí
  const beforeAfterData = [
    {
      id: 1,
      title: "Restauración Completa",
      description: "Reparación integral de motor, suspensión y sistema eléctrico",
      beforeImage: "/before-after/before-1.jpg",
      afterImage: "/before-after/after-1.jpg"
    },
    {
      id: 2,
      title: "Personalización de Pintura",
      description: "Diseño personalizado con acabado profesional",
      beforeImage: "/before-after/before-2.jpg",
      afterImage: "/before-after/after-2.jpg"
    },
    {
      id: 3,
      title: "Reparación de Carrocería",
      description: "Restauración de daños por accidente",
      beforeImage: "/before-after/before-3.jpg",
      afterImage: "/before-after/after-3.jpg"
    }
  ];

  const currentData = beforeAfterData[currentIndex];

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
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
        <h2 className="section-title">Transformaciones Increíbles</h2>
        <p className="section-subtitle">
          Mira el antes y después de nuestros trabajos. Desliza para comparar.
        </p>

        <div className="before-after-container">
          {/* Información del trabajo */}
          <div className="before-after-info">
            <h3 className="work-title">{currentData.title}</h3>
            <p className="work-description">{currentData.description}</p>
          </div>

          {/* Comparador de imágenes */}
          <div
            className="before-after-slider"
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={() => setIsDragging(true)}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => setIsDragging(false)}
          >
            {/* Imagen "Después" (fondo) */}
            <div className="image-container after-image">
              <img
                src={currentData.afterImage}
                alt={`Después - ${currentData.title}`}
                draggable="false"
              />
              <div
                className="image-label label-after"
                style={{
                  opacity: sliderPosition < 85 ? 1 : 0,
                  transition: 'opacity 0.2s ease'
                }}
              >
                Después
              </div>
            </div>

            {/* Imagen "Antes" (overlay con clip) */}
            <div
              className="image-container before-image"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <img
                src={currentData.beforeImage}
                alt={`Antes - ${currentData.title}`}
                draggable="false"
              />
              <div
                className="image-label label-before"
                style={{
                  opacity: sliderPosition > 15 ? 1 : 0,
                  transition: 'opacity 0.2s ease'
                }}
              >
                Antes
              </div>
            </div>

            {/* Línea divisoria deslizante */}
            <div
              className="slider-divider"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="slider-button">
                <ChevronLeft size={16} />
                <ChevronRight size={16} />
              </div>
            </div>
          </div>

          {/* Controles de navegación */}
          <div className="before-after-controls">
            <button className="control-btn" onClick={goToPrevious}>
              <ChevronLeft size={24} />
              Anterior
            </button>

            <div className="pagination-dots">
              {beforeAfterData.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentIndex(index);
                    setSliderPosition(50);
                  }}
                  aria-label={`Ir a imagen ${index + 1}`}
                />
              ))}
            </div>

            <button className="control-btn" onClick={goToNext}>
              Siguiente
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BeforeAfterGallery;
