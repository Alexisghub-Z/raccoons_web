import { useCallback, useReducer } from 'react';
import Toast from './Toast';
import { ToastContext } from './toast-context';
import './ToastProvider.css';

function toastReducer(state, action) {
  switch (action.type) {
    case 'add':
      return [...state, action.toast];
    case 'remove':
      return state.filter(t => t.id !== action.id);
    default:
      return state;
  }
}

let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const dismissToast = useCallback((id) => {
    dispatch({ type: 'remove', id });
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++nextId;
    dispatch({ type: 'add', toast: { id, message, type, duration } });
    return id;
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div className="toast-container" role="region" aria-live="polite" aria-label="Notificaciones">
        {toasts.map(t => (
          <Toast
            key={t.id}
            message={t.message}
            type={t.type}
            duration={t.duration}
            onClose={() => dismissToast(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
