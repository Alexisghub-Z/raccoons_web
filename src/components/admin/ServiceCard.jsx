import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bike, User, Phone, Wrench, FileText, Trash2, Clock, Edit, Image as ImageIcon, FileText as FilePdfIcon, ChevronRight, ChevronLeft, XCircle, Check, AlertCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';
import EvidenceUpload from './EvidenceUpload';
import ServiceEditModal from './ServiceEditModal';
import { serviceService } from '../../api/service.service';
import './ServiceCard.css';

// Flujo principal de estados en orden
const STATUS_FLOW = [
  { value: 'RECEIVED',         label: 'Recibido',           shortLabel: 'Recibido',    icon: '📥', color: '#6b7280' },
  { value: 'IN_DIAGNOSIS',     label: 'En Diagnóstico',     shortLabel: 'Diagnóstico', icon: '🔍', color: '#f59e0b' },
  { value: 'IN_REPAIR',        label: 'En Reparación',      shortLabel: 'Reparación',  icon: '🔧', color: '#3b82f6' },
  { value: 'READY_FOR_PICKUP', label: 'Listo para Entrega', shortLabel: 'Listo',       icon: '✅', color: '#10b981' },
  { value: 'DELIVERED',        label: 'Entregado',          shortLabel: 'Entregado',   icon: '🏍️', color: '#8b5cf6' },
];

