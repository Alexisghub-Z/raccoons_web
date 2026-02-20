import { useRef, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './BeforeAfterGallery.css';

function BeforeAfterGallery() {
  const containerRef = useRef(null);
  const beforeRef = useRef(null);
  const dividerRef = useRef(null);
  const labelBeforeRef = useRef(null);
  const labelAfterRef = useRef(null);
  const isDraggingRef = useRef(false);

  const beforeImage = "/before-after/antes-mantenimiento.jpeg";
  const afterImage = "/before-after/despues-mantenimiento.jpeg";
  const title = "Trabajo Profesional";
  const description = "Realizamos servicios de mantenimiento de calidad que dejan tu moto en perfectas condiciones. Cada trabajo se hace con profesionalismo y dedicación para garantizar los mejores resultados.";
  const tags = ["Calidad", "Profesional", "Confiable"];

  const updateSlider = useCallback((clientX) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const pct = (x / rect.width) * 100;

    if (beforeRef.current) beforeRef.current.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    if (dividerRef.current) dividerRef.current.style.left = `${pct}%`;
    if (labelBeforeRef.current) labelBeforeRef.current.style.opacity = pct > 15 ? '1' : '0';
    if (labelAfterRef.current) labelAfterRef.current.style.opacity = pct < 85 ? '1' : '0';
  }, []);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (isDraggingRef.current) updateSlider(e.clientX);
    };
    const onTouchMove = (e) => {
      if (isDraggingRef.current) updateSlider(e.touches[0].clientX);
    };
    const onEnd = () => { isDraggingRef.current = false; };

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onEnd);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onEnd);
    };
  }, [updateSlider]);

  const onStart = () => { isDraggingRef.current = true; };

  return (
    <section className="before-after-gallery">
      <div className="container">
        <div className="ba-layout-single">

          <div
            className="before-after-slider-vertical"
            ref={containerRef}
            onMouseDown={onStart}
            onTouchStart={onStart}
          >
            <div className="image-container after-image">
              <img src={afterImage} alt="Después - Mantenimiento" draggable="false" loading="lazy" />
              <div className="image-label label-after" ref={labelAfterRef}>
                Después
              </div>
            </div>

            <div
              className="image-container before-image"
              ref={beforeRef}
              style={{ clipPath: 'inset(0 50% 0 0)' }}
            >
              <img src={beforeImage} alt="Antes - Mantenimiento" draggable="false" loading="lazy" />
              <div className="image-label label-before" ref={labelBeforeRef}>
                Antes
              </div>
            </div>

            <div className="slider-divider" ref={dividerRef} style={{ left: '50%' }}>
              <div className="slider-button">
                <ChevronLeft size={16} />
                <ChevronRight size={16} />
              </div>
            </div>

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
