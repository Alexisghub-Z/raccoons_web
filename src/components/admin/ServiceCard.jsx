import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bike, User, Phone, Wrench, FileText, Trash2, Clock, Edit, Image as ImageIcon, FileText as FilePdfIcon } from 'lucide-react';
import StatusBadge from './StatusBadge';
import EvidenceUpload from './EvidenceUpload';
import ServiceEditModal from './ServiceEditModal';
import { serviceService } from '../../api/service.service';
import './ServiceCard.css';

const STATUS_OPTIONS = [
  { value: 'RECEIVED', label: 'Recibido' },
  { value: 'IN_DIAGNOSIS', label: 'En Diagnóstico' },
  { value: 'IN_REPAIR', label: 'En Reparación' },
  { value: 'READY_FOR_PICKUP', label: 'Listo para Entrega' },
  { value: 'DELIVERED', label: 'Entregado' },
  { value: 'CANCELLED', label: 'Cancelado' }
];

function ServiceCard({ service, onStatusChange, onDelete, onUpdate }) {
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [statusNotes, setStatusNotes] = useState('');
  const [evidences, setEvidences] = useState([]);
  const [loadingEvidences, setLoadingEvidences] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Cargar evidencias cuando el componente se monta
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
    // Recargar solo las evidencias, NO toda la página
    loadEvidences();
  };

  const handleDeleteEvidence = async (evidenceId) => {
    const confirmDelete = window.confirm('¿Estás seguro de eliminar esta evidencia?');
    if (!confirmDelete) return;

    try {
      await serviceService.deleteEvidence(service.id, evidenceId);
      // Recargar evidencias después de eliminar
      loadEvidences();
    } catch (error) {
      console.error('Error deleting evidence:', error);
      alert('Error al eliminar la evidencia: ' + error.message);
    }
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    if (newStatus === service.status) return;

    setSelectedStatus(newStatus);
    setStatusNotes('');
    setShowNotesModal(true);
    e.target.value = service.status; // Resetear el select
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

  // Obtener nombre del cliente
  const clientName = service.customer
    ? `${service.customer.firstName} ${service.customer.lastName}`
    : 'Cliente Desconocido';

  const clientPhone = service.customer?.phone || 'Sin teléfono';

  return (
    <>
      <div className="service-card">
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

      {/* Mostrar evidencias existentes */}
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

      {/* Upload de evidencias - solo para servicios en reparación o listos para entrega */}
      {(service.status === 'IN_REPAIR' || service.status === 'READY_FOR_PICKUP') && (
        <EvidenceUpload
          serviceId={service.id}
          onUploadSuccess={handleEvidenceUploadSuccess}
        />
      )}

      <div className="service-card-footer">
        <div className="status-selector">
          <label htmlFor={`status-${service.id}`}>Cambiar Estado:</label>
          <select
            id={`status-${service.id}`}
            value={service.status}
            onChange={handleStatusChange}
            disabled={isChangingStatus}
            className="status-select"
          >
            {STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {isChangingStatus && <Clock className="loading-spinner" size={16} />}
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

      <div className="service-card-date">
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

      </div>

      {/* Modal de notas para cambio de estado - renderizado con Portal */}
      {showNotesModal && createPortal(
        <div className="notes-modal-overlay" onClick={cancelStatusChange}>
          <div className="notes-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Cambiar a: {STATUS_OPTIONS.find(s => s.value === selectedStatus)?.label}</h3>
            <p className="notes-hint">Agregar comentarios o notas sobre este cambio de estado (opcional)</p>
            <textarea
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Ej: Pieza reemplazada, trabajo completado, etc..."
              rows="4"
              className="notes-textarea"
              autoFocus
            />
            <div className="notes-modal-actions">
              <button onClick={cancelStatusChange} className="btn-cancel">
                Cancelar
              </button>
              <button onClick={confirmStatusChange} className="btn-confirm">
                Confirmar Cambio
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de edición de servicio */}
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
