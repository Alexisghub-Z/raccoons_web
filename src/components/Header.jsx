import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <img src="/logo.png" alt="Raccoons Logo" className="logo-img" />
          <span className="logo-text">RACCOONS</span>
        </div>

        <nav className="nav">
          <ul className="nav-list">
            <li><a href="#inicio" className="nav-link">Inicio</a></li>
            <li><a href="#servicios" className="nav-link">Servicios</a></li>
            <li><a href="#galeria" className="nav-link">Galería</a></li>
            <li><a href="#nosotros" className="nav-link">Nosotros</a></li>
            <li><a href="#contacto" className="nav-link">Contacto</a></li>
          </ul>
        </nav>

        <button className="cta-button">Agendar Cita</button>

        <button className="menu-toggle" aria-label="Toggle menu">
          <span className="hamburger"></span>
          <span className="hamburger"></span>
          <span className="hamburger"></span>
        </button>
      </div>
    </header>
  );
}

export default Header;
