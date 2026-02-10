import {
  PackageCheck,
  Search,
  Wrench,
  CheckCircle2,
  PackageOpen,
  XCircle
} from 'lucide-react';
import './StatusBadge.css';

const STATUS_CONFIG = {
  RECEIVED: {
    label: 'Recibido',
    color: '#3b82f6',
    bgColor: '#dbeafe',
    Icon: PackageCheck
  },
  IN_DIAGNOSIS: {
    label: 'En Diagnóstico',
    color: '#eab308',
    bgColor: '#fef9c3',
    Icon: Search
  },
  IN_REPAIR: {
    label: 'En Reparación',
    color: '#f97316',
    bgColor: '#ffedd5',
    Icon: Wrench
  },
  READY_FOR_PICKUP: {
    label: 'Listo para Entrega',
    color: '#22c55e',
    bgColor: '#dcfce7',
    Icon: CheckCircle2
  },
  DELIVERED: {
    label: 'Entregado',
    color: '#6b7280',
    bgColor: '#f3f4f6',
    Icon: PackageOpen
  },
  CANCELLED: {
    label: 'Cancelado',
    color: '#ef4444',
    bgColor: '#fee2e2',
    Icon: XCircle
  }
};

function StatusBadge({ status, size = 'medium' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.RECEIVED;
  const IconComponent = config.Icon;

  return (
    <span
      className={`status-badge status-badge-${size}`}
      style={{
        color: config.color,
        backgroundColor: config.bgColor,
        borderColor: config.color
      }}
    >
      <IconComponent className="status-badge-icon" size={size === 'small' ? 14 : 16} />
      <span className="status-badge-label">{config.label}</span>
    </span>
  );
}

export default StatusBadge;
