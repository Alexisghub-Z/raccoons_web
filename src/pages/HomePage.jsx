import { useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Stats from '../components/Stats';
import MosaicGallery from '../components/MosaicGallery';
import {
  Wrench,
  Settings,
  Palette,
  Package,
  Search,
  Smartphone,
  Clock,
  Inbox,
  Cog,
  CheckCircle,
  Bike,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  // Optimización: Memoización de handlers
  const handleWhatsAppClick = useCallback(() => {
    window.open('https://wa.me/12345678900?text=Hola,%20me%20gustaría%20agendar%20una%20cita%20para%20mi%20moto', '_blank');
  }, []);

  const handleTrackingClick = useCallback(() => {
    navigate('/seguimiento');
  }, [navigate]);

  // Optimización: Parallax con throttling para mejor performance
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking && heroRef.current) {
        window.requestAnimationFrame(() => {
          const scrollPosition = window.scrollY;
          const heroHeight = heroRef.current?.offsetHeight || window.innerHeight;
          const scrollPercentage = Math.min(scrollPosition / heroHeight, 1);

          // Parallax effect - move slower than scroll
          const parallaxY = scrollPosition * 0.5;

          // Fade out and scale down
          const opacity = 1 - scrollPercentage * 1.2;
          const scale = 1 - scrollPercentage * 0.1;

          if (heroRef.current) {
            heroRef.current.style.transform = `translateY(${parallaxY}px) scale(${scale})`;
            heroRef.current.style.opacity = opacity;
          }

          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="home-page">
      <Header />

      {/* Hero Section */}
      <section id="inicio" className="hero">
        <div className="hero-content" ref={heroRef}>
          <h1 className="hero-title">
            <span className="hero-title-main">RACCOONS</span>
            <span className="hero-title-sub">Especialistas en Motocicletas</span>
          </h1>
          <p className="hero-description">
            Servicio profesional, pasión por las motos y compromiso con la excelencia
          </p>
          <div className="hero-buttons">
            <button className="hero-cta" onClick={handleWhatsAppClick}>
              <MessageCircle size={20} />
              <span>Contactar por WhatsApp</span>
              <ArrowRight size={18} className="btn-arrow" />
            </button>
            <button className="hero-cta-secondary" onClick={handleTrackingClick}>
              <Search size={20} />
              <span>Seguimiento de Servicio</span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <Stats />

      {/* Servicios Section */}
      <section id="servicios" className="services fade-in">
        <div className="container">
          <h2 className="section-title">Nuestros Servicios</h2>
          <p className="section-subtitle">
            Ofrecemos servicios profesionales de alta calidad para mantener tu moto en óptimas condiciones
          </p>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon-wrapper">
                <div className="service-icon"><Wrench size={40} /></div>
              </div>
              <h3>Mantenimiento</h3>
              <p>Mantenimiento preventivo y correctivo para garantizar el óptimo funcionamiento de tu motocicleta</p>
              <ul className="service-features">
                <li>Cambio de aceite y filtros</li>
                <li>Ajuste de cadena y frenos</li>
                <li>Revisión general completa</li>
              </ul>
            </div>
            <div className="service-card">
              <div className="service-icon-wrapper">
                <div className="service-icon"><Settings size={40} /></div>
              </div>
              <h3>Reparación</h3>
              <p>Diagnóstico preciso y reparación especializada de todos los sistemas de tu moto</p>
              <ul className="service-features">
                <li>Reparación de motor</li>
                <li>Sistema eléctrico</li>
                <li>Suspensión y frenos</li>
              </ul>
            </div>
            <div className="service-card">
              <div className="service-icon-wrapper">
                <div className="service-icon"><Palette size={40} /></div>
              </div>
              <h3>Personalización</h3>
              <p>Dale a tu moto un toque único con nuestras opciones de customización profesional</p>
              <ul className="service-features">
                <li>Modificaciones de diseño</li>
                <li>Mejoras de rendimiento</li>
                <li>Pintura personalizada</li>
              </ul>
            </div>
            <div className="service-card">
              <div className="service-icon-wrapper">
                <div className="service-icon"><Package size={40} /></div>
              </div>
              <h3>Accesorios</h3>
              <p>Instalación profesional de accesorios y upgrades para mejorar tu experiencia</p>
              <ul className="service-features">
                <li>Sistemas de escape</li>
                <li>Iluminación LED</li>
                <li>Protección y seguridad</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Carousel Section */}
      <section className="brands-section fade-in">
        <div className="container">
          <h2 className="section-title">Marcas con las que Trabajamos</h2>
          <p className="section-subtitle">
            Especialistas en las principales marcas de motocicletas
          </p>
        </div>
        <div className="slider">
          <div className="slide-track">
            {/* Primera serie de logos */}
            <div className="slide">
              <img src="/brands/honda.png" height="120" alt="Honda" />
            </div>
            <div className="slide">
              <img src="/brands/yamaha.png" height="120" alt="Yamaha" />
            </div>
            <div className="slide">
              <img src="/brands/suzuki.png" height="120" alt="Suzuki" />
            </div>
            <div className="slide">
              <img src="/brands/kawasaki.png" height="120" alt="Kawasaki" />
            </div>
            <div className="slide">
              <img src="/brands/ducati.png" height="120" alt="Ducati" />
            </div>
            <div className="slide">
              <img src="/brands/harley.png" height="120" alt="Harley Davidson" />
            </div>
            <div className="slide">
              <img src="/brands/bmw.png" height="120" alt="BMW" />
            </div>
            <div className="slide">
              <img src="/brands/cfmoto.png" height="120" alt="CF Moto" />
            </div>
            <div className="slide">
              <img src="/brands/bajaj.png" height="120" alt="Bajaj" />
            </div>
            {/* Segunda serie (duplicada para efecto infinito) */}
            <div className="slide">
              <img src="/brands/honda.png" height="120" alt="Honda" />
            </div>
            <div className="slide">
              <img src="/brands/yamaha.png" height="120" alt="Yamaha" />
            </div>
            <div className="slide">
              <img src="/brands/suzuki.png" height="120" alt="Suzuki" />
            </div>
            <div className="slide">
              <img src="/brands/kawasaki.png" height="120" alt="Kawasaki" />
            </div>
            <div className="slide">
              <img src="/brands/ducati.png" height="120" alt="Ducati" />
            </div>
            <div className="slide">
              <img src="/brands/harley.png" height="120" alt="Harley Davidson" />
            </div>
            <div className="slide">
              <img src="/brands/bmw.png" height="120" alt="BMW" />
            </div>
            <div className="slide">
              <img src="/brands/cfmoto.png" height="120" alt="CF Moto" />
            </div>
            <div className="slide">
              <img src="/brands/bajaj.png" height="120" alt="Bajaj" />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="nosotros" className="about fade-in">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2 className="section-title">Sobre Nosotros</h2>
              <p>
                En Raccoons somos un equipo de mecánicos apasionados por las motocicletas
                con más de 10 años de experiencia en el sector. Nos especializamos en
                mantenimiento, reparación y personalización de todo tipo de motos.
              </p>
              <p>
                Nuestro compromiso es brindarte un servicio de calidad, utilizando las
                mejores herramientas y repuestos para garantizar el óptimo funcionamiento
                de tu motocicleta.
              </p>
              <ul className="about-features">
                <li>✓ Mecánicos certificados</li>
                <li>✓ Equipamiento profesional</li>
                <li>✓ Garantía en todos nuestros trabajos</li>
                <li>✓ Atención personalizada</li>
              </ul>
            </div>
            <div className="about-image">
              <div className="carousel">
                <input type="radio" id="carousel-1" name="carousel[]" defaultChecked />
                <input type="radio" id="carousel-2" name="carousel[]" />
                <input type="radio" id="carousel-3" name="carousel[]" />
                <input type="radio" id="carousel-4" name="carousel[]" />
                <input type="radio" id="carousel-5" name="carousel[]" />

                <ul className="carousel__items">
                  <li className="carousel__item">
                    <img src="/workshop/taller-1.jpg" alt="Taller Raccoons 1" />
                  </li>
                  <li className="carousel__item">
                    <img src="/workshop/taller-2.jpg" alt="Taller Raccoons 2" />
                  </li>
                  <li className="carousel__item">
                    <img src="/workshop/taller-3.jpg" alt="Taller Raccoons 3" />
                  </li>
                  <li className="carousel__item">
                    <img src="/workshop/taller-4.jpg" alt="Taller Raccoons 4" />
                  </li>
                  <li className="carousel__item">
                    <img src="/workshop/taller-5.jpg" alt="Taller Raccoons 5" />
                  </li>
                </ul>

                <div className="carousel__prev">
                  <label htmlFor="carousel-1"></label>
                  <label htmlFor="carousel-2"></label>
                  <label htmlFor="carousel-3"></label>
                  <label htmlFor="carousel-4"></label>
                  <label htmlFor="carousel-5"></label>
                </div>

                <div className="carousel__next">
                  <label htmlFor="carousel-1"></label>
                  <label htmlFor="carousel-2"></label>
                  <label htmlFor="carousel-3"></label>
                  <label htmlFor="carousel-4"></label>
                  <label htmlFor="carousel-5"></label>
                </div>

                <div className="carousel__nav">
                  <label htmlFor="carousel-1"></label>
                  <label htmlFor="carousel-2"></label>
                  <label htmlFor="carousel-3"></label>
                  <label htmlFor="carousel-4"></label>
                  <label htmlFor="carousel-5"></label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workshop Gallery Section */}
      <MosaicGallery />

      {/* Service Tracking Section */}
      <section className="tracking-section">
        <div className="container">
          <h2 className="section-title">Rastrea tu Servicio 24/7</h2>
          <p className="section-subtitle">
            Con nuestro sistema de seguimiento en línea, puedes verificar el estado de tu motocicleta en cualquier momento
          </p>

          <div className="tracking-content">
            <div className="tracking-info">
              <h3>Seguimiento en Tiempo Real</h3>
              <p>
                Mantente informado del estado de tu moto en cada paso del proceso. Solo necesitas tu código de
                seguimiento único.
              </p>

              <div className="tracking-features">
                <div className="tracking-feature">
                  <span className="feature-icon"><Search size={40} /></span>
                  <div>
                    <h4>Transparencia Total</h4>
                    <p>Ve en qué etapa se encuentra tu moto en tiempo real</p>
                  </div>
                </div>
                <div className="tracking-feature">
                  <span className="feature-icon"><Smartphone size={40} /></span>
                  <div>
                    <h4>Acceso desde Cualquier Dispositivo</h4>
                    <p>Consulta desde tu celular, tablet o computadora</p>
                  </div>
                </div>
                <div className="tracking-feature">
                  <span className="feature-icon"><Clock size={40} /></span>
                  <div>
                    <h4>Actualizaciones Constantes</h4>
                    <p>Información actualizada en cada cambio de estado</p>
                  </div>
                </div>
              </div>

              <div className="tracking-cta">
                <Link to="/seguimiento" className="btn-tracking">
                  Rastrear mi Servicio
                </Link>
                <p className="tracking-code-example">Ej: RCN-ABC123XYZ</p>
              </div>
            </div>

            <div className="tracking-visual">
              <div className="tracking-timeline">
                <div className="timeline-step">
                  <div className="step-icon"><Inbox size={28} /></div>
                  <div className="step-content">
                    <h4>Recibido</h4>
                    <p>Tu moto llegó al taller</p>
                  </div>
                </div>
                <div className="timeline-connector"></div>
                <div className="timeline-step">
                  <div className="step-icon"><Search size={28} /></div>
                  <div className="step-content">
                    <h4>En Diagnóstico</h4>
                    <p>Revisando el estado general</p>
                  </div>
                </div>
                <div className="timeline-connector"></div>
                <div className="timeline-step">
                  <div className="step-icon"><Cog size={28} /></div>
                  <div className="step-content">
                    <h4>En Reparación</h4>
                    <p>Trabajando en tu moto</p>
                  </div>
                </div>
                <div className="timeline-connector"></div>
                <div className="timeline-step">
                  <div className="step-icon"><CheckCircle size={28} /></div>
                  <div className="step-content">
                    <h4>Listo para Entrega</h4>
                    <p>¡Tu moto está lista!</p>
                  </div>
                </div>
                <div className="timeline-connector"></div>
                <div className="timeline-step">
                  <div className="step-icon"><Bike size={28} /></div>
                  <div className="step-content">
                    <h4>Entregado</h4>
                    <p>Servicio completado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="contact fade-in">
        <div className="container">
          <h2 className="section-title">Contáctanos y Encuéntranos</h2>

          {/* Información de contacto */}
          <div className="contact-info-grid">
            <div className="contact-item">
              <div className="contact-icon"><MapPin size={32} /></div>
              <h3>Ubicación</h3>
              <p>Lib. Atoyac 222, Eucaliptos</p>
              <p>68050 Oaxaca de Juárez, Oax.</p>
            </div>
            <div className="contact-item">
              <div className="contact-icon"><Phone size={32} /></div>
              <h3>Teléfono</h3>
              <p>+1 234 567 8900</p>
            </div>
            <div className="contact-item">
              <div className="contact-icon"><Mail size={32} /></div>
              <h3>Email</h3>
              <p>info@raccoons.com</p>
            </div>
            <div className="contact-item">
              <div className="contact-icon"><Clock size={32} /></div>
              <h3>Horario</h3>
              <p>Lun - Vie: 8:00 - 18:00</p>
              <p>Sábado: 9:00 - 14:00</p>
            </div>
          </div>

          {/* Mapa de ubicación */}
          <div className="contact-map-section">
            <h3>Nuestra ubicación</h3>
            <div className="map-container-large">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3813.0184853317637!2d-96.76939392310126!3d17.120597610432537!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85c71fa31eac39a7%3A0xa50332883a9f1a54!2sRACCOONS!5e0!3m2!1ses!2smx!4v1767456037370!5m2!1ses!2smx"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación del Taller Raccoons"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>RACCOONS</h3>
              <p>Taller especializado en motocicletas</p>
            </div>

            <div className="footer-instagram">
              <a
                href="https://www.instagram.com/raccoons_oax/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-instagram-card"
              >
                <div className="footer-instagram-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div className="footer-instagram-info">
                  <span className="footer-instagram-label">Síguenos</span>
                  <span className="footer-instagram-user">@raccoons_oax</span>
                </div>
              </a>
            </div>

            <div className="footer-social">
              <a href="https://www.facebook.com/raccoons_oax" target="_blank" rel="noopener noreferrer" className="social-link">Facebook</a>
              <a href="https://www.tiktok.com/@raccoons_oax" target="_blank" rel="noopener noreferrer" className="social-link">TikTok</a>
              <a href="https://www.youtube.com/@raccoons_oax" target="_blank" rel="noopener noreferrer" className="social-link">YouTube</a>
              <a href="https://wa.me/12345678900" target="_blank" rel="noopener noreferrer" className="social-link">WhatsApp</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Raccoons. Todos los derechos reservados.</p>
            <Link to="/admin" className="admin-link">Panel de Administración</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
