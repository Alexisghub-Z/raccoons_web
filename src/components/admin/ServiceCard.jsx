import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bike, User, Phone, Wrench, FileText, Trash2, Clock, Edit, Image as ImageIcon, FileText as FilePdfIcon, ChevronRight, ChevronLeft, XCircle, Check, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [statusNotes, setStatusNotes] = useState('');
  const [evidences, setEvidences] = useState([]);
  const [loadingEvidences, setLoadingEvidences] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      loadEvidences();
    }
  }, [isExpanded, service.id]);

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

  const handleDelete = (e) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar el servicio ${service.code}?`
    );
    if (confirmDelete) {
      onDelete(service.id);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowEditModal(true);
  };

  const handleSaveEdit = async (serviceId, formData) => {
    await onUpdate(serviceId, formData);
    setShowEditModal(false);
  };

  const clientName = service.customer
    ? `${service.customer.firstName} ${service.customer.lastName}`
    : 'Cliente Desconocido';

  const clientPhone = service.customer?.phone || '';

  // Calcular posición actual en el flujo
  const isCancelled = service.status === 'CANCELLED';
  const currentStepIndex = STATUS_FLOW.findIndex(s => s.value === service.status);
  const nextStep = currentStepIndex < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentStepIndex + 1] : null;
  const prevStep = currentStepIndex > 0 ? STATUS_FLOW[currentStepIndex - 1] : null;

  const createdDate = new Date(service.createdAt).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <>
      <div className={`service-row ${isCancelled ? 'service-row--cancelled' : ''} ${isExpanded ? 'service-row--expanded' : ''}`}>
        {/* Fila principal - clickeable para expandir */}
        <div className="service-row-main" onClick={() => setIsExpanded(!isExpanded)}>
          {/* Indicador de color por estado */}
          <div
            className="service-row-indicator"
            style={{ backgroundColor: isCancelled ? '#ef4444' : (STATUS_FLOW[currentStepIndex]?.color || '#6b7280') }}
          />

          {/* Código */}
          <div className="service-row-code">
            <span className="row-code">{service.code}</span>
            <span className="row-date">{createdDate}</span>
          </div>

          {/* Cliente */}
          <div className="service-row-client">
            <User size={15} className="row-icon" />
            <div className="row-client-info">
              <span className="row-client-name">{clientName}</span>
              {clientPhone && <span className="row-client-phone">{clientPhone}</span>}
            </div>
          </div>

          {/* Moto */}
          <div className="service-row-moto">
            <Bike size={15} className="row-icon" />
            <span>{service.motorcycle}</span>
          </div>

          {/* Tipo de servicio */}
          <div className="service-row-type">
            <Wrench size={15} className="row-icon" />
            <span>{service.serviceType}</span>
          </div>

          {/* Estado */}
          <div className="service-row-status">
            <StatusBadge status={service.status} size="small" />
          </div>

          {/* Acciones rápidas */}
          <div className="service-row-actions" onClick={(e) => e.stopPropagation()}>
            <button className="row-action-btn row-action-edit" onClick={handleEdit} title="Editar">
              <Edit size={15} />
            </button>
            <button className="row-action-btn row-action-delete" onClick={handleDelete} title="Eliminar">
              <Trash2 size={15} />
            </button>
            <button className="row-expand-btn" onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}>
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>

        {/* Panel expandido */}
        {isExpanded && (
          <div className="service-row-detail">
            {/* Notas */}
            {service.notes && (
              <div className="detail-notes">
                <FileText size={15} />
                <span>{service.notes}</span>
              </div>
            )}

            {/* Stepper de progreso */}
            {!isCancelled ? (
              <div className="detail-stepper">
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

                <div className="detail-status-actions">
                  {prevStep && (
                    <button
                      className="status-action-btn status-action-btn--prev"
                      onClick={() => handleStepClick(prevStep.value)}
                      disabled={isChangingStatus}
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
                >
                  Reactivar
                </button>
              </div>
            )}

            {/* Evidencias */}
            {evidences.length > 0 && (
              <div className="detail-evidences">
                <h4 className="evidences-title">
                  <ImageIcon size={16} />
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
          </div>
        )}
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
