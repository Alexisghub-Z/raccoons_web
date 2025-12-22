import { useState } from 'react'
import Header from './components/Header'
import SplashScreen from './components/SplashScreen'
import './App.css'

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showContent, setShowContent] = useState(false);

  const handleSplashFinish = () => {
    setShowSplash(false);
    // Pequeño delay antes de mostrar el contenido para suavizar la transición
    setTimeout(() => {
      setShowContent(true);
    }, 100);
  };

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      <div className={`main-content ${showContent ? 'visible' : ''}`}>
        <Header />
        <main>
          <h1>Bienvenido a Raccoons</h1>
          <p>Taller de motocicletas profesional</p>
        </main>
      </div>
    </>
  )
}

export default App
