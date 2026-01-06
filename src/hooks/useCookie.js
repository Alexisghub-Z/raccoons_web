import { useState, useCallback } from 'react';

/**
 * Custom hook para manejar cookies
 * @param {string} key - Nombre de la cookie
 * @param {string} defaultValue - Valor por defecto si la cookie no existe
 * @param {number} days - Días de duración de la cookie (por defecto 30 días)
 */
export function useCookie(key, defaultValue = '', days = 30) {
  // Función para obtener una cookie
  const getCookie = useCallback(() => {
    const name = key + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');

    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i].trim();
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length);
      }
    }
    return defaultValue;
  }, [key, defaultValue]);

  // Estado inicial con el valor de la cookie
  const [value, setValue] = useState(() => getCookie());

  // Función para establecer una cookie
  const setCookie = useCallback((newValue, expirationDays = days) => {
    const date = new Date();
    date.setTime(date.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
    const expires = 'expires=' + date.toUTCString();
    document.cookie = `${key}=${newValue};${expires};path=/`;
    setValue(newValue);
  }, [key, days]);

  // Función para eliminar una cookie
  const deleteCookie = useCallback(() => {
    document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    setValue(defaultValue);
  }, [key, defaultValue]);

  return [value, setCookie, deleteCookie];
}
