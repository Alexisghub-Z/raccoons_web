import { useState } from 'react';
import './Header.css';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <img src="/logo.png" alt="Raccoons Logo" className="logo-img" />
          <span className="logo-text">RACCOONS</span>
        </div>

        <nav className={`nav ${menuOpen ? 'active' : ''}`}>
          <ul className="nav-list">
            <li><a href="#inicio" className="nav-link" onClick={closeMenu}>Inicio</a></li>
            <li><a href="#servicios" className="nav-link" onClick={closeMenu}>Servicios</a></li>
            <li><a href="#galeria" className="nav-link" onClick={closeMenu}>Galería</a></li>
            <li><a href="#nosotros" className="nav-link" onClick={closeMenu}>Nosotros</a></li>
            <li><a href="#contacto" className="nav-link" onClick={closeMenu}>Contacto</a></li>
          </ul>
        </nav>

        <button className="cta-button">Agendar Cita</button>

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
