import { useEffect, useState } from 'react';
import { Briefcase, Plus, Edit, Trash2, X, MapPin, Phone } from 'lucide-react';
import API from '../config/api';

const CATEGORIES = [
  'Healthcare',
  'Education',
  'Food & Nutrition',
  'Shelter',
  'WASH',
  'Protection',
  'Livelihoods',
  'Legal Aid',
  'Psychosocial Support'
];

function ManageServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      setLoading(true);
      const response = await API.getServices();
      if (response.success) {
        setServices(response.data);
      }
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const response = await API.deleteService(id);
      if (response.success) {
        setServices(services.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete service:', error);
      alert('Failed to delete service');
    }
  }

  function handleEdit(service) {
    setEditingService(service);
    setShowForm(true);
  }

  function handleFormClose() {
    setShowForm(false);
    setEditingService(null);
  }

  async function handleFormSubmit(serviceData) {
    try {
      let response;
      if (editingService) {
        response = await API.updateService(editingService.id, serviceData);
      } else {
        response = await API.createService(serviceData);
      }

      if (response.success) {
        await loadServices();
        handleFormClose();
      }
    } catch (error) {
      console.error('Failed to save service:', error);
      throw error;
    }
  }

  if (loading) {
    return (
      <div className="management-page">
        <div className="loading-spinner">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="management-page">
      <div className="page-header">
        <div className="page-title">
          <Briefcase size={32} style={{color: '#087c75'}} />
          <h1>Manage Services</h1>
        </div>
        <p className="page-subtitle">Create and manage your organization's services</p>
        
        <div className="page-actions">
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <Plus size={18} />
            Add Service
          </button>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="empty-state-box">
          <div className="empty-icon">
            <Briefcase size={40} />
          </div>
          <h3>No services yet</h3>
          <p>Get started by creating your first service</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <Plus size={18} />
            Create Service
          </button>
        </div>
      ) : (
        <div className="content-grid">
          {services.map(service => (
            <div key={service.id} className="content-card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">{service.name}</h3>
                  <span className="card-badge badge-teal">
                    {service.category}
                  </span>
                </div>
              </div>
              
              <div className="card-content">
                {service.area && (
                  <p style={{display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px'}}>
                    <MapPin size={16} style={{color: '#087c75'}} />
                    <span>{service.area}</span>
                  </p>
                )}
                <p style={{marginBottom: '12px'}}>{service.description}</p>
                {service.services_offered && service.services_offered.length > 0 && (
                  <div style={{marginBottom: '12px'}}>
                    <strong style={{fontSize: '13px', color: '#172b49'}}>Services Offered:</strong>
                    <ul style={{marginTop: '6px', paddingLeft: '20px', fontSize: '13px', color: '#64748b'}}>
                      {service.services_offered.slice(0, 3).map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                      {service.services_offered.length > 3 && (
                        <li style={{fontStyle: 'italic'}}>+{service.services_offered.length - 3} more...</li>
                      )}
                    </ul>
                  </div>
                )}
                {service.phone && (
                  <p style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b'}}>
                    <Phone size={14} />
                    {service.phone}
                  </p>
                )}
              </div>

              <div className="card-actions">
                <button
                  onClick={() => handleEdit(service)}
                  className="btn btn-sm btn-secondary"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="btn btn-sm btn-danger"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service Form Modal */}
      {showForm && (
        <ServiceForm
          service={editingService}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}

function ServiceForm({ service, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    category: service?.category || '',
    area: service?.area || '',
    description: service?.description || '',
    services_offered: service?.services_offered ? service.services_offered.join(', ') : '',
    phone: service?.phone || '',
    coordinates: service?.coordinates || null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Convert services_offered string to array
      const servicesArray = formData.services_offered
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      await onSubmit({
        ...formData,
        services_offered: servicesArray
      });
    } catch (err) {
      setError(err.message || 'Failed to save service');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{maxWidth: '600px'}}>
        <div className="modal-header">
          <h2 className="modal-title">
            {service ? 'Edit Service' : 'Create New Service'}
          </h2>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div style={{padding: '12px', background: '#fee', border: '1px solid #fcc', borderRadius: '8px', color: '#c33', marginBottom: '16px'}}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Service Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., Primary Healthcare Clinic"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Area/Location</label>
            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., Kakuma 1, Zone 3"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="form-input"
              placeholder="Describe the service..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Services Offered * (comma-separated)</label>
            <input
              type="text"
              name="services_offered"
              required
              value={formData.services_offered}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., Consultation, Vaccination, Emergency Care"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
              placeholder="+254 XXX XXX XXX"
            />
          </div>

          <div className="modal-footer">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Saving...' : service ? 'Update Service' : 'Create Service'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ManageServicesPage;
