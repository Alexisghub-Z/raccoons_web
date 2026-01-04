import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Instagram } from 'lucide-react';
import './Header.css';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
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

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/logo.png" alt="Raccoons Logo" className="logo-img" />
          <span className="logo-text">RACCOONS</span>
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
              <span>@raccoons_oax</span>
            </button>
            <button
              className="mobile-social-btn whatsapp"
              onClick={() => {
                window.open('https://wa.me/12345678900?text=Hola,%20me%20gustaría%20información%20sobre%20sus%20servicios', '_blank');
                closeMenu();
              }}
            >
              <MessageCircle size={24} />
              <span>WhatsApp</span>
            </button>
          </div>
        </nav>

        <div className="header-social-buttons">
          <button
            className="cta-button instagram-button"
            onClick={() => window.open('https://www.instagram.com/raccoons_oax/', '_blank')}
          >
            <Instagram size={18} />
            <span>@raccoons_oax</span>
          </button>
          <button
            className="cta-button whatsapp-button"
            onClick={() => window.open('https://wa.me/12345678900?text=Hola,%20me%20gustaría%20información%20sobre%20sus%20servicios', '_blank')}
          >
            <MessageCircle size={18} />
            <span>WhatsApp</span>
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
