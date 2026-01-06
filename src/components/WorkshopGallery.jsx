import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './WorkshopGallery.css';

gsap.registerPlugin(ScrollTrigger);

function WorkshopGallery() {
  const galleryRef = useRef(null);

  // Imágenes del taller
  const columnImages = [
    [
      { src: '/workshop/taller-1.jpg', alt: 'Taller Raccoons 1', title: 'Área de Trabajo' },
      { src: '/workshop/taller-2.jpg', alt: 'Taller Raccoons 2', title: 'Herramientas Profesionales' },
      { src: '/workshop/taller-3.jpg', alt: 'Taller Raccoons 3', title: 'Motos en Servicio' },
      { src: '/workshop/taller-4.jpg', alt: 'Taller Raccoons 4', title: 'Equipo Especializado' },
    ],
    [
      { src: '/workshop/taller-5.jpg', alt: 'Taller Raccoons 5', title: 'Reparaciones de Calidad' },
      { src: '/workshop/taller-1.jpg', alt: 'Taller Raccoons 6', title: 'Mantenimiento Preventivo' },
      { src: '/workshop/taller-2.jpg', alt: 'Taller Raccoons 7', title: 'Diagnóstico Preciso' },
      { src: '/workshop/taller-3.jpg', alt: 'Taller Raccoons 8', title: 'Revisión Completa' },
    ],
    [
      { src: '/workshop/taller-4.jpg', alt: 'Taller Raccoons 9', title: 'Trabajos Realizados' },
      { src: '/workshop/taller-5.jpg', alt: 'Taller Raccoons 10', title: 'Nuestro Equipo' },
      { src: '/workshop/taller-1.jpg', alt: 'Taller Raccoons 11', title: 'Instalaciones Modernas' },
      { src: '/workshop/taller-2.jpg', alt: 'Taller Raccoons 12', title: 'Zona de Inspección' },
    ],
  ];

  useEffect(() => {
    if (!galleryRef.current) return;

    let ctx = null;

    const initAnimations = () => {
      ctx = gsap.context(() => {
        const gallery = galleryRef.current;

        // Columnas impares (1 y 3) - muestran el INICIO, bajan al hacer scroll
        const oddColumns = gsap.utils.toArray('.workshop-gallery__box:nth-child(odd) .workshop-gallery__list');

        oddColumns.forEach((element) => {
          // Establecer posición inicial inmediatamente
          gsap.set(element, { y: 0 });

          gsap.to(element, {
            y: 600,  // Bajan mucho para mostrar más contenido
            ease: 'none',
            scrollTrigger: {
              trigger: gallery,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.5,  // Más responsive
            }
          });
        });

        // Columna par (2) - muestra el FINAL, sube al hacer scroll
        const evenColumn = gallery.querySelector('.workshop-gallery__box:nth-child(2) .workshop-gallery__list');
        if (evenColumn) {
          // Establecer posición inicial desplazada hacia abajo
          gsap.set(evenColumn, { y: 300 });

          gsap.to(evenColumn, {
            y: -600,  // Sube mucho para mostrar el inicio
            ease: 'none',
            scrollTrigger: {
              trigger: gallery,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.5,  // Más responsive
            }
          });
        }
      }, galleryRef);

      ScrollTrigger.refresh();
    };

    // Esperar a que las imágenes se carguen
    const images = galleryRef.current.querySelectorAll('img');
    let loadedImages = 0;
    const totalImages = images.length;

    const handleImageLoad = () => {
      loadedImages++;
      if (loadedImages === totalImages) {
        // Todas las imágenes cargadas, iniciar animaciones
        setTimeout(initAnimations, 100);
      }
    };

    if (totalImages === 0) {
      initAnimations();
    } else {
      images.forEach(img => {
        if (img.complete) {
          handleImageLoad();
        } else {
          img.addEventListener('load', handleImageLoad);
        }
      });

      // Fallback: iniciar después de 1 segundo si las imágenes no cargan
      setTimeout(() => {
        if (loadedImages < totalImages) {
          initAnimations();
        }
      }, 1000);
    }

    return () => {
      images.forEach(img => {
        img.removeEventListener('load', handleImageLoad);
      });
      if (ctx) {
        ctx.revert();
      }
    };
  }, []);

  return (
    <section className="workshop-gallery-section" ref={galleryRef}>
      <div className="workshop-gallery-header">
        <h2 className="section-title">Nuestro Taller</h2>
        <p className="section-subtitle">Conoce las instalaciones donde cuidamos tu moto</p>
      </div>

      <div className="workshop-gallery">
        {columnImages.map((column, columnIndex) => (
          <div key={columnIndex} className="workshop-gallery__box">
            <div className="workshop-gallery__list">
              {column.map((image, imageIndex) => (
                <figure key={imageIndex} className="workshop-gallery__item">
                  <img
                    className="workshop-gallery__img"
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                  />
                  <figcaption className="workshop-gallery__title">{image.title}</figcaption>
                </figure>
              ))}
              {/* Duplicar imágenes para efecto infinito */}
              {column.map((image, imageIndex) => (
                <figure key={`dup-${imageIndex}`} className="workshop-gallery__item">
                  <img
                    className="workshop-gallery__img"
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                  />
                  <figcaption className="workshop-gallery__title">{image.title}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default WorkshopGallery;
