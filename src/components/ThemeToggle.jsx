import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import './ThemeToggle.css';

function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    toggleTheme();

    // Remover la clase de animación después de que termine
    setTimeout(() => {
      setIsAnimating(false);
    }, 500); // Duración de la animación
  };

  return (
    <button
      className="theme-toggle"
      onClick={handleToggle}
      aria-label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
      title={`Modo ${isDark ? 'claro' : 'oscuro'}`}
    >
      <div className={`theme-toggle-icon ${isAnimating ? 'rotate' : ''}`}>
        {isDark ? (
          <Moon size={20} strokeWidth={2} />
        ) : (
          <Sun size={20} strokeWidth={2} />
        )}
      </div>
    </button>
  );
}

export default ThemeToggle;
