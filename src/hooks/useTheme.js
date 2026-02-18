import { useEffect, useState } from 'react';

/**
 * Hook optimizado para gestión de tema oscuro/claro
 * - Usa CSS Variables para cambios instantáneos
 * - Persiste preferencia en localStorage
 * - Detecta preferencia del sistema operativo
 * - Sin re-renders innecesarios
 */
export function useTheme() {
  // Detectar tema inicial (localStorage > light)
  const getInitialTheme = () => {
    // 1. Verificar localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }

    // 2. Default: light (tema blanco siempre por defecto)
    return 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Aplicar tema al DOM (super optimizado)
  useEffect(() => {
    const root = document.documentElement;

    // Desactivar transiciones durante el cambio de tema
    root.classList.add('theme-switching');
    root.setAttribute('data-theme', theme);

    // Reactivar transiciones después del repaint
    setTimeout(() => {
      root.classList.remove('theme-switching');
    }, 50);

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
