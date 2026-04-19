import { useState } from 'react';
import { CheckCircle, XCircle, MessageCircle, Send, FileText } from 'lucide-react';
import { serviceService } from '../../api/service.service';
import './AuthorizationQuestions.css';

const WORKSHOP_PHONE = '529511790349';
const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';

function AttachmentList({ attachments }) {
  if (!attachments || attachments.length === 0) return null;
  return (
    <div className="aq-attachments">
      {attachments.map(a => (
        a.type === 'IMAGE' ? (
          <img
            key={a.id}
            src={`${API_BASE}${a.url}`}
            alt={a.filename}
            className="aq-attach-img"
            onClick={() => window.open(`${API_BASE}${a.url}`, '_blank')}
          />
        ) : (
          <a
            key={a.id}
            href={`${API_BASE}${a.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="aq-attach-pdf"
          >
            <FileText size={12} />
            <span>{a.filename}</span>
          </a>
        )
      ))}
    </div>
  );
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });
}

function AuthorizationQuestionCard({ question, serviceCode, onResponded }) {
  const [respondingWith, setRespondingWith] = useState(null);
  const [message, setMessage] = useState('');
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const isPending = question.response === 'PENDING';

  const handleRespond = async (response) => {
    if (isPending && !showMessageInput && response !== 'WHATSAPP_CONTACT') {
      setRespondingWith(response);
      setShowMessageInput(true);
      return;
    }

    setRespondingWith(response);
    setIsSending(true);
    try {
      await serviceService.respondAuthorizationQuestion(question.id, response, message.trim() || undefined);

      if (response === 'WHATSAPP_CONTACT') {
        const msg = encodeURIComponent(
          `Hola, me comunico por mi servicio *${serviceCode || ''}*.\n` +
          `Tengo una consulta sobre la solicitud: "${question.question.slice(0, 80)}${question.question.length > 80 ? '...' : ''}"`
        );
        window.open(`https://wa.me/${WORKSHOP_PHONE}?text=${msg}`, '_blank');
      }

      if (onResponded) {
        onResponded(question.id, response, message.trim());
      }
    } catch (error) {
      alert('Error al enviar respuesta: ' + error.message);
    } finally {
      setRespondingWith(null);
      setIsSending(false);
    }
  };

  const handleSendWithMessage = () => {
    handleRespond(respondingWith);
  };

  const cancelMessage = () => {
    setShowMessageInput(false);
    setRespondingWith(null);
    setMessage('');
  };

  const responseLabels = {
    AUTHORIZED: 'Autorizado',
    REJECTED: 'No autorizado',
    WHATSAPP_CONTACT: 'Solicitó comunicación'
  };

  // Construir mensajes en orden cronológico
  const messages = [
    { type: 'workshop', text: question.question, time: question.createdAt, attachments: question.attachments, isQuestion: true },
    question.adminMessage ? { type: 'workshop', text: question.adminMessage, time: question.adminMessageAt || question.updatedAt } : null,
    !isPending ? { type: 'customer', text: question.customerMessage, time: question.respondedAt, response: question.response } : null,
  ].filter(Boolean).sort((a, b) => new Date(a.time) - new Date(b.time));

  return (
    <div className="aq-chat">
      {messages.map((msg, idx) => (
        msg.type === 'workshop' ? (
          <div key={idx} className="aq-bubble aq-bubble--workshop">
            {msg.isQuestion && <div className="aq-bubble-sender">Taller</div>}
            <p className="aq-bubble-text">{msg.text}</p>
            {msg.isQuestion && <AttachmentList attachments={msg.attachments} />}
            <span className="aq-bubble-time">{formatTime(msg.time)}</span>
          </div>
        ) : (
          <div key={idx} className="aq-bubble aq-bubble--customer">
            <div className="aq-bubble-sender">Tú</div>
            {msg.text && <p className="aq-bubble-text">{msg.text}</p>}
            <div className={`aq-status-pill aq-status-pill--${msg.response.toLowerCase()}`} style={{marginTop: msg.text ? '0.25rem' : 0}}>
              {msg.response === 'AUTHORIZED' && <CheckCircle size={11} />}
              {msg.response === 'REJECTED' && <XCircle size={11} />}
              {msg.response === 'WHATSAPP_CONTACT' && <MessageCircle size={11} />}
              {responseLabels[msg.response]}
            </div>
            <span className="aq-bubble-time">{formatTime(msg.time)}</span>
          </div>
        )
      ))}

      {/* Acciones si esta pendiente */}
      {isPending && !showMessageInput && (
        <div className="aq-actions">
          <div className="aq-actions-row">
            <button
              className="aq-btn aq-btn--authorize"
              onClick={() => handleRespond('AUTHORIZED')}
              disabled={!!respondingWith}
            >
              <CheckCircle size={13} />
              Autorizar
            </button>
            <button
              className="aq-btn aq-btn--reject"
              onClick={() => handleRespond('REJECTED')}
              disabled={!!respondingWith}
            >
              <XCircle size={13} />
              No autorizar
            </button>
          </div>
          <button
            className="aq-btn aq-btn--whatsapp aq-btn--whatsapp-full"
            onClick={() => handleRespond('WHATSAPP_CONTACT')}
            disabled={!!respondingWith}
          >
            <MessageCircle size={13} />
            Necesito hablar con el taller
          </button>
        </div>
      )}

      {/* Input de mensaje */}
      {isPending && showMessageInput && (
        <div className="aq-compose">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={respondingWith === 'AUTHORIZED' ? 'Comentario (opcional)' : 'Motivo (opcional)'}
            rows="2"
            className="aq-compose-input"
            maxLength={500}
            autoFocus
          />
          <div className="aq-compose-actions">
            <button className="aq-compose-btn aq-compose-btn--cancel" onClick={cancelMessage}>
              Volver
            </button>
            <button
              className={`aq-compose-btn ${respondingWith === 'AUTHORIZED' ? 'aq-compose-btn--authorize' : 'aq-compose-btn--reject'}`}
              onClick={handleSendWithMessage}
              disabled={isSending}
            >
              <Send size={12} />
              {respondingWith === 'AUTHORIZED' ? 'Autorizar' : 'Rechazar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Determines which status was active when a question was created
 * by finding the last statusHistory entry before the question's createdAt.
 */
function getStatusAtTime(statusHistory, timestamp) {
  const sorted = [...(statusHistory || [])].sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt));
  let activeStatus = sorted[0]?.status || 'RECEIVED';
  for (const entry of sorted) {
    if (new Date(entry.changedAt) <= new Date(timestamp)) {
      activeStatus = entry.status;
    } else {
      break;
    }
  }
  return activeStatus;
}

/**
 * Renders authorization questions for a specific status step in the timeline.
 * Shows questions that were created while this status was active.
 */
function AuthorizationQuestionsForStep({ questions, stepStatus, statusHistory, serviceCode, onResponded }) {
  if (!questions || questions.length === 0) return null;

  const stepQuestions = questions.filter(q =>
    getStatusAtTime(statusHistory, q.createdAt) === stepStatus
  );

  if (stepQuestions.length === 0) return null;

  return (
    <div className="aq-step-questions">
      {stepQuestions.map(q => (
        <AuthorizationQuestionCard
          key={q.id}
          question={q}
          serviceCode={serviceCode}
          onResponded={onResponded}
        />
      ))}
    </div>
  );
}

export { AuthorizationQuestionCard, AuthorizationQuestionsForStep };
export default AuthorizationQuestionsForStep;
