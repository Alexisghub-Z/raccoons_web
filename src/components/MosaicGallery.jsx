import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './MosaicGallery.css';

gsap.registerPlugin(ScrollTrigger);

function MosaicGallery() {
  const galleryRef = useRef(null);

  // ─────────────────────────────────────────────────────────
  // AGREGA TUS FOTOS AQUÍ
  // Coloca los archivos en la carpeta: /public/clientes/
  // Nombra los archivos: cliente-1.jpg, cliente-2.jpg, etc.
  // La galería usa 14 imágenes en total (índices 0 al 13).
  // ─────────────────────────────────────────────────────────
  const galleryImages = [
    '/clientes/cliente-featured.jpeg',
    '/clientes/cliente-2.jpeg',
    '/clientes/cliente-3.jpeg',
    '/clientes/cliente-4.jpeg',
    '/clientes/cliente-5.jpeg',
    '/clientes/cliente-1.jpeg',
    '/clientes/cliente-6.jpeg',
    '/clientes/cliente-7.jpeg',
    '/clientes/cliente-8.jpeg',
    '/clientes/cliente-9.jpeg',
    '/clientes/cliente-10.jpeg',
    '/clientes/cliente-11.jpeg',
    '/clientes/cliente-12.jpeg',
    '/clientes/cliente-13.jpeg',
    '/clientes/cliente-14.jpeg',
    '/clientes/cliente-15.jpeg',
  ];

  useEffect(() => {
    if (!galleryRef.current) return;

    const getGridTargetSize = () => {
      const el = document.getElementById("grid-target");
      const svg = document.querySelector(".gallery-grid__svg");
      if (!svg || !el) return { width: 400, height: 500 };

      const svgRect = svg.getBoundingClientRect();
      const viewBoxWidth = 2800;
      const scale = svgRect.width / viewBoxWidth;

      return {
        width: 400 * scale,
        height: 500 * scale
      };
    };

    const updateFeaturedAnimation = () => {
      const { width, height } = getGridTargetSize();

      // Responsive border radius
      const borderRadius = window.innerWidth <= 480 ? 28 : window.innerWidth <= 768 ? 36 : 56;

      const pinConfig = {
        trigger: ".gallery-grid__featured",
        start: "center center",
        endTrigger: ".gallery-grid",
        end: "bottom-=150 bottom",
        scrub: 1,
        anticipatePin: 1
      };

      // Animación de la imagen principal
      gsap
        .timeline({
          scrollTrigger: {
            ...pinConfig,
            pin: ".gallery-grid__featured"
          }
        })
        .to(".gallery-grid__featured-inner", {
          width,
          height,
          borderRadius,
          ease: "power2.inOut"
        });

      // Animación del grid
      gsap
        .timeline({
          scrollTrigger: {
            ...pinConfig,
            pin: ".gallery-grid__images"
          }
        })
        .to(".gallery-grid__group", {
          transform: "scale(1)",
          transformOrigin: "1400px 950px",
          ease: "power2.inOut"
        })
        .to(
          ".gallery-grid__svg",
          {
            opacity: 1,
            ease: "power2.inOut"
          },
          "<"
        );
    };

    const initTimer = setTimeout(() => {
      updateFeaturedAnimation();
    }, 100);

    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        ScrollTrigger.getAll().forEach(st => st.kill());

        gsap.set(".gallery-grid__featured", { clearProps: "all" });
        gsap.set(".gallery-grid__featured-inner", { clearProps: "all" });

        const featured = document.querySelector(".gallery-grid__featured");
        if (featured) {
          // Responsive width based on screen size
          const width = window.innerWidth;
          if (width <= 480) {
            featured.style.width = "90vw";
            featured.style.maxWidth = "90vw";
          } else if (width <= 768) {
            featured.style.width = "85vw";
            featured.style.maxWidth = "85vw";
          } else if (width <= 1024) {
            featured.style.width = "80vw";
            featured.style.maxWidth = "80vw";
          } else {
            featured.style.width = "75vw";
            featured.style.maxWidth = "75vw";
          }
        }

        updateFeaturedAnimation();
        ScrollTrigger.refresh();
      }, 200);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      clearTimeout(initTimer);
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <section className="gallery-grid" ref={galleryRef}>
      <h2 className="gallery-grid__title">90% de Clientes Satisfechos</h2>
      <div className="gallery-grid__container">
        <div className="gallery-grid__featured">
          <div className="gallery-grid__featured-inner">
            <img className="gallery-grid__featured-image" src={galleryImages[0]} alt="Taller Raccoons" />
          </div>
        </div>
        <div className="gallery-grid__images">
          <svg className="gallery-grid__svg" viewBox="0 0 2800 1900" fill="none" preserveAspectRatio="xMidYMid slice">
            <g className="gallery-grid__group" clipPath="url(#image-grid-clip-path)" style={{ transformOrigin: '1400px 950px', transform: 'scale(0.425)' }}>
              <image x="0" y="0" width="400" height="500" rx="56" preserveAspectRatio="xMidYMid slice" xlinkHref={galleryImages[4]}></image>
              <image x="2400" y="0" width="400" height="500" rx="56" preserveAspectRatio="xMidYMid slice" xlinkHref={galleryImages[1]}></image>
              <image x="0" y="700" width="400" height="500" rx="56" preserveAspectRatio="xMidYMid slice" xlinkHref={galleryImages[2]}></image>
              <image x="2400" y="700" width="400" height="500" rx="56" preserveAspectRatio="xMidYMid slice" xlinkHref={galleryImages[3]}></image>
              <image x="0" y="1400" width="400" height="500" rx="56" preserveAspectRatio="xMidYMid slice" xlinkHref={galleryImages[5]}></image>
              <image x="2400" y="1400" width="400" height="500" rx="56" preserveAspectRatio="xMidYMid slice" xlinkHref={galleryImages[6]}></image>
            </g>
            <g className="gallery-grid__group" clipPath="url(#image-grid-clip-path)" style={{ transformOrigin: '1400px 950px', transform: 'scale(0.575)' }}>
              <image x="600" y="0" width="400" height="500" rx="56" preserveAspectRatio="xMidYMid slice" xlinkHref={galleryImages[15]}></image>
              <image x="1800" y="0" width="400" height="500" rx="56" preserveAspectRatio="xMidYMid slice" xlinkHref={galleryImages[7]}></image>
              <image x="600" y="700" width="400" height="500" rx="56" preserveAspectRatio="xMidYMid slice" xlinkHref={galleryImages[8]}></image>
              <image x="1800" y="700" width="400" height="500" rx="56" preserveAspectRatio="xMidYMid slice" xlinkHref={galleryImages[9]}></image>
              <image x="600" y="1400" width="400" height="500" rx="56" preserveAspectRatio="xMidYMid slice" xlinkHref={galleryImages[10]}></image>
              <image x="1800" y="1400" width="400" height="500" rx="56" preserveAspectRatio="xMidYMid slice" xlinkHref={galleryImages[11]}></image>
            </g>
            <g className="gallery-grid__group" clipPath="url(#image-grid-clip-path)" style={{ transformOrigin: '1400px 950px', transform: 'scale(0.725)' }}>
              <image x="1200" y="0" width="400" height="500" rx="56" preserveAspectRatio="xMidYMid slice" xlinkHref={galleryImages[12]}></image>
              <image x="1200" y="1400" width="400" height="500" rx="56" preserveAspectRatio="xMidYMid slice" xlinkHref={galleryImages[13]}></image>
            </g>
            <defs>
              <clipPath id="image-grid-clip-path">
                <rect id="grid-target" x="0" y="0" width="400" height="500" rx="56" fill="#DDD"></rect>
                <rect x="600" y="0" width="400" height="500" rx="56" fill="#DDD"></rect>
                <rect x="1200" y="0" width="400" height="500" rx="56" fill="#DDD"></rect>
                <rect x="1800" y="0" width="400" height="500" rx="56" fill="#DDD"></rect>
                <rect x="2400" y="0" width="400" height="500" rx="56" fill="#DDD"></rect>
                <rect x="0" y="700" width="400" height="500" rx="56" fill="#DDD"></rect>
                <rect x="600" y="700" width="400" height="500" rx="56" fill="#DDD"></rect>
                <rect x="1800" y="700" width="400" height="500" rx="56" fill="#DDD"></rect>
                <rect x="2400" y="700" width="400" height="500" rx="56" fill="#DDD"></rect>
                <rect x="0" y="1400" width="400" height="500" rx="56" fill="#DDD"></rect>
                <rect x="600" y="1400" width="400" height="500" rx="56" fill="#DDD"></rect>
                <rect x="1200" y="1400" width="400" height="500" rx="56" fill="#DDD"></rect>
                <rect x="1800" y="1400" width="400" height="500" rx="56" fill="#DDD"></rect>
                <rect x="2400" y="1400" width="400" height="500" rx="56" fill="#DDD"></rect>
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
    </section>
  );
}

export default MosaicGallery;
