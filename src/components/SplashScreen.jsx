import { useEffect, useState } from 'react';
import './SplashScreen.css';

function SplashScreen({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Iniciar fade out después de mostrar el texto
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 4500);

    // Llamar a onFinish después del fade out completo
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 5500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`splash ${fadeOut ? 'fade-out' : ''}`}>
      <div className="splash_logo">
        <img src="/logo.jpg" alt="Raccoons" className="splash_logo_img" />
        <span className="splash_logo_text">RACCOONS</span>
      </div>
      <div className="splash_svg">
        <svg width="100%" height="100%">
          <rect width="100%" height="100%" />
        </svg>
      </div>
      <div className="splash_minimize">
        <svg width="100%" height="100%">
          <rect width="100%" height="100%" />
        </svg>
      </div>
      <div className="text">
        <p>Taller de</p>
        <p>Motocicletas</p>
      </div>
    </div>
  );
}

export default SplashScreen;
