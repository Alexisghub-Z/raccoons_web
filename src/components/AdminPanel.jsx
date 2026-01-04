import { useState, useEffect } from 'react';
import './AdminPanel.css';

function AdminPanel({ onClose }) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    clientName: '',
    motorcycle: '',
    serviceType: '',
    status: 'recibido',
    notes: '',
    pdfFile: null,
    pdfFileName: ''
  });

  // Password simple para demo (en producción usar autenticación real)
  const ADMIN_PASSWORD = 'admin123';

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
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const generateCode = () => {
    return 'RCN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

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
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      motorcycle: '',
      serviceType: '',
      status: 'recibido',
      notes: '',
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
      <div className="admin-modal">
        <div className="admin-modal-content">
          <button className="admin-close" onClick={onClose}>×</button>

          <h2 className="admin-title">Panel de Administración</h2>

          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="admin-input-group">
              <label>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la contraseña"
                required
              />
            </div>
            <button type="submit">Ingresar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-modal">
      <div className="admin-modal-content admin-modal-large">
        <button className="admin-close" onClick={onClose}>×</button>

        <div className="admin-header">
          <h2 className="admin-title">Panel de Administración</h2>
          <button
            className="admin-new-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancelar' : '+ Nuevo Servicio'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="admin-form-grid">
              <div className="admin-input-group">
                <label>Nombre del Cliente</label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  required
                />
              </div>

              <div className="admin-input-group">
                <label>Motocicleta</label>
                <input
                  type="text"
                  value={formData.motorcycle}
                  onChange={(e) => setFormData({...formData, motorcycle: e.target.value})}
                  placeholder="Ej: Yamaha R15 2023"
                  required
                />
              </div>

              <div className="admin-input-group">
                <label>Tipo de Servicio</label>
                <input
                  type="text"
                  value={formData.serviceType}
                  onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                  placeholder="Ej: Mantenimiento General"
                  required
                />
              </div>

              <div className="admin-input-group">
                <label>Estado</label>
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
                rows="3"
                placeholder="Notas adicionales sobre el servicio..."
              />
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
                      id="pdf-upload"
                    />
                    <label htmlFor="pdf-upload" className="admin-pdf-label">
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

            <button type="submit" className="admin-submit-btn">
              {editingService ? 'Actualizar Servicio' : 'Crear Servicio'}
            </button>
          </form>
        )}

        <div className="admin-services-list">
          <h3>Servicios Activos ({services.length})</h3>

          {services.length === 0 ? (
            <div className="admin-empty">
              <p>No hay servicios registrados</p>
            </div>
          ) : (
            <div className="admin-table">
              {services.map((service) => (
                <div key={service.code} className="admin-service-card">
                  <div className="admin-service-header">
                    <div>
                      <h4>{service.code}</h4>
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
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(service.code)}
                      className="admin-delete-btn"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
