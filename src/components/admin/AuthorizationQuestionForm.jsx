import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle } from 'lucide-react';
import './AuthorizationQuestionForm.css';

function AuthorizationQuestionForm({ onSubmit, onCancel }) {
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (question.trim().length < 5) return;
    setIsSubmitting(true);
    try {
      await onSubmit(question.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="auth-question-modal-overlay" onClick={onCancel}>
      <div className="auth-question-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-question-modal-header">
          <span className="auth-question-modal-icon">
            <AlertCircle size={28} color="#d97706" />
          </span>
          <div>
            <h3>Solicitar autorizacion</h3>
            <p className="auth-question-hint">Escribe la pregunta que vera el cliente en su pagina de seguimiento</p>
          </div>
        </div>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ej: Necesitamos cambiar la cadena de transmision, el costo seria de $500. ¿Autorizas el cambio?"
          rows="4"
          className="auth-question-textarea"
          autoFocus
          maxLength={500}
        />
        <div className="auth-question-char-count">
          {question.length}/500
        </div>
        <div className="auth-question-modal-actions">
          <button onClick={onCancel} className="btn-cancel" disabled={isSubmitting}>
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="btn-confirm btn-confirm--warning"
            disabled={isSubmitting || question.trim().length < 5}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar al cliente'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default AuthorizationQuestionForm;
