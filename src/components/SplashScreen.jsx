import { useEffect, useState } from 'react';
import './SplashScreen.css';

function SplashScreen({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Tiempos ajustados para que la animación se complete
    // Texto termina a los 4.2s, esperamos un poco más
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 4500); // Inicia fade después de que termine toda la animación

    // Llamar a onFinish después del fade out completo (1s)
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 5500); // 4.5s + 1s de fade = 5.5s total

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`splash ${fadeOut ? 'fade-out' : ''}`}>
      <div className="splash_logo">
        <img src="/logo.png" alt="Raccoons" className="splash_logo_img" />
        <span className="splash_logo_text">RACCOONS<sup className="trademark">®</sup></span>
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
        <p>Ingenio Sin Límites</p>
      </div>
    </div>
  );
}

export default SplashScreen;
