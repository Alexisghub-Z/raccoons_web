import { useState, useEffect } from 'react';
import { Wrench, CheckCircle, Users, AlertCircle, Clock, Bike, Activity, Zap, ChevronRight, ShieldCheck, ShieldX, ShieldAlert, MessageSquare } from 'lucide-react';
import { serviceService } from '../../api/service.service';
import './DashboardView.css';

const STATUS_META = {
  RECEIVED:         { label: 'Recibido',    color: '#6b7280', bg: '#f3f4f6',   step: 1 },
  IN_DIAGNOSIS:     { label: 'Diagnóstico', color: '#f59e0b', bg: '#fffbeb',   step: 2 },
  IN_REPAIR:        { label: 'Reparación',  color: '#3b82f6', bg: '#eff6ff',   step: 3 },
  READY_FOR_PICKUP: { label: 'Listo',       color: '#10b981', bg: '#ecfdf5',   step: 4 },
  DELIVERED:        { label: 'Entregado',   color: '#8b5cf6', bg: '#f5f3ff',   step: 5 },
  CANCELLED:        { label: 'Cancelado',   color: '#ef4444', bg: '#fef2f2',   step: 0 },
};

const FLOW_STEPS = ['RECEIVED', 'IN_DIAGNOSIS', 'IN_REPAIR', 'READY_FOR_PICKUP', 'DELIVERED'];

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.RECEIVED;
  return (
    <span className="db-status-badge" style={{ '--badge-color': meta.color, '--badge-bg': meta.bg }}>
      <span className="db-status-dot" style={{ background: meta.color }} />
      {meta.label}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="db-card db-skeleton-card">
      <div className="db-skel db-skel--icon" />
      <div className="db-skel db-skel--value" />
      <div className="db-skel db-skel--label" />
    </div>
  );
}

function MetricCard({ icon, label, value, color, bg, urgent, delay }) {
  return (
    <div
      className="db-card db-metric-card"
      style={{ animationDelay: delay, '--metric-color': color, '--metric-bg': bg }}
    >
      <div className="db-metric-accent" style={{ background: color }} />
      <div className="db-metric-body">
        <div className="db-metric-top">
          <div className="db-metric-icon">
            {icon}
          </div>
          {urgent && (
            <span className="db-urgent-badge">
              <span className="db-pulse-dot" />
              Urgente
            </span>
          )}
        </div>
        <div className="db-metric-value">{value}</div>
        <div className="db-metric-label">{label}</div>
      </div>
    </div>
  );
}

