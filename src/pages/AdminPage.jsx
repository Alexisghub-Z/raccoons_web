import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendTrackingCodeWhatsApp } from '../services/whatsappService';
import { sendTrackingCodeBackend } from '../services/backendWhatsappService';
import './AdminPage.css';

function AdminPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('services');
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [autoSendWhatsApp, setAutoSendWhatsApp] = useState(
    localStorage.getItem('raccoons_auto_whatsapp') === 'true'
  );
  const [useBackendWhatsApp, setUseBackendWhatsApp] = useState(
    localStorage.getItem('raccoons_use_backend_whatsapp') !== 'false' // Por defecto: true
  );
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    motorcycle: '',
    serviceType: '',
    status: 'recibido',
    notes: '',
    evidence: [],
    pdfFile: null,
    pdfFileName: ''
  });

  // Password simple para demo (en producción usar autenticación real)
  const ADMIN_PASSWORD = 'admin123';

  useEffect(() => {
    // Verificar si ya está autenticado en la sesión
    const isAuth = sessionStorage.getItem('admin_authenticated');
    if (isAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadServices();
    }
  }, [isAuthenticated]);

  const loadServices = () => {
    const storedServices = JSON.parse(localStorage.getItem('raccoons_services') || '[]');
    setServices(storedServices);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    navigate('/');
  };

  const generateCode = () => {
    return 'RCN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isNewService = !editingService;
    const serviceData = {
      ...formData,
      code: editingService ? editingService.code : generateCode(),
      dateCreated: editingService ? editingService.dateCreated : new Date().toISOString(),
      dateUpdated: new Date().toISOString()
    };

    let updatedServices;
    if (editingService) {
      updatedServices = services.map(s => s.code === editingService.code ? serviceData : s);
    } else {
      updatedServices = [...services, serviceData];
    }

    localStorage.setItem('raccoons_services', JSON.stringify(updatedServices));
    setServices(updatedServices);

    // Si es un nuevo servicio y tiene teléfono, manejar WhatsApp
    if (isNewService && serviceData.clientPhone) {
      const sendWhatsAppMessage = async () => {
        if (useBackendWhatsApp) {
          // Enviar a través del backend (envío REAL automático)
          const result = await sendTrackingCodeBackend(
            serviceData.clientPhone,
            serviceData.code,
            serviceData.clientName,
            serviceData.motorcycle,
            serviceData.serviceType
          );

          if (result.success) {
            alert(`✅ WhatsApp enviado automáticamente a ${serviceData.clientName}\nCódigo: ${serviceData.code}`);
          } else {
            alert(`❌ Error al enviar WhatsApp: ${result.error}\n\nVerifica que el backend esté corriendo.`);
          }
        } else {
          // Método anterior (abrir WhatsApp Web)
          sendTrackingCodeWhatsApp(
            serviceData.clientPhone,
            serviceData.code,
            serviceData.clientName,
            serviceData.motorcycle,
            serviceData.serviceType
          );
        }
      };

      if (autoSendWhatsApp) {
        // Enviar automáticamente
        sendWhatsAppMessage();
      } else {
        // Preguntar antes de enviar
        const sendWhatsApp = window.confirm(
          `¿Deseas enviar el código de seguimiento ${serviceData.code} por WhatsApp a ${serviceData.clientName}?`
        );

        if (sendWhatsApp) {
          sendWhatsAppMessage();
        }
      }
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      clientPhone: '',
      motorcycle: '',
      serviceType: '',
      status: 'recibido',
      notes: '',
      evidence: [],
      pdfFile: null,
      pdfFileName: ''
    });
    setEditingService(null);
    setShowForm(false);
  };

  const handleEdit = (service) => {
    setFormData({
      ...service,
      pdfFile: service.pdfFile || null,
      pdfFileName: service.pdfFileName || ''
    });
    setEditingService(service);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePDFUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Por favor selecciona un archivo PDF');
        e.target.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('El archivo PDF no debe superar 5MB');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          pdfFile: reader.result,
          pdfFileName: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePDF = () => {
    setFormData({
      ...formData,
      pdfFile: null,
      pdfFileName: ''
    });
  };

  const handleDelete = (code) => {
    if (window.confirm('¿Estás seguro de eliminar este servicio?')) {
      const updatedServices = services.filter(s => s.code !== code);
      localStorage.setItem('raccoons_services', JSON.stringify(updatedServices));
      setServices(updatedServices);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newEvidence = {
          url: reader.result,
          description: '',
          timestamp: new Date().toISOString()
        };
        setFormData(prev => ({
          ...prev,
          evidence: [...(prev.evidence || []), newEvidence]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleEvidenceDescriptionChange = (index, description) => {
    setFormData(prev => ({
      ...prev,
      evidence: prev.evidence.map((ev, i) =>
        i === index ? { ...ev, description } : ev
      )
    }));
  };

  const handleRemoveEvidence = (index) => {
    setFormData(prev => ({
      ...prev,
      evidence: prev.evidence.filter((_, i) => i !== index)
    }));
  };

  const handleDownloadPDF = (service) => {
    if (!service.pdfFile) {
      alert('Este servicio no tiene un PDF adjuntado. Edita el servicio para adjuntar un PDF.');
      return;
    }

    // Convertir base64 a blob y descargar
    const base64Data = service.pdfFile.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    // Crear link y descargar
    const link = document.createElement('a');
    link.href = url;
    link.download = service.pdfFileName || `Servicio_${service.code}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleSendWhatsApp = (service) => {
    if (!service.clientPhone) {
      alert('Este servicio no tiene un número de teléfono registrado');
      return;
    }

    sendTrackingCodeWhatsApp(
      service.clientPhone,
      service.code,
      service.clientName,
      service.motorcycle,
      service.serviceType
    );
  };

  const toggleAutoSendWhatsApp = () => {
    const newValue = !autoSendWhatsApp;
    setAutoSendWhatsApp(newValue);
    localStorage.setItem('raccoons_auto_whatsapp', newValue.toString());
  };

  const toggleBackendWhatsApp = () => {
    const newValue = !useBackendWhatsApp;
    setUseBackendWhatsApp(newValue);
    localStorage.setItem('raccoons_use_backend_whatsapp', newValue.toString());
  };

  const getStatusColor = (status) => {
    const colors = {
      'recibido': '#06b6d4',
      'en_diagnostico': '#f59e0b',
      'en_reparacion': '#ef4444',
      'listo': '#10b981',
      'entregado': '#6366f1'
    };
    return colors[status] || '#a0a0a0';
  };

  const getStatusText = (status) => {
    const texts = {
      'recibido': 'Recibido',
      'en_diagnostico': 'En Diagnóstico',
      'en_reparacion': 'En Reparación',
      'listo': 'Listo para Entrega',
      'entregado': 'Entregado'
    };
    return texts[status] || status;
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-page-login">
        <div className="admin-login-container">
          <div className="admin-login-header">
            <h1>🦝 RACCOONS</h1>
            <p>Panel de Administración</p>
          </div>

          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="admin-input-group">
              <label>Contraseña de Administrador</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la contraseña"
                required
                autoFocus
              />
            </div>
            <button type="submit" className="admin-login-btn">Ingresar</button>
            <button
              type="button"
              className="admin-back-btn"
              onClick={() => navigate('/')}
            >
              Volver al sitio
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h1>RACCOONS - Panel de Administración</h1>
          <p>Gestiona los servicios del taller</p>
        </div>
        <div className="admin-page-actions">
          {activeTab === 'services' && (
            <button
              className="admin-new-btn"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancelar' : '+ Nuevo Servicio'}
            </button>
          )}
          <button className="admin-logout-btn" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          Servicios
        </button>
      </div>

      <div className="admin-page-content">
        {showForm && (
          <div className="admin-form-container">
            <div className="admin-form-header">
              <h2>{editingService ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
              <div className="whatsapp-toggles">
                <div className="whatsapp-toggle">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={useBackendWhatsApp}
                      onChange={toggleBackendWhatsApp}
                      className="toggle-checkbox"
                    />
                    <span className="toggle-switch"></span>
                    <span className="toggle-text">
                      {useBackendWhatsApp ? '🚀 Backend API' : '🌐 Web Link'}
                    </span>
                  </label>
                </div>
                <div className="whatsapp-toggle">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={autoSendWhatsApp}
                      onChange={toggleAutoSendWhatsApp}
                      className="toggle-checkbox"
                    />
                    <span className="toggle-switch"></span>
                    <span className="toggle-text">
                      Auto-enviar {autoSendWhatsApp ? '✓' : '✗'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form-grid">
                <div className="admin-input-group">
                  <label>Nombre del Cliente *</label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                    required
                  />
                </div>

                <div className="admin-input-group">
                  <label>Teléfono del Cliente</label>
                  <input
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                    placeholder="10 dígitos"
                  />
                </div>

                <div className="admin-input-group">
                  <label>Motocicleta *</label>
                  <input
                    type="text"
                    value={formData.motorcycle}
                    onChange={(e) => setFormData({...formData, motorcycle: e.target.value})}
                    placeholder="Ej: Yamaha R15 2023"
                    required
                  />
                </div>

                <div className="admin-input-group">
                  <label>Tipo de Servicio *</label>
                  <input
                    type="text"
                    value={formData.serviceType}
                    onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                    placeholder="Ej: Mantenimiento General"
                    required
                  />
                </div>

                <div className="admin-input-group">
                  <label>Estado *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="recibido">Recibido</option>
                    <option value="en_diagnostico">En Diagnóstico</option>
                    <option value="en_reparacion">En Reparación</option>
                    <option value="listo">Listo para Entrega</option>
                    <option value="entregado">Entregado</option>
                  </select>
                </div>
              </div>

              <div className="admin-input-group">
                <label>Notas (Opcional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="4"
                  placeholder="Notas adicionales sobre el servicio..."
                />
              </div>

              <div className="admin-input-group">
                <label>Evidencias del Trabajo (Fotos)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  style={{ marginBottom: '1rem' }}
                />
                {formData.evidence && formData.evidence.length > 0 && (
                  <div className="evidence-preview">
                    {formData.evidence.map((ev, index) => (
                      <div key={index} className="evidence-item">
                        <img src={ev.url} alt={`Evidencia ${index + 1}`} />
                        <input
                          type="text"
                          placeholder="Descripción de la evidencia"
                          value={ev.description}
                          onChange={(e) => handleEvidenceDescriptionChange(index, e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveEvidence(index)}
                          className="remove-evidence-btn"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="admin-input-group">
                <label>Adjuntar PDF (Opcional)</label>
                <div className="admin-pdf-upload">
                  {formData.pdfFile ? (
                    <div className="admin-pdf-preview">
                      <span className="pdf-icon">📄</span>
                      <span className="pdf-name">{formData.pdfFileName}</span>
                      <button
                        type="button"
                        onClick={handleRemovePDF}
                        className="admin-remove-pdf-btn"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="admin-pdf-upload-area">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handlePDFUpload}
                        className="admin-pdf-input"
                        id="pdf-upload-adminpage"
                      />
                      <label htmlFor="pdf-upload-adminpage" className="admin-pdf-label">
                        <span className="upload-icon">📎</span>
                        <span>Seleccionar archivo PDF (máx. 5MB)</span>
                      </label>
                    </div>
                  )}
                </div>
                <small className="admin-help-text">
                  Este PDF estará disponible para descarga cuando el cliente consulte el seguimiento
                </small>
              </div>

              <div className="admin-form-actions">
                <button type="submit" className="admin-submit-btn">
                  {editingService ? 'Actualizar Servicio' : 'Crear Servicio'}
                </button>
                <button type="button" className="admin-cancel-btn" onClick={resetForm}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="admin-services-section">
            <div className="admin-services-header">
              <h2>Servicios Activos</h2>
              <span className="admin-services-count">{services.length} servicios</span>
            </div>

            {services.length === 0 ? (
              <div className="admin-empty">
              <p>📋 No hay servicios registrados</p>
              <p>Crea el primer servicio usando el botón "+ Nuevo Servicio"</p>
            </div>
          ) : (
            <div className="admin-services-grid">
              {services.map((service) => (
                <div key={service.code} className="admin-service-card">
                  <div className="admin-service-header">
                    <div>
                      <h3>{service.code}</h3>
                      <p className="admin-service-client">{service.clientName}</p>
                    </div>
                    <span
                      className="admin-status-badge"
                      style={{ backgroundColor: getStatusColor(service.status) }}
                    >
                      {getStatusText(service.status)}
                    </span>
                  </div>

                  <div className="admin-service-body">
                    <div className="admin-service-info">
                      <strong>Moto:</strong> {service.motorcycle}
                    </div>
                    <div className="admin-service-info">
                      <strong>Servicio:</strong> {service.serviceType}
                    </div>
                    <div className="admin-service-info">
                      <strong>Fecha:</strong> {new Date(service.dateCreated).toLocaleDateString()}
                    </div>
                    {service.notes && (
                      <div className="admin-service-info">
                        <strong>Notas:</strong> {service.notes}
                      </div>
                    )}
                    {service.pdfFile && (
                      <div className="admin-service-info admin-pdf-indicator">
                        <strong>PDF:</strong>
                        <span className="pdf-badge">📄 {service.pdfFileName || 'Adjunto disponible'}</span>
                      </div>
                    )}
                  </div>

                  <div className="admin-service-actions">
                    <button
                      onClick={() => handleEdit(service)}
                      className="admin-edit-btn"
                    >
                      ✏️ Editar
                    </button>
                    {service.pdfFile && (
                      <button
                        onClick={() => handleDownloadPDF(service)}
                        className="admin-pdf-btn"
                        title="Descargar PDF adjunto"
                      >
                        📄 PDF
                      </button>
                    )}
                    {service.clientPhone && (
                      <button
                        onClick={() => handleSendWhatsApp(service)}
                        className="admin-whatsapp-btn"
                        title="Enviar por WhatsApp"
                      >
                        💬 WhatsApp
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(service.code)}
                      className="admin-delete-btn"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
