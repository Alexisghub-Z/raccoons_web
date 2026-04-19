import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bike, User, Phone, Wrench, FileText, Trash2, Clock, Edit, Image as ImageIcon, FileText as FilePdfIcon, ChevronRight, ChevronLeft, XCircle, Check, AlertCircle, ChevronDown, ChevronUp, MessageSquare, Copy, Send, Paperclip, X, Loader2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import EvidenceUpload from './EvidenceUpload';
import ServiceEditModal from './ServiceEditModal';
import { serviceService } from '../../api/service.service';
import { sendTrackingCodeWhatsApp, buildTrackingMessage } from '../../services/whatsappService';
import AuthorizationQuestionForm from './AuthorizationQuestionForm';
import { useToast } from './toast-context';
import { useConfirm } from '../../hooks/useConfirm';
import './ServiceCard.css';

// Flujo principal de estados en orden
const STATUS_FLOW = [
  { value: 'RECEIVED',         label: 'Recibido',           shortLabel: 'Recibido',    icon: '📥', color: '#6b7280' },
  { value: 'IN_DIAGNOSIS',     label: 'En Diagnóstico',     shortLabel: 'Diagnóstico', icon: '🔍', color: '#f59e0b' },
  { value: 'IN_REPAIR',        label: 'En Reparación',      shortLabel: 'Reparación',  icon: '🔧', color: '#3b82f6' },
  { value: 'READY_FOR_PICKUP', label: 'Listo para Entrega', shortLabel: 'Listo',       icon: '✅', color: '#10b981' },
  { value: 'DELIVERED',        label: 'Entregado',          shortLabel: 'Entregado',   icon: '🏍️', color: '#8b5cf6' },
];

