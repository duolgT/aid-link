import { useEffect, useState } from 'react';
import { AlertTriangle, Plus, Edit, Trash2, X, AlertCircle } from 'lucide-react';
import API from '../config/api';

const CATEGORIES = [
  'Medical Emergency',
  'Fire',
  'Flood',
  'Security Threat',
  'Missing Person',
  'Accident',
  'Natural Disaster',
  'Other'
];

function ManageGuidesPage() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGuide, setEditingGuide] = useState(null);

  useEffect(() => {
    loadGuides();
  }, []);

  async function loadGuides() {
    try {
      setLoading(true);
      const response = await API.getEmergencyGuides();
      if (response.success) {
        setGuides(response.data);
      }
    } catch (error) {
      console.error('Failed to load guides:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this emergency guide?')) return;

    try {
      const response = await API.deleteEmergencyGuide(id);
      if (response.success) {
        setGuides(guides.filter(g => g.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete guide:', error);
      alert('Failed to delete guide');
    }
  }

  function handleEdit(guide) {
    setEditingGuide(guide);
    setShowForm(true);
  }

  function handleFormClose() {
    setShowForm(false);
    setEditingGuide(null);
  }

  async function handleFormSubmit(guideData) {
    try {
      let response;
      if (editingGuide) {
        response = await API.updateEmergencyGuide(editingGuide.id, guideData);
      } else {
        response = await API.createEmergencyGuide(guideData);
      }

      if (response.success) {
        await loadGuides();
        handleFormClose();
      }
    } catch (error) {
      console.error('Failed to save guide:', error);
      throw error;
    }
  }

  if (loading) {
    return (
      <div className="management-page">
        <div className="loading-spinner">Loading emergency guides...</div>
      </div>
    );
  }

  return (
    <div className="management-page">
      <div className="page-header">
        <div className="page-title">
          <AlertTriangle size={32} style={{color: '#dc2626'}} />
          <h1>Manage Emergency Guides</h1>
        </div>
        <p className="page-subtitle">Create and manage emergency response guides</p>
        
        <div className="page-actions">
          <button onClick={() => setShowForm(true)} className="btn btn-danger">
            <Plus size={18} />
            Add Guide
          </button>
        </div>
      </div>

      {guides.length === 0 ? (
        <div className="empty-state-box">
          <div className="empty-icon">
            <AlertTriangle size={40} />
          </div>
          <h3>No emergency guides yet</h3>
          <p>Create your first emergency response guide</p>
          <button onClick={() => setShowForm(true)} className="btn btn-danger">
            <Plus size={18} />
            Create Guide
          </button>
        </div>
      ) : (
        <div className="content-grid">
          {guides.map(guide => (
            <div key={guide.id} className="content-card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">{guide.title}</h3>
                  <span className="card-badge badge-red">
                    <AlertCircle size={14} />
                    {guide.category}
                  </span>
                </div>
              </div>
              
              <div className="card-content">
                <p style={{marginBottom: '12px'}}>{guide.summary}</p>
                
                <div style={{marginBottom: '12px'}}>
                  <strong style={{fontSize: '13px', color: '#172b49', display: 'block', marginBottom: '6px'}}>
                    Response Steps:
                  </strong>
                  <ol style={{paddingLeft: '20px', fontSize: '13px', color: '#64748b', lineHeight: '1.6'}}>
                    {guide.steps.slice(0, 3).map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                    {guide.steps.length > 3 && (
                      <li style={{fontStyle: 'italic', color: '#94a3b8'}}>
                        +{guide.steps.length - 3} more steps...
                      </li>
                    )}
                  </ol>
                </div>
                
                {guide.reminder && (
                  <div style={{
                    background: '#fef9c3',
                    border: '1px solid #fde047',
                    borderRadius: '8px',
                    padding: '10px',
                    marginBottom: '12px'
                  }}>
                    <p style={{fontSize: '12px', color: '#854d0e', margin: 0}}>
                      <strong>⚠️ Remember:</strong> {guide.reminder}
                    </p>
                  </div>
                )}
              </div>

              <div className="card-actions">
                <button
                  onClick={() => handleEdit(guide)}
                  className="btn btn-sm btn-secondary"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(guide.id)}
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

      {/* Guide Form Modal */}
      {showForm && (
        <GuideForm
          guide={editingGuide}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}

function GuideForm({ guide, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    title: guide?.title || '',
    category: guide?.category || '',
    summary: guide?.summary || '',
    steps: guide?.steps || [''],
    reminder: guide?.reminder || ''
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

  function handleStepChange(index, value) {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    setFormData({ ...formData, steps: newSteps });
  }

  function addStep() {
    setFormData({ ...formData, steps: [...formData.steps, ''] });
  }

  function removeStep(index) {
    if (formData.steps.length <= 1) return;
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({ ...formData, steps: newSteps });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Filter out empty steps
      const filteredSteps = formData.steps.filter(step => step.trim().length > 0);
      
      if (filteredSteps.length === 0) {
        setError('Please add at least one step');
        setLoading(false);
        return;
      }

      await onSubmit({
        ...formData,
        steps: filteredSteps
      });
    } catch (err) {
      setError(err.message || 'Failed to save guide');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{maxWidth: '700px'}}>
        <div className="modal-header">
          <h2 className="modal-title">
            {guide ? 'Edit Emergency Guide' : 'Create New Emergency Guide'}
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
            <label className="form-label">Guide Title *</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., What to do during a fire"
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
            <label className="form-label">Summary *</label>
            <textarea
              name="summary"
              required
              value={formData.summary}
              onChange={handleChange}
              rows={3}
              className="form-input"
              placeholder="Brief overview of this emergency guide..."
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{marginBottom: '8px'}}>Response Steps *</label>
            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
              {formData.steps.map((step, index) => (
                <div key={index} style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                  <span style={{
                    flexShrink: 0,
                    width: '32px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f1f5f9',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#172b49'
                  }}>
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    className="form-input"
                    placeholder={`Step ${index + 1}`}
                    style={{flex: 1}}
                  />
                  {formData.steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      style={{
                        flexShrink: 0,
                        padding: '8px',
                        color: '#dc2626',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addStep}
              style={{
                marginTop: '8px',
                fontSize: '13px',
                color: '#dc2626',
                background: 'transparent',
                border: 'none',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              + Add Step
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Important Reminder</label>
            <input
              type="text"
              name="reminder"
              value={formData.reminder}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., Always call emergency services first"
            />
          </div>

          <div className="modal-footer">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-danger"
            >
              {loading ? 'Saving...' : guide ? 'Update Guide' : 'Create Guide'}
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

export default ManageGuidesPage;
