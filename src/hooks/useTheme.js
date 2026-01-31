import { useEffect, useState } from 'react';

/**
 * Hook optimizado para gestión de tema oscuro/claro
 * - Usa CSS Variables para cambios instantáneos
 * - Persiste preferencia en localStorage
 * - Detecta preferencia del sistema operativo
 * - Sin re-renders innecesarios
 */
export function useTheme() {
  // Detectar tema inicial (localStorage > sistema > light)
  const getInitialTheme = () => {
    // 1. Verificar localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }

    // 2. Verificar preferencia del sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    // 3. Default: light
    return 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Aplicar tema al DOM (super optimizado)
  useEffect(() => {
    const root = document.documentElement;

    // Cambiar data-theme (CSS responde automáticamente)
    root.setAttribute('data-theme', theme);

    // Guardar en localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Escuchar cambios del sistema (opcional)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      // Solo actualizar si no hay preferencia guardada
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Toggle función (cambio instantáneo)
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme, isDark: theme === 'dark' };
}
