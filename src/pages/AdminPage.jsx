import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  User,
  LogOut,
  Plus,
  Search as SearchIcon,
  X,
  ClipboardList,
  Wrench,
  CheckCircle2,
  Users,
  Edit,
  Trash2
} from 'lucide-react';
import { authService } from '../api/auth.service';
import { serviceService } from '../api/service.service';
import { userService } from '../api/user.service';
import LoginForm from '../components/LoginForm';
import ServiceCard from '../components/admin/ServiceCard';
import ServiceFormModal from '../components/admin/ServiceFormModal';
import CustomerEditModal from '../components/admin/CustomerEditModal';
import Toast from '../components/admin/Toast';
import './AdminPage.css';

function AdminPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    document.title = 'Panel de Administración | Raccoons Taller';
  }, []);
  const [currentView, setCurrentView] = useState('SERVICES'); // 'SERVICES' | 'CUSTOMERS'
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE' | 'COMPLETED'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCustomerEditModalOpen, setIsCustomerEditModalOpen] = useState(false);
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
      loadCustomers();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (currentView === 'SERVICES') {
      filterServices();
    } else {
      filterCustomers();
    }
  }, [services, customers, searchTerm, statusFilter, activeTab, currentView]);

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

  const loadCustomers = async () => {
    try {
      const data = await userService.getAll();
      // Filtrar solo clientes (role === 'CUSTOMER')
      const customersOnly = data.filter(user => user.role === 'CUSTOMER');
      setCustomers(customersOnly);
    } catch (error) {
      console.error('Error loading customers:', error);
      if (error.message === 'SESSION_EXPIRED' || error.message === 'NO_AUTH') {
        showToast('Tu sesión ha expirado. Por favor inicia sesión nuevamente.', 'error');
        setTimeout(() => {
          setIsAuthenticated(false);
        }, 2000);
      } else {
        showToast(error.message || 'Error al cargar los clientes', 'error');
      }
    }
  };

  const filterServices = () => {
    let filtered = [...services];

    // Filtrar por pestaña activa (Activos o Completados)
    if (activeTab === 'ACTIVE') {
      filtered = filtered.filter(service =>
        service.status !== 'DELIVERED' && service.status !== 'CANCELLED'
      );
    } else if (activeTab === 'COMPLETED') {
      filtered = filtered.filter(service =>
        service.status === 'DELIVERED' || service.status === 'CANCELLED'
      );
    }

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

  const filterCustomers = () => {
    let filtered = [...customers];

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(customer => {
        const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
        return (
          fullName.includes(term) ||
          (customer.email && customer.email.toLowerCase().includes(term)) ||
          (customer.phone && customer.phone.includes(term))
        );
      });
    }

    setFilteredCustomers(filtered);
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
      // Preparar datos del cliente
      const nameParts = formData.clientName.trim().split(' ');
      const firstName = nameParts[0] || 'Cliente';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'General';
      const emailToUse = formData.clientEmail || null;
      const phoneToUse = formData.clientPhone || null;

      let customerId;
      let wasExistingCustomer = false;

      // Buscar si el cliente ya existe (por email o teléfono)
      try {
        const allUsers = await userService.getAll();
        const existingCustomer = allUsers.find(user => {
          // Buscar por email si se proporcionó uno válido
          if (formData.clientEmail && user.email === formData.clientEmail) {
            return true;
          }
          // Buscar por teléfono si se proporcionó
          if (formData.clientPhone && user.phone === formData.clientPhone) {
            return true;
          }
          return false;
        });

        if (existingCustomer) {
          // Cliente ya existe, reutilizarlo
          customerId = existingCustomer.id;
          wasExistingCustomer = true;
          console.log(`Cliente existente encontrado: ${existingCustomer.email} (ID: ${customerId})`);
        } else {
          // Cliente no existe, crear uno nuevo
          const customerData = {
            firstName,
            lastName,
            email: emailToUse,
            phone: phoneToUse,
            password: 'Temp1234!',
            role: 'CUSTOMER'
          };

          const response = await userService.create(customerData);
          customerId = response.user.id;
          console.log(`Cliente nuevo creado: ${emailToUse} (ID: ${customerId})`);
        }
      } catch (error) {
        console.error('Error al buscar/crear cliente:', error);
        throw new Error('Error al procesar los datos del cliente: ' + error.message);
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

      // Determinar si se reutilizó un cliente
      const clientStatus = wasExistingCustomer ? ' (cliente existente)' : ' (cliente nuevo)';

      showToast(
        `Servicio ${service.code} creado exitosamente${clientStatus}. Email enviado automáticamente`,
        'success'
      );

      setIsModalOpen(false);
      loadServices();
      loadCustomers();
    } catch (error) {
      console.error('Error creating service:', error);
      showToast('Error al crear el servicio: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleEditCustomer = (customer) => {
    setCustomerToEdit(customer);
    setIsCustomerEditModalOpen(true);
  };

  const handleUpdateCustomer = async (customerId, formData) => {
    setIsLoading(true);
    try {
      await userService.update(customerId, formData);
      showToast('Cliente actualizado correctamente', 'success');
      setIsCustomerEditModalOpen(false);
      setCustomerToEdit(null);
      loadCustomers();
      loadServices(); // Recargar servicios para actualizar los nombres de clientes
    } catch (error) {
      console.error('Error updating customer:', error);

      if (error.message === 'SESSION_EXPIRED' || error.message === 'NO_AUTH') {
        showToast('Tu sesión ha expirado. Por favor inicia sesión nuevamente.', 'error');
        setTimeout(() => {
          setIsAuthenticated(false);
        }, 2000);
      } else {
        showToast(error.message || 'Error al actualizar el cliente', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCustomer = async (customer) => {
    // Verificar si el cliente tiene servicios
    const customerServices = services.filter(s => s.customer?.id === customer.id);

    if (customerServices.length > 0) {
      showToast(
        `No se puede eliminar el cliente porque tiene ${customerServices.length} servicio(s) asociado(s). Elimina los servicios primero.`,
        'error'
      );
      return;
    }

    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar a ${customer.firstName} ${customer.lastName}?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    try {
      await userService.delete(customer.id);
      showToast('Cliente eliminado correctamente', 'success');
      loadCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);

      if (error.message === 'SESSION_EXPIRED' || error.message === 'NO_AUTH') {
        showToast('Tu sesión ha expirado. Por favor inicia sesión nuevamente.', 'error');
        setTimeout(() => {
          setIsAuthenticated(false);
        }, 2000);
      } else {
        showToast(error.message || 'Error al eliminar el cliente', 'error');
      }
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

      {/* View Switcher */}
      <div className="view-switcher">
        <button
          className={`view-btn ${currentView === 'SERVICES' ? 'active' : ''}`}
          onClick={() => {
            setCurrentView('SERVICES');
            setSearchTerm('');
          }}
        >
          <Wrench size={20} />
          Servicios
        </button>
        <button
          className={`view-btn ${currentView === 'CUSTOMERS' ? 'active' : ''}`}
          onClick={() => {
            setCurrentView('CUSTOMERS');
            setSearchTerm('');
            setStatusFilter('ALL');
          }}
        >
          <Users size={20} />
          Clientes
        </button>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <button className="btn-new-service" onClick={() => {
          setSelectedCustomer(null);
          setIsModalOpen(true);
        }}>
          <Plus size={18} />
          Nuevo Servicio
        </button>

        <div className="toolbar-filters">
          <div className="search-box">
            <SearchIcon className="search-icon" size={18} />
            <input
              type="text"
              placeholder={currentView === 'SERVICES' ? "Buscar por código, cliente o moto..." : "Buscar por nombre, email o teléfono..."}
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

          {currentView === 'SERVICES' && (
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
          )}
        </div>
      </div>

      {/* Tabs - Solo para servicios */}
      {currentView === 'SERVICES' && (
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'ACTIVE' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('ACTIVE');
            setStatusFilter('ALL');
          }}
        >
          <Wrench size={18} />
          <span>Servicios Activos</span>
          <span className="tab-count">
            {services.filter(s => s.status !== 'DELIVERED' && s.status !== 'CANCELLED').length}
          </span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'COMPLETED' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('COMPLETED');
            setStatusFilter('ALL');
          }}
        >
          <CheckCircle2 size={18} />
          <span>Servicios Completados</span>
          <span className="tab-count">
            {services.filter(s => s.status === 'DELIVERED' || s.status === 'CANCELLED').length}
          </span>
        </button>
      </div>
      )}

      {/* Stats - Solo para servicios */}
      {currentView === 'SERVICES' && (
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-label">{activeTab === 'ACTIVE' ? 'Servicios Activos' : 'Servicios Completados'}</span>
          <span className="stat-value">
            {activeTab === 'ACTIVE'
              ? services.filter(s => s.status !== 'DELIVERED' && s.status !== 'CANCELLED').length
              : services.filter(s => s.status === 'DELIVERED' || s.status === 'CANCELLED').length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Mostrando</span>
          <span className="stat-value">{filteredServices.length}</span>
        </div>
        {activeTab === 'ACTIVE' && (
          <>
            <div className="stat-item">
              <span className="stat-label">En Diagnóstico</span>
              <span className="stat-value">
                {services.filter(s => s.status === 'IN_DIAGNOSIS').length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">En Reparación</span>
              <span className="stat-value">
                {services.filter(s => s.status === 'IN_REPAIR').length}
              </span>
            </div>
          </>
        )}
        {activeTab === 'COMPLETED' && (
          <>
            <div className="stat-item">
              <span className="stat-label">Entregados</span>
              <span className="stat-value">
                {services.filter(s => s.status === 'DELIVERED').length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Cancelados</span>
              <span className="stat-value">
                {services.filter(s => s.status === 'CANCELLED').length}
              </span>
            </div>
          </>
        )}
      </div>
      )}

      {/* Services Grid */}
      {currentView === 'SERVICES' && (
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
      )}

      {/* Customers Grid */}
      {currentView === 'CUSTOMERS' && (
      <div className="services-container">
        <div className="stats-bar" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-item">
            <span className="stat-label">Total Clientes</span>
            <span className="stat-value">{customers.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Mostrando</span>
            <span className="stat-value">{filteredCustomers.length}</span>
          </div>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="empty-state">
            <Users className="empty-icon" size={48} />
            <h3>No hay clientes</h3>
            <p>
              {searchTerm
                ? 'No se encontraron clientes con los filtros aplicados'
                : 'Los clientes aparecerán aquí cuando crees servicios'}
            </p>
          </div>
        ) : (
          <div className="customers-grid">
            {filteredCustomers.map(customer => (
              <div key={customer.id} className="customer-card">
                <div className="customer-header">
                  <div className="customer-avatar">
                    <User size={24} />
                  </div>
                  <div className="customer-info">
                    <h3>{customer.firstName} {customer.lastName}</h3>
                    <p className="customer-email">{customer.email}</p>
                    {customer.phone && <p className="customer-phone">{customer.phone}</p>}
                  </div>
                </div>
                <div className="customer-stats">
                  <div className="customer-stat">
                    <span className="stat-label">Servicios</span>
                    <span className="stat-value">
                      {services.filter(s => s.customer?.id === customer.id).length}
                    </span>
                  </div>
                </div>
                <div className="customer-actions">
                  <button
                    className="btn-create-service-for-customer"
                    onClick={() => handleSelectCustomer(customer)}
                  >
                    <Plus size={18} />
                    Crear Servicio
                  </button>
                  <div className="customer-secondary-actions">
                    <button
                      className="btn-icon-action btn-edit"
                      onClick={() => handleEditCustomer(customer)}
                      title="Editar cliente"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className="btn-icon-action btn-delete"
                      onClick={() => handleDeleteCustomer(customer)}
                      title="Eliminar cliente"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Modal de Servicio */}
      <ServiceFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCustomer(null);
        }}
        onSubmit={handleCreateService}
        isLoading={isLoading}
        selectedCustomer={selectedCustomer}
      />

      {/* Modal de Edición de Cliente */}
      <CustomerEditModal
        isOpen={isCustomerEditModalOpen}
        onClose={() => {
          setIsCustomerEditModalOpen(false);
          setCustomerToEdit(null);
        }}
        onSubmit={handleUpdateCustomer}
        customer={customerToEdit}
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