function ServiceCard({ service, onStatusChange, onDelete, onUpdate }) {
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [statusNotes, setStatusNotes] = useState('');
  const [evidences, setEvidences] = useState([]);
  const [loadingEvidences, setLoadingEvidences] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadEvidences();
  }, [service.id]);

  const loadEvidences = async () => {
    try {
      setLoadingEvidences(true);
      const data = await serviceService.getEvidence(service.id);
      setEvidences(data);
    } catch (error) {
      console.error('Error loading evidences:', error);
      setEvidences([]);
    } finally {
      setLoadingEvidences(false);
    }
  };

  const handleEvidenceUploadSuccess = () => {
    loadEvidences();
  };

  const handleDeleteEvidence = async (evidenceId) => {
    const confirmDelete = window.confirm('¿Estás seguro de eliminar esta evidencia?');
    if (!confirmDelete) return;

    try {
      await serviceService.deleteEvidence(service.id, evidenceId);
      loadEvidences();
    } catch (error) {
      console.error('Error deleting evidence:', error);
      alert('Error al eliminar la evidencia: ' + error.message);
    }
  };

  const confirmStatusChange = async () => {
    setShowNotesModal(false);
    setIsChangingStatus(true);
    try {
      await onStatusChange(service.id, selectedStatus, statusNotes);
    } finally {
      setIsChangingStatus(false);
      setSelectedStatus(null);
      setStatusNotes('');
    }
  };

  const cancelStatusChange = () => {
    setShowNotesModal(false);
    setSelectedStatus(null);
    setStatusNotes('');
  };

  const handleStepClick = (statusValue) => {
    if (statusValue === service.status || isChangingStatus) return;
    setSelectedStatus(statusValue);
    setStatusNotes('');
    setShowNotesModal(true);
  };

  const handleCancelService = () => {
    setSelectedStatus('CANCELLED');
    setStatusNotes('');
    setShowNotesModal(true);
  };

  const handleDelete = () => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar el servicio ${service.code}?`
    );
    if (confirmDelete) {
      onDelete(service.id);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleSaveEdit = async (serviceId, formData) => {
    await onUpdate(serviceId, formData);
    setShowEditModal(false);
  };

  const clientName = service.customer
    ? `${service.customer.firstName} ${service.customer.lastName}`
    : 'Cliente Desconocido';

  const clientPhone = service.customer?.phone || 'Sin teléfono';

  // Calcular posición actual en el flujo
  const isCancelled = service.status === 'CANCELLED';
  const currentStepIndex = STATUS_FLOW.findIndex(s => s.value === service.status);
  const nextStep = currentStepIndex < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentStepIndex + 1] : null;
  const prevStep = currentStepIndex > 0 ? STATUS_FLOW[currentStepIndex - 1] : null;

  return (
    <>
      <div className={`service-card ${isCancelled ? 'service-card--cancelled' : ''}`}>
        <div className="service-card-header">
          <div className="service-card-code">
            <span className="code-label">Código:</span>
            <span className="code-value">{service.code}</span>
          </div>
          <StatusBadge status={service.status} size="small" />
        </div>

        <div className="service-card-body">
          <div className="service-info-row">
            <Bike className="info-icon" size={18} />
            <div className="info-content">
              <span className="info-label">Motocicleta</span>
              <span className="info-value">{service.motorcycle}</span>
            </div>
          </div>

          <div className="service-info-row">
            <User className="info-icon" size={18} />
            <div className="info-content">
              <span className="info-label">Cliente</span>
              <span className="info-value">{clientName}</span>
            </div>
          </div>

          <div className="service-info-row">
            <Phone className="info-icon" size={18} />
            <div className="info-content">
              <span className="info-label">Teléfono</span>
              <span className="info-value">{clientPhone}</span>
            </div>
          </div>

          <div className="service-info-row">
            <Wrench className="info-icon" size={18} />
            <div className="info-content">
              <span className="info-label">Tipo de Servicio</span>
              <span className="info-value">{service.serviceType}</span>
            </div>
          </div>

          {service.notes && (
            <div className="service-notes">
              <FileText className="info-icon" size={18} />
              <span className="notes-text">{service.notes}</span>
            </div>
          )}
        </div>

        {/* Stepper de progreso */}
        {!isCancelled ? (
          <div className="status-stepper">
            <div className="stepper-track">
              {STATUS_FLOW.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isFuture = index > currentStepIndex;

                return (
                  <div key={step.value} className="stepper-item">
                    <button
                      className={`stepper-dot ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isFuture ? 'future' : ''}`}
                      onClick={() => !isCurrent && handleStepClick(step.value)}
                      disabled={isCurrent || isChangingStatus}
                      title={isCurrent ? step.label : `Cambiar a: ${step.label}`}
                    >
                      {isCompleted ? <Check size={12} /> : <span className="stepper-dot-num">{index + 1}</span>}
                    </button>
                    <span className={`stepper-label ${isCurrent ? 'stepper-label--current' : ''}`}>
                      {step.shortLabel}
                    </span>
                    {index < STATUS_FLOW.length - 1 && (
                      <div className={`stepper-line ${isCompleted ? 'completed' : ''}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Botones de acción de estado */}
            <div className="status-actions">
              {prevStep && (
                <button
                  className="status-action-btn status-action-btn--prev"
                  onClick={() => handleStepClick(prevStep.value)}
                  disabled={isChangingStatus}
                  title={`Retroceder a: ${prevStep.label}`}
                >
                  <ChevronLeft size={16} />
                  {prevStep.shortLabel}
                </button>
              )}

              {nextStep && (
                <button
                  className="status-action-btn status-action-btn--next"
                  onClick={() => handleStepClick(nextStep.value)}
                  disabled={isChangingStatus}
                  title={`Avanzar a: ${nextStep.label}`}
                >
                  {isChangingStatus ? (
                    <Clock size={16} className="spinning" />
                  ) : (
                    <>
                      Avanzar a {nextStep.shortLabel}
                      <ChevronRight size={16} />
                    </>
                  )}
                </button>
              )}

              {service.status !== 'DELIVERED' && (
                <button
                  className="status-action-btn status-action-btn--cancel"
                  onClick={handleCancelService}
                  disabled={isChangingStatus}
                  title="Cancelar servicio"
                >
                  <XCircle size={16} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="status-cancelled-banner">
            <AlertCircle size={18} />
            <span>Servicio Cancelado</span>
            <button
              className="status-action-btn status-action-btn--restore"
              onClick={() => handleStepClick('RECEIVED')}
              disabled={isChangingStatus}
              title="Reactivar servicio"
            >
              Reactivar
            </button>
          </div>
        )}

        {/* Evidencias */}
        {evidences.length > 0 && (
          <div className="service-evidences">
            <h4 className="evidences-title">
              <ImageIcon size={18} />
              Evidencias ({evidences.length})
            </h4>
            <div className="evidences-grid">
              {evidences.map((evidence, index) => (
                <div key={evidence.id || index} className="evidence-item">
                  <button
                    className="evidence-delete-btn"
                    onClick={() => handleDeleteEvidence(evidence.id)}
                    title="Eliminar evidencia"
                  >
                    <Trash2 size={14} />
                  </button>
                  {evidence.type === 'IMAGE' ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'}${evidence.url}`}
                      alt={evidence.description || 'Evidencia'}
                      className="evidence-image"
                      onClick={() => window.open(`${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'}${evidence.url}`, '_blank')}
                    />
                  ) : (
                    <a
                      href={`${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'}${evidence.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="evidence-pdf"
                    >
                      <FilePdfIcon size={24} />
                      <span>PDF</span>
                    </a>
                  )}
                  {evidence.description && (
                    <p className="evidence-description">{evidence.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {(service.status === 'IN_REPAIR' || service.status === 'READY_FOR_PICKUP') && (
          <EvidenceUpload
            serviceId={service.id}
            onUploadSuccess={handleEvidenceUploadSuccess}
          />
        )}

        <div className="service-card-footer">
          <div className="service-card-date">
            <Clock size={14} />
            <span className="date-label">Creado:</span>
            <span className="date-value">
              {new Date(service.createdAt).toLocaleDateString('es-MX', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>

          <div className="card-actions">
            <button
              className="edit-btn"
              onClick={handleEdit}
              title="Editar servicio"
            >
              <Edit size={18} />
            </button>
            <button
              className="delete-btn"
              onClick={handleDelete}
              title="Eliminar servicio"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de notas */}
      {showNotesModal && createPortal(
        <div className="notes-modal-overlay" onClick={cancelStatusChange}>
          <div className="notes-modal" onClick={(e) => e.stopPropagation()}>
            <div className="notes-modal-header">
              <span className="notes-modal-icon">
                {selectedStatus === 'CANCELLED' ? '❌' :
                  STATUS_FLOW.find(s => s.value === selectedStatus)?.icon}
              </span>
              <div>
                <h3>
                  {selectedStatus === 'CANCELLED' ? 'Cancelar servicio' :
                    `→ ${STATUS_FLOW.find(s => s.value === selectedStatus)?.label}`}
                </h3>
                <p className="notes-hint">Agrega una nota sobre este cambio (opcional)</p>
              </div>
            </div>
            <textarea
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Ej: Pieza reemplazada, trabajo completado..."
              rows="3"
              className="notes-textarea"
              autoFocus
            />
            <div className="notes-modal-actions">
              <button onClick={cancelStatusChange} className="btn-cancel">
                Cancelar
              </button>
              <button
                onClick={confirmStatusChange}
                className={`btn-confirm ${selectedStatus === 'CANCELLED' ? 'btn-confirm--danger' : ''}`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ServiceEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        service={service}
        onSave={handleSaveEdit}
      />
    </>
  );
}

export default ServiceCard;
