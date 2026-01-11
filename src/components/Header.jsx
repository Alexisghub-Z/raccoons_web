import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Instagram, Facebook, Youtube } from 'lucide-react';
import './Header.css';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleNavClick = (sectionId) => {
    closeMenu();

    // Si estamos en la página principal, hacer scroll suave
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Si estamos en otra página, navegar a home y luego hacer scroll
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // Detectar scroll y galería
  useEffect(() => {
    const handleScroll = () => {
      // Detectar scroll para efecto de fondo
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Detectar galería para ocultar header
      const gallery = document.querySelector('.gallery-grid');
      if (!gallery) return;

      const galleryRect = gallery.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Ocultar el header si la galería está visible en el viewport
      if (galleryRect.top < windowHeight * 0.5 && galleryRect.bottom > windowHeight * 0.5) {
        setHeaderHidden(true);
      } else {
        setHeaderHidden(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Ejecutar una vez al montar

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${headerHidden ? 'hidden' : ''} ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/logo.png" alt="Raccoons Logo" className="logo-img" />
          <span className="logo-text">RACCOONS<sup className="trademark">®</sup></span>
        </div>

        <nav className={`nav ${menuOpen ? 'active' : ''}`}>
          <ul className="nav-list">
            <li><button className="nav-link" onClick={() => handleNavClick('inicio')}>Inicio</button></li>
            <li><button className="nav-link" onClick={() => handleNavClick('servicios')}>Servicios</button></li>
            <li><button className="nav-link" onClick={() => handleNavClick('nosotros')}>Nosotros</button></li>
            <li><button className="nav-link" onClick={() => handleNavClick('contacto')}>Contacto</button></li>
          </ul>
          <div className="mobile-social-buttons">
            <button
              className="mobile-social-btn instagram"
              onClick={() => {
                window.open('https://www.instagram.com/raccoons_oax/', '_blank');
                closeMenu();
              }}
            >
              <Instagram size={24} />
              <span>Instagram</span>
            </button>
            <button
              className="mobile-social-btn facebook"
              onClick={() => {
                window.open('https://www.facebook.com/raccoons_oax', '_blank');
                closeMenu();
              }}
            >
              <Facebook size={24} />
              <span>Facebook</span>
            </button>
            <button
              className="mobile-social-btn tiktok"
              onClick={() => {
                window.open('https://www.tiktok.com/@raccoons_oax', '_blank');
                closeMenu();
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              <span>TikTok</span>
            </button>
            <button
              className="mobile-social-btn youtube"
              onClick={() => {
                window.open('https://www.youtube.com/@raccoons_oax', '_blank');
                closeMenu();
              }}
            >
              <Youtube size={24} />
              <span>YouTube</span>
            </button>
          </div>
        </nav>

        <div className="header-social-buttons">
          <button
            className="social-icon-btn instagram"
            onClick={() => window.open('https://www.instagram.com/raccoons_oax/', '_blank')}
            aria-label="Instagram"
          >
            <Instagram size={28} />
          </button>
          <button
            className="social-icon-btn facebook"
            onClick={() => window.open('https://www.facebook.com/raccoons_oax', '_blank')}
            aria-label="Facebook"
          >
            <Facebook size={28} />
          </button>
          <button
            className="social-icon-btn tiktok"
            onClick={() => window.open('https://www.tiktok.com/@raccoons_oax', '_blank')}
            aria-label="TikTok"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
          </button>
          <button
            className="social-icon-btn youtube"
            onClick={() => window.open('https://www.youtube.com/@raccoons_oax', '_blank')}
            aria-label="YouTube"
          >
            <Youtube size={28} />
          </button>
        </div>

        <button
          className={`menu-toggle ${menuOpen ? 'active' : ''}`}
          aria-label="Toggle menu"
          onClick={toggleMenu}
        >
          <span className="hamburger"></span>
          <span className="hamburger"></span>
          <span className="hamburger"></span>
        </button>
      </div>
    </header>
  );
}

export default Header;
