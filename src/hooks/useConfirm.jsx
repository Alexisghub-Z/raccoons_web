import { useCallback, useRef, useState } from 'react';
import ConfirmModal from '../components/admin/ConfirmModal';

export function useConfirm() {
  const [state, setState] = useState({
    isOpen: false,
    title: 'Confirmar acción',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    variant: 'info',
    isLoading: false,
  });
  const resolverRef = useRef(null);

  const confirm = useCallback((opts = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setState({
        isOpen: true,
        title: opts.title || 'Confirmar acción',
        message: opts.message || '',
        confirmText: opts.confirmText || 'Confirmar',
        cancelText: opts.cancelText || 'Cancelar',
        variant: opts.variant || 'info',
        isLoading: false,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolverRef.current?.(true);
    resolverRef.current = null;
    setState((s) => ({ ...s, isOpen: false, isLoading: false }));
  }, []);

  const handleCancel = useCallback(() => {
    resolverRef.current?.(false);
    resolverRef.current = null;
    setState((s) => ({ ...s, isOpen: false, isLoading: false }));
  }, []);

  const ConfirmElement = (
    <ConfirmModal
      isOpen={state.isOpen}
      title={state.title}
      message={state.message}
      confirmText={state.confirmText}
      cancelText={state.cancelText}
      variant={state.variant}
      isLoading={state.isLoading}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, ConfirmElement };
}