function FlowPipeline({ flow }) {
  const total = FLOW_STEPS.reduce((sum, s) => sum + (flow[s] || 0), 0);
  const maxCount = Math.max(...FLOW_STEPS.map(s => flow[s] || 0), 1);

  return (
    <div className="db-card db-flow-card">
      <div className="db-section-header">
        <div className="db-section-title-group">
          <Activity size={16} />
          <span>Flujo del Taller</span>
        </div>
        <div className="db-flow-meta">
          {total > 0 && <span className="db-flow-total">{total} en proceso</span>}
          {flow.CANCELLED > 0 && (
            <span className="db-cancelled-pill">
              {flow.CANCELLED} cancelado{flow.CANCELLED !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Track connector line */}
      <div className="db-pipeline-track">
        <div className="db-pipeline-track-line" />
        {FLOW_STEPS.map((status, idx) => {
          const meta = STATUS_META[status];
          const count = flow[status] || 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const barPct = maxCount > 0 ? Math.max((count / maxCount) * 100, count > 0 ? 6 : 0) : 0;
          const isMax = count === maxCount && count > 0;
          const isLast = idx === FLOW_STEPS.length - 1;

          return (
            <div
              key={status}
              className={`db-flow-step ${isMax ? 'db-flow-step--peak' : ''}`}
              style={{ animationDelay: `${0.1 + idx * 0.1}s` }}
            >
              {/* Connector dot on track */}
              <div
                className="db-track-dot"
                style={{ '--dot-color': meta.color }}
              />

              {/* Step card */}
              <div className="db-step-card" style={{ '--step-color': meta.color, '--step-bg': meta.bg }}>
                {/* Top color strip */}
                <div className="db-step-strip" />

                {/* Header */}
                <div className="db-step-header">
                  <span className="db-step-num">{idx + 1}</span>
                  <span className="db-step-label">{meta.label}</span>
                </div>

                {/* Big count */}
                <div className="db-step-count">{count}</div>

                {/* Fill bar */}
                <div className="db-step-bar-track">
                  <div
                    className="db-step-bar-fill"
                    style={{ '--fill-pct': `${barPct}%` }}
                  />
                </div>

                {/* Percentage */}
                <div className="db-step-pct">
                  {pct > 0 ? `${pct}%` : '—'}
                  <span className="db-step-pct-label"> del total</span>
                </div>
              </div>

              {!isLast && (
                <div className="db-flow-chevron">
                  <ChevronRight size={14} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const AUTH_META = {
  PENDING:    { label: 'Pendiente',   color: '#F4A13A', bg: '#FEF3C7', icon: ShieldAlert },
  AUTHORIZED: { label: 'Autorizado',  color: '#10b981', bg: '#ecfdf5', icon: ShieldCheck },
  REJECTED:   { label: 'Rechazado',   color: '#ef4444', bg: '#fef2f2', icon: ShieldX },
};

function AuthorizationsBadge({ response }) {
  const meta = AUTH_META[response] || AUTH_META.PENDING;
  return (
    <span className="db-auth-badge" style={{ '--auth-color': meta.color, '--auth-bg': meta.bg }}>
      <span className="db-status-dot" style={{ background: meta.color }} />
      {meta.label}
    </span>
  );
}

function AuthorizationsPanel({ stats, items, unreadCount, onNavigate }) {
  const total = (stats.PENDING || 0) + (stats.AUTHORIZED || 0) + (stats.REJECTED || 0);

  return (
    <div className="db-card db-auth-card">
      <div className="db-section-header">
        <div className="db-section-title-group">
          <MessageSquare size={16} />
          <span>Autorizaciones de Clientes</span>
        </div>
        <div className="db-auth-header-right">
          {unreadCount > 0 && (
            <span className="db-auth-unread-badge">
              {unreadCount} sin revisar
            </span>
          )}
          {total > 0 && <span className="db-activity-count">{total} en total</span>}
        </div>
      </div>

      {/* Stats row */}
      <div className="db-auth-stats">
        {[
          { key: 'PENDING',    count: stats.PENDING    || 0 },
          { key: 'AUTHORIZED', count: stats.AUTHORIZED || 0 },
          { key: 'REJECTED',   count: stats.REJECTED   || 0 },
        ].map(({ key, count }) => {
          const meta = AUTH_META[key];
          const Icon = meta.icon;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div
              key={key}
              className="db-auth-stat"
              style={{ '--as-color': meta.color, '--as-bg': meta.bg }}
            >
              <div className="db-auth-stat-icon">
                <Icon size={16} />
              </div>
              <div className="db-auth-stat-body">
                <div className="db-auth-stat-count">{count}</div>
                <div className="db-auth-stat-label">{meta.label}</div>
              </div>
              <div className="db-auth-stat-pct">{total > 0 ? `${pct}%` : '—'}</div>
              {/* fill bar at bottom */}
              <div className="db-auth-stat-bar">
                <div
                  className="db-auth-stat-bar-fill"
                  style={{ '--as-pct': `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent list */}
      {items && items.length > 0 ? (
        <div className="db-auth-list">
          {items.map((item, idx) => {
            const meta = AUTH_META[item.response] || AUTH_META.PENDING;
            return (
              <div
                key={item.id}
                className="db-auth-row"
                style={{ animationDelay: `${0.2 + idx * 0.05}s`, '--ar-color': meta.color, cursor: 'pointer' }}
                onClick={() => onNavigate?.('SERVICES', item.service?.id)}
              >
                <div className="db-auth-row-left">
                  <span className="db-code">{item.service?.code || '—'}</span>
                  <span className="db-auth-client">
                    {item.service?.customer
                      ? `${item.service.customer.firstName} ${item.service.customer.lastName}`
                      : '—'}
                  </span>
                  <span className="db-auth-moto">{item.service?.motorcycle || ''}</span>
                </div>
                <div className="db-auth-row-question">
                  {item.question}
                </div>
                <div className="db-auth-row-right">
                  <AuthorizationsBadge response={item.response} />
                  <span className="db-time">
                    {new Date(item.updatedAt).toLocaleDateString('es-MX', {
                      day: '2-digit', month: 'short',
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="db-empty-activity" style={{ paddingTop: '1rem' }}>
          <MessageSquare size={28} />
          <p>Sin autorizaciones recientes</p>
        </div>
      )}
    </div>
  );
}

function RecentActivity({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="db-card db-activity-card">
        <div className="db-section-header">
          <div className="db-section-title-group">
            <Clock size={16} />
            <span>Actividad Reciente</span>
          </div>
        </div>
        <div className="db-empty-activity">
          <Bike size={32} />
          <p>Sin actividad reciente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="db-card db-activity-card">
      <div className="db-section-header">
        <div className="db-section-title-group">
          <Clock size={16} />
          <span>Actividad Reciente</span>
        </div>
        <span className="db-activity-count">{items.length} servicios</span>
      </div>

      <div className="db-activity-table-wrap">
        <table className="db-activity-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Cliente</th>
              <th>Motocicleta</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Actualizado</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const meta = STATUS_META[item.status] || STATUS_META.RECEIVED;
              return (
                <tr
                  key={item.id}
                  className="db-activity-row"
                  style={{
                    animationDelay: `${0.3 + idx * 0.06}s`,
                    '--row-accent': meta.color
                  }}
                >
                  <td>
                    <span className="db-code">{item.code}</span>
                  </td>
                  <td>
                    <span className="db-client-name">
                      {item.customer ? `${item.customer.firstName} ${item.customer.lastName}` : '—'}
                    </span>
                  </td>
                  <td>
                    <span className="db-moto">{item.motorcycle}</span>
                  </td>
                  <td>
                    <span className="db-service-type">{item.serviceType}</span>
                  </td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td>
                    <span className="db-time">
                      {new Date(item.updatedAt).toLocaleDateString('es-MX', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DashboardView({ isAuthenticated, unreadCount = 0, onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const result = await serviceService.getDashboard();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="db-root">
        <div className="db-header db-header--skeleton">
          <div className="db-skel db-skel--title" />
          <div className="db-skel db-skel--subtitle" />
        </div>
        <div className="db-metrics-grid">
          {[0,1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
        <div className="db-skel db-skel--block" style={{ height: 220, borderRadius: 12 }} />
        <div className="db-skel db-skel--block" style={{ height: 280, borderRadius: 12 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="db-root">
        <div className="db-error">
          <AlertCircle size={24} />
          <p>Error al cargar el dashboard: {error}</p>
        </div>
      </div>
    );
  }

  const { summary, flow, authorizationStats, recentAuthorizations, recentActivity } = data;
  const hasPendingAuth = summary.pendingAuthorizations > 0;

  return (
    <div className="db-root">
      {/* Header */}
      <div className="db-header">
        <div>
          <h1 className="db-title">
            <Zap size={20} className="db-title-icon" />
            Dashboard
          </h1>
          <p className="db-subtitle">Estado operacional del taller — actualizado ahora</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="db-metrics-grid">
        <MetricCard
          icon={<Wrench size={20} />}
          label="Servicios activos"
          value={summary.activeServices}
          color="#36B76B"
          bg="#D4F1E0"
          delay="0.05s"
        />
        <MetricCard
          icon={<CheckCircle size={20} />}
          label="Entregados esta semana"
          value={summary.deliveredThisWeek}
          color="#3b82f6"
          bg="#eff6ff"
          delay="0.10s"
        />
        <MetricCard
          icon={<Users size={20} />}
          label="Clientes este mes"
          value={summary.customersThisMonth}
          color="#8b5cf6"
          bg="#f5f3ff"
          delay="0.15s"
        />
        <MetricCard
          icon={<AlertCircle size={20} />}
          label="Autorizaciones pendientes"
          value={summary.pendingAuthorizations}
          color={hasPendingAuth ? '#F4A13A' : '#9CA3AF'}
          bg={hasPendingAuth ? '#FEF3C7' : '#F9FAFB'}
          urgent={hasPendingAuth}
          delay="0.20s"
        />
      </div>

      {/* Authorizations Panel */}
      <div style={{ animationDelay: '0.25s' }} className="db-animate-section">
        <AuthorizationsPanel stats={authorizationStats || {}} items={recentAuthorizations || []} unreadCount={unreadCount} onNavigate={onNavigate} />
      </div>

      {/* Flow Pipeline */}
      <div style={{ animationDelay: '0.30s' }} className="db-animate-section">
        <FlowPipeline flow={flow} />
      </div>

      {/* Recent Activity */}
      <div style={{ animationDelay: '0.35s' }} className="db-animate-section">
        <RecentActivity items={recentActivity} />
      </div>
    </div>
  );
}
