import { useEffect, useRef, useState } from 'react';
import { CheckCircle, XCircle, MessageCircle, Check } from 'lucide-react';
import './NotificationBell.css';

const RESPONSE_META = {
  AUTHORIZED: { Icon: CheckCircle, label: 'Autorizado', className: 'notif-item--authorized' },
  REJECTED: { Icon: XCircle, label: 'No autorizado', className: 'notif-item--rejected' },
  WHATSAPP_CONTACT: { Icon: MessageCircle, label: 'Solicita contacto', className: 'notif-item--whatsapp' },
};

function formatTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'Ahora';
  if (diffMin < 60) return `hace ${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `hace ${diffH}h`;
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
}

function NotificationBell({ notifications = [], unreadCount = 0, markRead, markAllRead, onRefresh, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);
  const btnRef = useRef(null);

  // Cerrar con click fuera
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) &&
          btnRef.current && !btnRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Cerrar con ESC
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen && onRefresh) onRefresh();
    setIsOpen(v => !v);
  };

  const handleItemClick = (n) => {
    markRead(n.id);
    if (n.serviceId && onNavigate) {
      onNavigate('SERVICES', n.serviceId);
    }
    setIsOpen(false);
  };

  return (
    <div className="notif-bell">
      <button
        ref={btnRef}
        className={`notif-bell-btn ${unreadCount > 0 ? 'notif-bell-btn--active' : ''}`}
        onClick={handleToggle}
        title="Notificaciones"
        aria-label={`Notificaciones${unreadCount > 0 ? `, ${unreadCount} sin leer` : ''}`}
      >
        <span className="notif-bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div ref={panelRef} className="notif-panel" role="dialog" aria-label="Panel de notificaciones">
          <div className="notif-panel-header">
            <span className="notif-panel-title">Notificaciones</span>
            {notifications.length > 0 && (
              <button className="notif-mark-all" onClick={markAllRead}>
                <Check size={13} />
                Marcar todo leído
              </button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <p className="notif-empty">Sin notificaciones nuevas</p>
            ) : (
              notifications.map(n => {
                const meta = RESPONSE_META[n.metadata?.response] || RESPONSE_META.AUTHORIZED;
                const { Icon } = meta;
                return (
                  <button
                    key={n.id}
                    className={`notif-item ${meta.className}`}
                    onClick={() => handleItemClick(n)}
                  >
                    <span className="notif-item-icon">
                      <Icon size={16} />
                    </span>
                    <div className="notif-item-body">
                      <p className="notif-item-title">{n.title}</p>
                      <p className="notif-item-meta">
                        {n.metadata?.serviceCode && <strong>{n.metadata.serviceCode}</strong>}
                        {n.metadata?.serviceCode && n.metadata?.customerName && ' · '}
                        {n.metadata?.customerName}
                      </p>
                      {n.metadata?.customerMessage && (
                        <p className="notif-item-msg">"{n.metadata.customerMessage}"</p>
                      )}
                      <time className="notif-item-time">{formatTime(n.createdAt)}</time>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
