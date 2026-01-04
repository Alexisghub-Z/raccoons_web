import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SplashScreen from './components/SplashScreen'
import HomePage from './pages/HomePage'
import AdminPage from './pages/AdminPage'
import TrackingPage from './pages/TrackingPage'
import './App.css'

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showContent, setShowContent] = useState(false);

  const handleSplashFinish = () => {
    setShowSplash(false);
    setTimeout(() => {
      setShowContent(true);
    }, 100);
  };

  return (
    <Router>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

      <div className={`main-content ${showContent ? 'visible' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/seguimiento" element={<TrackingPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
