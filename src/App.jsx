import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Lenis from 'lenis'
import SplashScreen from './components/SplashScreen'
import './App.css'

// Lazy loading de páginas para mejor performance
const HomePage = lazy(() => import('./pages/HomePage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const TrackingPage = lazy(() => import('./pages/TrackingPage'))

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showContent, setShowContent] = useState(false);

  const handleSplashFinish = () => {
    setShowSplash(false);
    setTimeout(() => {
      setShowContent(true);
    }, 100);
  };

  // Configurar Lenis Smooth Scroll - Optimizado
  useEffect(() => {
    if (!showContent) return; // Solo iniciar después del splash

    // Crear instancia de Lenis con configuración optimizada
    const lenis = new Lenis({
      duration: 1.0,        // Reducido para mejor performance
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.2, // Reducido para scroll más natural
      smoothTouch: false,   // Desactivado en touch para mejor performance móvil
      touchMultiplier: 1.5,
      infinite: false,
    });

    // Optimización: usar requestAnimationFrame solo cuando sea necesario
    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    // Limpiar al desmontar
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [showContent]);

  return (
    <Router>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

      <div className={`main-content ${showContent ? 'visible' : ''}`}>
        <Suspense fallback={
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: '#0a0a0a'
          }}>
            <div className="loading-spinner"></div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/seguimiento" element={<TrackingPage />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  )
}

export default App
