import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './MosaicGallery.css';

gsap.registerPlugin(ScrollTrigger);

function MosaicGallery() {
  const galleryRef = useRef(null);

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
          borderRadius: 56,
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

    const handleResize = () => {
      ScrollTrigger.getAll().forEach(st => st.kill());

      gsap.set(".gallery-grid__featured", { clearProps: "all" });
      gsap.set(".gallery-grid__featured-inner", { clearProps: "all" });

      const featured = document.querySelector(".gallery-grid__featured");
      if (featured) {
        featured.style.width = "75vw";
        featured.style.maxWidth = "75vw";
      }

      updateFeaturedAnimation();
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(initTimer);
      window.removeEventListener("resize", handleResize);
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <section className="gallery-grid" ref={galleryRef}>
      <h2 className="gallery-grid__title">Más de 100 Clientes Satisfechos</h2>
      <div className="gallery-grid__container">
        <div className="gallery-grid__featured">
          <div className="gallery-grid__featured-inner">
            <img className="gallery-grid__featured-image" src="/workshop/taller-1.jpg" alt="Taller Raccoons" />
          </div>
        </div>
        <div className="gallery-grid__images">
          <svg className="gallery-grid__svg" viewBox="0 0 2800 1900" fill="none" preserveAspectRatio="xMidYMid slice">
            <g className="gallery-grid__group" clipPath="url(#image-grid-clip-path)" style={{ transformOrigin: '1400px 950px', transform: 'scale(0.425)' }}>
              <image x="0" y="0" width="400" height="500" rx="56" preserveAspectRatio="xMidYMid slice" xlinkHref="/workshop/taller-1.jpg"></image>
              <image x="2400" y="0" width="400" height="500" rx="56" preserveAspectRatio="xMidYMid slice" xlinkHref="/workshop/taller-2.jpg"></image>
              <image x="0" y="700" width="400" height="500" rx="56" preserveAspectRatio="xMidYMid slice" xlinkHref="/workshop/taller-3.jpg"></image>
              <image x="2400" y="700" width="400" height="500" rx="56" preserveAspectRatio="xMidYMid slice" xlinkHref="/workshop/taller-4.jpg"></image>
              <image x="0" y="1400" width="400" height="500" rx="56" preserveAspectRatio="xMidYMid slice" xlinkHref="/workshop/taller-5.jpg"></image>
              <image x="2400" y="1400" width="400" height="500" rx="56" preserveAspectRatio="xMidYMid slice" xlinkHref="/workshop/taller-1.jpg"></image>
            </g>
            <g className="gallery-grid__group" clipPath="url(#image-grid-clip-path)" style={{ transformOrigin: '1400px 950px', transform: 'scale(0.575)' }}>
              <image x="600" y="0" width="400" height="500" rx="56" preserveAspectRatio="xMidYMid slice" xlinkHref="/workshop/taller-2.jpg"></image>
              <image x="1800" y="0" width="400" height="500" rx="56" preserveAspectRatio="xMidYMid slice" xlinkHref="/workshop/taller-3.jpg"></image>
              <image x="600" y="700" width="400" height="500" rx="56" preserveAspectRatio="xMidYMid slice" xlinkHref="/workshop/taller-4.jpg"></image>
              <image x="1800" y="700" width="400" height="500" rx="56" preserveAspectRatio="xMidYMid slice" xlinkHref="/workshop/taller-5.jpg"></image>
              <image x="600" y="1400" width="400" height="500" rx="56" preserveAspectRatio="xMidYMid slice" xlinkHref="/workshop/taller-1.jpg"></image>
              <image x="1800" y="1400" width="400" height="500" rx="56" preserveAspectRatio="xMidYMid slice" xlinkHref="/workshop/taller-2.jpg"></image>
            </g>
            <g className="gallery-grid__group" clipPath="url(#image-grid-clip-path)" style={{ transformOrigin: '1400px 950px', transform: 'scale(0.725)' }}>
              <image x="1200" y="0" width="400" height="500" rx="56" preserveAspectRatio="xMidYMid slice" xlinkHref="/workshop/taller-3.jpg"></image>
              <image x="1200" y="1400" width="400" height="500" rx="56" preserveAspectRatio="xMidYMid slice" xlinkHref="/workshop/taller-4.jpg"></image>
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
