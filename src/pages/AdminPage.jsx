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
  Trash2,
  Phone,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
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

  // Pagination state
  const ITEMS_PER_PAGE = 12;
  const [servicePage, setServicePage] = useState(1);
  const [servicePagination, setServicePagination] = useState({ total: 0, totalPages: 1 });
  const [customerPage, setCustomerPage] = useState(1);
  const [customerPagination, setCustomerPagination] = useState({ total: 0, totalPages: 1 });
  const [serviceStats, setServiceStats] = useState({ active: 0, completed: 0, inDiagnosis: 0, inRepair: 0, delivered: 0, cancelled: 0 });

  useEffect(() => {
    if (authService.isAuthenticated()) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadServiceStats();
    }
  }, [isAuthenticated]);

  // Reload services when authenticated, pagination, filters, or tab changes
  useEffect(() => {
    if (isAuthenticated) {
      loadServices();
    }
  }, [isAuthenticated, servicePage, statusFilter, activeTab]);

  // Reload customers when authenticated or pagination changes
  useEffect(() => {
    if (isAuthenticated) {
      loadCustomers();
    }
  }, [isAuthenticated, customerPage]);

  // Reset page to 1 when search term changes (with debounce)
  // Setting page to 1 triggers the page useEffect which calls loadServices/loadCustomers
  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => {
      if (currentView === 'SERVICES') {
        if (servicePage === 1) {
          loadServices(); // Already on page 1, need to manually reload
        } else {
          setServicePage(1); // Will trigger reload via useEffect
        }
      } else {
        if (customerPage === 1) {
          loadCustomers();
        } else {
          setCustomerPage(1);
        }
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter locally (for search on already-loaded data)
  useEffect(() => {
    setFilteredServices(services);
    setFilteredCustomers(customers);
  }, [services, customers]);

  const loadServices = async () => {
    try {
      const filters = {
        page: servicePage,
        limit: ITEMS_PER_PAGE
      };

      if (searchTerm) {
        filters.search = searchTerm;
      }

      // Apply status filter based on tab
      if (statusFilter !== 'ALL') {
        filters.status = statusFilter;
      } else if (activeTab === 'ACTIVE') {
        filters.statusNotIn = 'DELIVERED,CANCELLED';
      } else if (activeTab === 'COMPLETED') {
        filters.statusIn = 'DELIVERED,CANCELLED';
      }

      const response = await serviceService.getAll(filters);
      setServices(response.data || []);
      if (response.pagination) {
        setServicePagination({
          total: response.pagination.total,
          totalPages: response.pagination.totalPages
        });
      }
    } catch (error) {
      console.error('Error loading services:', error);

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

  const loadServiceStats = async () => {
    try {
      const stats = await serviceService.getStats();
      setServiceStats({
        active: stats.active || 0,
        completed: stats.completed || 0,
        inDiagnosis: stats.IN_DIAGNOSIS || 0,
        inRepair: stats.IN_REPAIR || 0,
        delivered: stats.DELIVERED || 0,
        cancelled: stats.CANCELLED || 0
      });
    } catch (error) {
      console.error('Error loading service stats:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const filters = {
        role: 'CUSTOMER',
        page: customerPage,
        limit: ITEMS_PER_PAGE
      };

      if (searchTerm && currentView === 'CUSTOMERS') {
        filters.search = searchTerm;
      }

      const response = await userService.getAll(filters);
      setCustomers(response.data || []);
      if (response.pagination) {
        setCustomerPagination({
          total: response.pagination.total,
          totalPages: response.pagination.totalPages
        });
      }
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

  // Pagination helper to generate page numbers
  const getPageNumbers = (currentPage, totalPages) => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        end = Math.min(4, totalPages - 1);
      }
      if (currentPage >= totalPages - 2) {
        start = Math.max(totalPages - 3, 2);
      }

      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
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
        const usersResponse = await userService.getAll({ role: 'CUSTOMER', limit: 1000 });
        const allUsers = usersResponse.data || [];
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
      loadServiceStats();
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
      showToast('Estado actualizado. Email enviado al cliente', 'success');
      loadServices();
      loadServiceStats();
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
      loadServiceStats();
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
      loadServiceStats();
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
            setServicePage(1);
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
            setCustomerPage(1);
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
              onChange={(e) => { setStatusFilter(e.target.value); setServicePage(1); }}
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
            setServicePage(1);
          }}
        >
          <Wrench size={18} />
          <span>Servicios Activos</span>
          <span className="tab-count">
            {serviceStats.active}
          </span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'COMPLETED' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('COMPLETED');
            setStatusFilter('ALL');
            setServicePage(1);
          }}
        >
          <CheckCircle2 size={18} />
          <span>Servicios Completados</span>
          <span className="tab-count">
            {serviceStats.completed}
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
            {servicePagination.total}
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
                {serviceStats.inDiagnosis}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">En Reparación</span>
              <span className="stat-value">
                {serviceStats.inRepair}
              </span>
            </div>
          </>
        )}
        {activeTab === 'COMPLETED' && (
          <>
            <div className="stat-item">
              <span className="stat-label">Entregados</span>
              <span className="stat-value">
                {serviceStats.delivered}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Cancelados</span>
              <span className="stat-value">
                {serviceStats.cancelled}
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
          <>
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

            {/* Pagination */}
            {servicePagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setServicePage(1)}
                  disabled={servicePage === 1}
                  title="Primera página"
                >
                  <ChevronsLeft size={18} />
                </button>
                <button
                  className="pagination-btn"
                  onClick={() => setServicePage(p => Math.max(1, p - 1))}
                  disabled={servicePage === 1}
                  title="Página anterior"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="pagination-pages">
                  {getPageNumbers(servicePage, servicePagination.totalPages).map((page, idx) => (
                    page === '...' ? (
                      <span key={`dots-${idx}`} className="pagination-dots">...</span>
                    ) : (
                      <button
                        key={page}
                        className={`pagination-page ${servicePage === page ? 'active' : ''}`}
                        onClick={() => setServicePage(page)}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>

                <button
                  className="pagination-btn"
                  onClick={() => setServicePage(p => Math.min(servicePagination.totalPages, p + 1))}
                  disabled={servicePage === servicePagination.totalPages}
                  title="Página siguiente"
                >
                  <ChevronRight size={18} />
                </button>
                <button
                  className="pagination-btn"
                  onClick={() => setServicePage(servicePagination.totalPages)}
                  disabled={servicePage === servicePagination.totalPages}
                  title="Última página"
                >
                  <ChevronsRight size={18} />
                </button>

                <span className="pagination-info">
                  Página {servicePage} de {servicePagination.totalPages}
                </span>
              </div>
            )}
          </>
        )}
      </div>
      )}

      {/* Customers Grid */}
      {currentView === 'CUSTOMERS' && (
      <div className="services-container">
        <div className="stats-bar" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-item">
            <span className="stat-label">Total Clientes</span>
            <span className="stat-value">{customerPagination.total}</span>
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
          <>
            <div className="customers-grid">
              {filteredCustomers.map(customer => (
                <div key={customer.id} className="customer-row">
                  <div className="customer-row-avatar">
                    <User size={16} />
                  </div>
                  <div className="customer-row-name">
                    <span className="row-customer-name">{customer.firstName} {customer.lastName}</span>
                  </div>
                  <div className="customer-row-email">
                    <span>{customer.email || '—'}</span>
                  </div>
                  <div className="customer-row-phone">
                    <Phone size={14} className="row-icon" />
                    <span>{customer.phone || '—'}</span>
                  </div>
                  <div className="customer-row-actions">
                    <button
                      className="row-action-btn row-action-service"
                      onClick={() => handleSelectCustomer(customer)}
                      title="Crear Servicio"
                    >
                      <Plus size={15} />
                    </button>
                    <button
                      className="row-action-btn row-action-edit"
                      onClick={() => handleEditCustomer(customer)}
                      title="Editar"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      className="row-action-btn row-action-delete"
                      onClick={() => handleDeleteCustomer(customer)}
                      title="Eliminar"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {customerPagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setCustomerPage(1)}
                  disabled={customerPage === 1}
                  title="Primera página"
                >
                  <ChevronsLeft size={18} />
                </button>
                <button
                  className="pagination-btn"
                  onClick={() => setCustomerPage(p => Math.max(1, p - 1))}
                  disabled={customerPage === 1}
                  title="Página anterior"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="pagination-pages">
                  {getPageNumbers(customerPage, customerPagination.totalPages).map((page, idx) => (
                    page === '...' ? (
                      <span key={`dots-${idx}`} className="pagination-dots">...</span>
                    ) : (
                      <button
                        key={page}
                        className={`pagination-page ${customerPage === page ? 'active' : ''}`}
                        onClick={() => setCustomerPage(page)}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>

                <button
                  className="pagination-btn"
                  onClick={() => setCustomerPage(p => Math.min(customerPagination.totalPages, p + 1))}
                  disabled={customerPage === customerPagination.totalPages}
                  title="Página siguiente"
                >
                  <ChevronRight size={18} />
                </button>
                <button
                  className="pagination-btn"
                  onClick={() => setCustomerPage(customerPagination.totalPages)}
                  disabled={customerPage === customerPagination.totalPages}
                  title="Última página"
                >
                  <ChevronsRight size={18} />
                </button>

                <span className="pagination-info">
                  Página {customerPage} de {customerPagination.totalPages}
                </span>
              </div>
            )}
          </>
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
