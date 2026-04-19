import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, Info, Loader2 } from 'lucide-react';
import './ConfirmModal.css';

const VARIANT_META = {
  danger: { Icon: Trash2, className: 'confirm-modal--danger' },
  warning: { Icon: AlertTriangle, className: 'confirm-modal--warning' },
  info: { Icon: Info, className: 'confirm-modal--info' },
};

function ConfirmModal({
  isOpen,
  title = 'Confirmar acción',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'info',
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape' && !isLoading) onCancel?.();
    };
    document.addEventListener('keydown', handleKey);
    confirmBtnRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const meta = VARIANT_META[variant] || VARIANT_META.info;
  const { Icon } = meta;

  return createPortal(
    <div
      className="confirm-modal-overlay"
      onClick={() => !isLoading && onCancel?.()}
      role="presentation"
    >
      <div
        className={`confirm-modal ${meta.className}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className="confirm-modal-header">
          <span className="confirm-modal-icon">
            <Icon size={22} />
          </span>
          <h3 id="confirm-modal-title" className="confirm-modal-title">{title}</h3>
        </div>

        {message && (
          <p className="confirm-modal-message">{message}</p>
        )}

        <div className="confirm-modal-actions">
          <button
            type="button"
            className="confirm-modal-btn confirm-modal-btn--cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            className={`confirm-modal-btn confirm-modal-btn--${variant}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 size={16} className="confirm-modal-spinner" /> : null}
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmModal;