function ServiceCard({ service, onStatusChange, onDelete, onUpdate, defaultExpanded, onExpanded }) {
  const { showToast } = useToast();
  const { confirm, ConfirmElement } = useConfirm();
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef(null);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [statusNotes, setStatusNotes] = useState('');
  const [evidences, setEvidences] = useState([]);
  const [loadingEvidences, setLoadingEvidences] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAuthQuestionForm, setShowAuthQuestionForm] = useState(false);
  const [authQuestions, setAuthQuestions] = useState(service.authorizationQuestions || []);
  const [replyTexts, setReplyTexts] = useState({});
  const [respondingQuestionId, setRespondingQuestionId] = useState(null);
  const [replyingQuestionId, setReplyingQuestionId] = useState(null);
  const [uploadingQuestionId, setUploadingQuestionId] = useState(null);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState(null);

  useEffect(() => {
    setAuthQuestions(service.authorizationQuestions || []);
  }, [service.authorizationQuestions]);

  useEffect(() => {
    if (defaultExpanded) {
      setIsExpanded(true);
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        onExpanded?.();
      }, 100);
    }
  }, [defaultExpanded]);

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
    const confirmed = await confirm({
      title: 'Eliminar evidencia',
      message: '¿Estás seguro de eliminar esta evidencia?',
      confirmText: 'Eliminar evidencia',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      await serviceService.deleteEvidence(service.id, evidenceId);
      loadEvidences();
    } catch (error) {
      console.error('Error deleting evidence:', error);
      showToast('Error al eliminar la evidencia: ' + error.message, 'error');
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

  const handleDelete = async (e) => {
    e.stopPropagation();
    const confirmed = await confirm({
      title: 'Eliminar servicio',
      message: `¿Estás seguro de eliminar el servicio ${service.code}?`,
      confirmText: 'Eliminar servicio',
      variant: 'danger',
    });
    if (confirmed) {
      onDelete(service.id);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowEditModal(true);
  };

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    if (!clientPhone) {
      showToast('Este cliente no tiene número de teléfono registrado', 'warning');
      return;
    }
    sendTrackingCodeWhatsApp(clientPhone, service.code, service.customer.firstName, service.motorcycle, service.serviceType);
  };

  const handleCopyMessage = async (e) => {
    e.stopPropagation();
    const message = buildTrackingMessage(
      service.customer?.firstName || 'Cliente',
      service.motorcycle,
      service.code,
      service.serviceType
    );
    try {
      await navigator.clipboard.writeText(message);
      showToast('Mensaje copiado al portapapeles', 'success', 1500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = message;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('Mensaje copiado al portapapeles', 'success', 1500);
    }
  };

  const handleSaveEdit = async (serviceId, formData) => {
    await onUpdate(serviceId, formData);
    setShowEditModal(false);
  };

  const handleCreateAuthQuestion = async (questionText) => {
    try {
      const result = await serviceService.createAuthorizationQuestion(service.id, questionText);
      setShowAuthQuestionForm(false);
      if (result) {
        setAuthQuestions(prev => [result, ...prev]);
      }
    } catch (error) {
      showToast('Error al crear pregunta: ' + error.message, 'error');
    }
  };

  const handleRespondAuthQuestion = async (questionId, response) => {
    setRespondingQuestionId(questionId);
    try {
      await serviceService.respondAuthorizationQuestion(questionId, response);
      setAuthQuestions(prev => prev.map(q =>
        q.id === questionId
          ? { ...q, response, respondedAt: new Date().toISOString() }
          : q
      ));
    } catch (error) {
      showToast('Error al responder: ' + error.message, 'error');
    } finally {
      setRespondingQuestionId(null);
    }
  };

  const handleReplyAuthQuestion = async (questionId) => {
    const text = replyTexts[questionId]?.trim();
    if (!text) return;
    setReplyingQuestionId(questionId);
    try {
      await serviceService.replyAuthorizationQuestion(questionId, text);
      setAuthQuestions(prev => prev.map(q =>
        q.id === questionId ? { ...q, adminMessage: text } : q
      ));
      setReplyTexts(prev => ({ ...prev, [questionId]: '' }));
    } catch (error) {
      showToast('Error al enviar mensaje: ' + error.message, 'error');
    } finally {
      setReplyingQuestionId(null);
    }
  };

  const handleUploadAttachments = async (questionId, files) => {
    setUploadingQuestionId(questionId);
    try {
      const result = await serviceService.uploadAuthAttachments(questionId, files);
      if (result) {
        setAuthQuestions(prev => prev.map(q =>
          q.id === questionId ? { ...q, attachments: result.attachments || [] } : q
        ));
      }
    } catch (error) {
      showToast('Error al subir archivos: ' + error.message, 'error');
    } finally {
      setUploadingQuestionId(null);
    }
  };

  const handleDeleteAttachment = async (questionId, attachmentId) => {
    setDeletingAttachmentId(attachmentId);
    try {
      await serviceService.deleteAuthAttachment(attachmentId);
      setAuthQuestions(prev => prev.map(q =>
        q.id === questionId
          ? { ...q, attachments: (q.attachments || []).filter(a => a.id !== attachmentId) }
          : q
      ));
    } catch (error) {
      showToast('Error al eliminar archivo: ' + error.message, 'error');
    } finally {
      setDeletingAttachmentId(null);
    }
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
      <div ref={cardRef} className={`service-row ${isCancelled ? 'service-row--cancelled' : ''} ${isExpanded ? 'service-row--expanded' : ''}`}>
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
            <button className="row-action-btn row-action-whatsapp" onClick={handleWhatsApp} title="Enviar codigo por WhatsApp">
              <MessageSquare size={15} />
            </button>
            <button className="row-action-btn row-action-copy" onClick={handleCopyMessage} title="Copiar mensaje de seguimiento">
              <Copy size={15} />
            </button>
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

            {/* Historial unificado: notas + autorizaciones por etapa */}
            {(() => {
              const apiBase = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';

              const getStatusAtTime = (timestamp) => {
                const sorted = [...(service.statusHistory || [])].sort(
                  (a, b) => new Date(a.changedAt) - new Date(b.changedAt)
                );
                let active = sorted[0]?.status || 'RECEIVED';
                for (const entry of sorted) {
                  if (new Date(entry.changedAt) <= new Date(timestamp)) active = entry.status;
                  else break;
                }
                return active;
              };

              // Agrupar autorizaciones por etapa
              const authByStep = {};
              authQuestions?.forEach(q => {
                const step = getStatusAtTime(q.createdAt);
                if (!authByStep[step]) authByStep[step] = [];
                authByStep[step].push(q);
              });

              // Construir lista de etapas que tienen nota O autorizaciones, en orden del flujo
              const stepOrder = STATUS_FLOW.map(s => s.value);
              const relevantSteps = stepOrder.filter(stepKey => {
                const histEntry = service.statusHistory?.find(h => h.status === stepKey);
                return (histEntry?.notes) || authByStep[stepKey]?.length > 0;
              });

              if (relevantSteps.length === 0) return null;

              return (
                <div className="detail-status-notes">
                  <h4 className="detail-status-notes-title">
                    <MessageSquare size={14} />
                    Historial
                  </h4>

                  {relevantSteps.map(stepKey => {
                    const stepMeta = STATUS_FLOW.find(s => s.value === stepKey);
                    const histEntry = service.statusHistory?.find(h => h.status === stepKey);
                    const stepQuestions = authByStep[stepKey] || [];
                    const isCurrentStep = stepKey === service.status;

                    return (
                      <div key={stepKey} className="dsn-step-block" style={{ '--step-color': stepMeta?.color || '#6b7280' }}>
                        {/* Header de etapa */}
                        <div className="dsn-step-header">
                          <span className="dsn-step-dot" />
                          <span className="dsn-step-name">{stepMeta?.label || stepKey}</span>
                          {histEntry?.changedAt && (
                            <span className="dsn-step-date">
                              {new Date(histEntry.changedAt).toLocaleDateString('es-MX', {
                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          )}
                        </div>

                        {/* Nota del estado */}
                        {histEntry?.notes && (
                          <div className="dsn-note">
                            <p className="dsn-text">{histEntry.notes}</p>
                          </div>
                        )}

                        {/* Autorizaciones de esta etapa */}
                        {stepQuestions.map(q => (
                          <div key={q.id} className={`auth-q-thread ${!isCurrentStep ? 'auth-q-thread--history' : ''}`}>

                            {/* Mensajes en orden cronológico */}
                            {[
                              { type: 'admin', text: q.question, time: q.createdAt, isQuestion: true, attachments: q.attachments },
                              q.adminMessage ? { type: 'admin', text: q.adminMessage, time: q.adminMessageAt || q.updatedAt } : null,
                              q.customerMessage ? { type: 'customer', text: q.customerMessage, time: q.respondedAt } : null,
                            ].filter(Boolean).sort((a, b) => new Date(a.time) - new Date(b.time)).map((msg, idx) => (
                              msg.type === 'admin' ? (
                                <div key={idx} className="auth-q-msg auth-q-msg--admin">
                                  <span className="auth-q-msg-label">Taller</span>
                                  <p className="auth-q-msg-text">{msg.text}</p>
                                  {msg.isQuestion && msg.attachments?.length > 0 && (
                                    <div className="auth-q-attachments">
                                      {msg.attachments.map(a => (
                                        <div key={a.id} className="auth-q-attachment">
                                          {a.type === 'IMAGE' ? (
                                            <img src={`${apiBase}${a.url}`} alt={a.filename} className="auth-q-attachment-img"
                                              onClick={() => window.open(`${apiBase}${a.url}`, '_blank')} />
                                          ) : (
                                            <a href={`${apiBase}${a.url}`} target="_blank" rel="noopener noreferrer" className="auth-q-attachment-pdf">
                                              <FilePdfIcon size={14} /><span>{a.filename}</span>
                                            </a>
                                          )}
                                          {isCurrentStep && (
                                            <button className="auth-q-attachment-delete"
                                              onClick={() => handleDeleteAttachment(q.id, a.id)}
                                              disabled={deletingAttachmentId === a.id} title="Eliminar">
                                              {deletingAttachmentId === a.id ? <Loader2 size={10} className="spinning" /> : <X size={10} />}
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  <span className="auth-q-msg-time">{new Date(msg.time).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              ) : (
                                <div key={idx} className="auth-q-msg auth-q-msg--customer">
                                  <span className="auth-q-msg-label">Cliente</span>
                                  <p className="auth-q-msg-text">{msg.text}</p>
                                  {msg.time && <span className="auth-q-msg-time">{new Date(msg.time).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>}
                                </div>
                              )
                            ))}

                            {/* Badge de estado */}
                            <span className={`auth-q-badge auth-q-badge--${(q.response || 'pending').toLowerCase()}`}>
                              {q.response === 'PENDING' && 'Pendiente'}
                              {q.response === 'AUTHORIZED' && 'Autorizado'}
                              {q.response === 'REJECTED' && 'No autorizado'}
                              {q.response === 'WHATSAPP_CONTACT' && 'Solicitó contacto'}
                            </span>

                            {/* Toolbar */}
                            {isCurrentStep && (
                              <div className="auth-q-toolbar">
                                {!q.adminMessage && (
                                  <>
                                    <input
                                      type="text"
                                      className="auth-q-reply-input"
                                      placeholder="Responder al cliente..."
                                      value={replyTexts[q.id] || ''}
                                      onChange={(e) => setReplyTexts(prev => ({ ...prev, [q.id]: e.target.value }))}
                                      maxLength={500}
                                      disabled={replyingQuestionId === q.id}
                                      onKeyDown={(e) => e.key === 'Enter' && handleReplyAuthQuestion(q.id)}
                                    />
                                    <button className="auth-q-toolbar-btn auth-q-toolbar-btn--send"
                                      onClick={() => handleReplyAuthQuestion(q.id)}
                                      disabled={!replyTexts[q.id]?.trim() || replyingQuestionId === q.id} title="Enviar">
                                      {replyingQuestionId === q.id
                                        ? <Loader2 size={13} className="spinning" />
                                        : <Send size={13} />}
                                    </button>
                                  </>
                                )}
                                <label className={`auth-q-toolbar-btn auth-q-toolbar-btn--attach ${uploadingQuestionId === q.id ? 'is-loading' : ''}`} title="Adjuntar">
                                  {uploadingQuestionId === q.id
                                    ? <Loader2 size={13} className="spinning" />
                                    : <Paperclip size={13} />}
                                  <input type="file" multiple accept="image/*,application/pdf" style={{ display: 'none' }}
                                    disabled={uploadingQuestionId === q.id}
                                    onChange={(e) => {
                                      const files = Array.from(e.target.files);
                                      if (files.length > 0) handleUploadAttachments(q.id, files);
                                      e.target.value = '';
                                    }} />
                                </label>
                                {q.response === 'PENDING' && (
                                  <>
                                    <button className="auth-q-toolbar-btn auth-q-toolbar-btn--authorize"
                                      onClick={() => handleRespondAuthQuestion(q.id, 'AUTHORIZED')}
                                      disabled={respondingQuestionId === q.id}
                                      title="Autorizar">
                                      {respondingQuestionId === q.id
                                        ? <Loader2 size={13} className="spinning" />
                                        : <Check size={13} />}
                                    </button>
                                    <button className="auth-q-toolbar-btn auth-q-toolbar-btn--reject"
                                      onClick={() => handleRespondAuthQuestion(q.id, 'REJECTED')}
                                      disabled={respondingQuestionId === q.id}
                                      title="Rechazar">
                                      <XCircle size={13} />
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Boton solicitar autorizacion */}
            {!isCancelled && service.status !== 'DELIVERED' && (
              <button
                className="auth-question-trigger-btn"
                onClick={() => setShowAuthQuestionForm(true)}
              >
                <AlertCircle size={15} />
                Solicitar autorizacion al cliente
              </button>
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
            {loadingEvidences && evidences.length === 0 && (
              <div className="detail-evidences">
                <h4 className="evidences-title">
                  <ImageIcon size={16} />
                  Evidencias
                </h4>
                <div className="evidences-grid">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="evidence-item evidence-item--skeleton" />
                  ))}
                </div>
              </div>
            )}

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
                        <Trash2 size={14} aria-hidden="true" />
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

            {service.status !== 'CANCELLED' && (
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

      {showAuthQuestionForm && (
        <AuthorizationQuestionForm
          onSubmit={handleCreateAuthQuestion}
          onCancel={() => setShowAuthQuestionForm(false)}
        />
      )}

      {ConfirmElement}
    </>
  );
}

export default ServiceCard;
