import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  User,
  LogOut,
  Plus,
  Search as SearchIcon,
  X,
  ClipboardList
} from 'lucide-react';
import { authService } from '../api/auth.service';
import { serviceService } from '../api/service.service';
import { userService } from '../api/user.service';
import LoginForm from '../components/LoginForm';
import ServiceCard from '../components/admin/ServiceCard';
import ServiceFormModal from '../components/admin/ServiceFormModal';
import Toast from '../components/admin/Toast';
import './AdminPage.css';

function AdminPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadServices();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, statusFilter]);

  const loadServices = async () => {
    try {
      const data = await serviceService.getAll();
      setServices(data);
    } catch (error) {
      console.error('Error loading services:', error);

      // Manejar errores específicos
      if (error.message === 'SESSION_EXPIRED' || error.message === 'NO_AUTH') {
        showToast('Tu sesión ha expirado. Por favor inicia sesión nuevamente.', 'error');
        setTimeout(() => {
          setIsAuthenticated(false);
        }, 2000);
      } else {
        showToast(error.message || 'Error al cargar los servicios', 'error');
      }
    }
  };

  const filterServices = () => {
    let filtered = [...services];

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(service => {
        const clientName = service.customer
          ? `${service.customer.firstName} ${service.customer.lastName}`.toLowerCase()
          : '';
        return (
          service.code.toLowerCase().includes(term) ||
          service.motorcycle.toLowerCase().includes(term) ||
          clientName.includes(term)
        );
      });
    }

    // Filtrar por estado
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(service => service.status === statusFilter);
    }

    setFilteredServices(filtered);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    navigate('/');
  };

  const handleCreateService = async (formData) => {
    setIsLoading(true);
    try {
      // Crear cliente
      const nameParts = formData.clientName.trim().split(' ');
      const firstName = nameParts[0] || 'Cliente';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'General';
      const timestamp = Date.now();
      const emailToUse = formData.clientEmail || `cliente.${timestamp}@temp.com`;

      const customerData = {
        firstName,
        lastName,
        email: emailToUse,
        phone: formData.clientPhone || null,
        password: 'Temp1234!',
        role: 'CUSTOMER'
      };

      let customerId;
      try {
        const response = await userService.create(customerData);
        customerId = response.user.id;
      } catch (error) {
        if (error.message.includes('already exists')) {
          customerData.email = `cliente.${Date.now()}.${Math.random().toString(36).substr(2, 5)}@temp.com`;
          const response = await userService.create(customerData);
          customerId = response.user.id;
        } else {
          throw error;
        }
      }

      // Crear servicio
      const serviceData = {
        customerId,
        motorcycle: formData.motorcycle,
        serviceType: formData.serviceType,
        status: 'RECEIVED'
      };

      if (formData.notes && formData.notes.trim()) {
        serviceData.notes = formData.notes;
      }

      const service = await serviceService.create(serviceData);

      showToast(
        `Servicio ${service.code} creado exitosamente${formData.clientPhone ? '. SMS enviado automáticamente' : ''}`,
        'success'
      );

      setIsModalOpen(false);
      loadServices();
    } catch (error) {
      console.error('Error creating service:', error);
      showToast('Error al crear el servicio: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (serviceId, newStatus, notes) => {
    try {
      await serviceService.updateStatus(serviceId, newStatus, notes);
      showToast('Estado actualizado. SMS enviado al cliente', 'success');
      loadServices();
    } catch (error) {
      console.error('Error updating status:', error);

      // Manejar errores específicos
      if (error.message === 'SESSION_EXPIRED') {
        showToast('Tu sesión ha expirado. Por favor inicia sesión nuevamente.', 'error');
        setTimeout(() => {
          setIsAuthenticated(false);
        }, 2000);
      } else if (error.message === 'NO_AUTH') {
        showToast('No estás autenticado. Por favor inicia sesión.', 'error');
        setTimeout(() => {
          setIsAuthenticated(false);
        }, 2000);
      } else {
        showToast(error.message || 'Error al actualizar el estado', 'error');
      }
    }
  };

  const handleDeleteService = async (serviceId) => {
    try {
      await serviceService.delete(serviceId);
      showToast('Servicio eliminado correctamente', 'success');
      loadServices();
    } catch (error) {
      console.error('Error deleting service:', error);

      // Manejar errores específicos
      if (error.message === 'SESSION_EXPIRED') {
        showToast('Tu sesión ha expirado. Por favor inicia sesión nuevamente.', 'error');
        setTimeout(() => {
          setIsAuthenticated(false);
        }, 2000);
      } else if (error.message === 'NO_AUTH') {
        showToast('No estás autenticado. Por favor inicia sesión.', 'error');
        setTimeout(() => {
          setIsAuthenticated(false);
        }, 2000);
      } else {
        showToast(error.message || 'Error al eliminar el servicio', 'error');
      }
    }
  };

  const handleUpdateService = async (serviceId, formData) => {
    try {
      // Preparar datos del servicio
      const serviceData = {
        motorcycle: formData.motorcycle,
        serviceType: formData.serviceType,
        notes: formData.notes || null
      };

      // Preparar datos del cliente
      const customerData = {
        firstName: formData.customerFirstName,
        lastName: formData.customerLastName,
        phone: formData.customerPhone || null,
        email: formData.customerEmail || null
      };

      // Actualizar servicio
      await serviceService.update(serviceId, serviceData);

      // Actualizar cliente (necesitamos el customerId del servicio)
      const service = services.find(s => s.id === serviceId);
      if (service && service.customer) {
        await userService.update(service.customer.id, customerData);
      }

      showToast('Servicio actualizado correctamente', 'success');
      loadServices();
    } catch (error) {
      console.error('Error updating service:', error);

      // Manejar errores específicos
      if (error.message === 'SESSION_EXPIRED') {
        showToast('Tu sesión ha expirado. Por favor inicia sesión nuevamente.', 'error');
        setTimeout(() => {
          setIsAuthenticated(false);
        }, 2000);
      } else if (error.message === 'NO_AUTH') {
        showToast('No estás autenticado. Por favor inicia sesión.', 'error');
        setTimeout(() => {
          setIsAuthenticated(false);
        }, 2000);
      } else {
        showToast(error.message || 'Error al actualizar el servicio', 'error');
      }

      // Re-lanzar el error para que el modal lo maneje
      throw error;
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="admin-container">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <h1 className="header-title">
            <Settings size={24} />
            Raccoons Taller
          </h1>
          <span className="header-subtitle">Panel de Administración</span>
        </div>
        <div className="header-right">
          <span className="user-info">
            <User size={18} />
            Admin
          </span>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            Salir
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <button className="btn-new-service" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Nuevo Servicio
        </button>

        <div className="toolbar-filters">
          <div className="search-box">
            <SearchIcon className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Buscar por código, cliente o moto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="search-clear" onClick={() => setSearchTerm('')}>
                <X size={18} />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="ALL">Todos los estados</option>
            <option value="RECEIVED">Recibido</option>
            <option value="IN_DIAGNOSIS">En Diagnóstico</option>
            <option value="IN_REPAIR">En Reparación</option>
            <option value="READY_FOR_PICKUP">Listo para Entrega</option>
            <option value="DELIVERED">Entregado</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-label">Total Servicios</span>
          <span className="stat-value">{services.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Resultados</span>
          <span className="stat-value">{filteredServices.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Activos</span>
          <span className="stat-value">
            {services.filter(s => s.status !== 'DELIVERED' && s.status !== 'CANCELLED').length}
          </span>
        </div>
      </div>

      {/* Services Grid */}
      <div className="services-container">
        {filteredServices.length === 0 ? (
          <div className="empty-state">
            <ClipboardList className="empty-icon" size={48} />
            <h3>No hay servicios</h3>
            <p>
              {searchTerm || statusFilter !== 'ALL'
                ? 'No se encontraron servicios con los filtros aplicados'
                : 'Crea tu primer servicio para comenzar'}
            </p>
            {!searchTerm && statusFilter === 'ALL' && (
              <button className="btn-new-service" onClick={() => setIsModalOpen(true)}>
                <Plus size={18} />
                Crear Primer Servicio
              </button>
            )}
          </div>
        ) : (
          <div className="services-grid">
            {filteredServices.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteService}
                onUpdate={handleUpdateService}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <ServiceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateService}
        isLoading={isLoading}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  );
}

export default AdminPage;
