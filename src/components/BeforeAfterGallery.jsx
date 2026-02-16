import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './BeforeAfterGallery.css';

function BeforeAfterGallery() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  // ─────────────────────────────────────────────────────────────────
  // 🔧 AGREGA TUS FOTOS AQUÍ (verticales, de mantenimiento)
  // ─────────────────────────────────────────────────────────────────
  // Sube tus fotos a la carpeta: /public/before-after/
  // Nombres sugeridos:
  //   - antes-mantenimiento.jpg  (foto vertical ANTES)
  //   - despues-mantenimiento.jpg (foto vertical DESPUÉS)
  // ─────────────────────────────────────────────────────────────────
  const beforeImage = "/before-after/antes-mantenimiento.jpeg";
  const afterImage = "/before-after/despues-mantenimiento.jpeg";
  const title = "Mantenimiento Preventivo";
  const description = "Servicio completo de mantenimiento con revisión de motor, cambio de aceite, ajuste de frenos y limpieza profunda. Tu moto queda como nueva.";
  const tags = ["Mantenimiento", "Motor", "Aceite"];

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

  return (
    <section className="before-after-gallery">
      <div className="container">
        {/* Layout: comparador izquierda + panel derecha */}
        <div className="ba-layout-single">

          {/* Comparador vertical izquierda */}
          <div
            className="before-after-slider-vertical"
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={() => setIsDragging(true)}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => setIsDragging(false)}
          >
            <div className="image-container after-image">
              <img src={afterImage} alt="Después - Mantenimiento" draggable="false" />
              <div className="image-label label-after" style={{ opacity: sliderPosition < 85 ? 1 : 0 }}>
                Después
              </div>
            </div>

            <div
              className="image-container before-image"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <img src={beforeImage} alt="Antes - Mantenimiento" draggable="false" />
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

          {/* Panel editorial derecha */}
          <div className="ba-panel-single">
            <span className="ba-eyebrow">Resultados reales</span>
            <h2 className="ba-panel-title-single">{title}</h2>

            <div className="ba-divider"></div>

            <p className="ba-panel-description">{description}</p>

            <div className="ba-tags">
              {tags.map((tag) => (
                <span key={tag} className="ba-tag">{tag}</span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default BeforeAfterGallery;
