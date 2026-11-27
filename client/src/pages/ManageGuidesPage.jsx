import { useEffect, useState } from 'react';
import { AlertTriangle, Plus, Edit, Trash2, X } from 'lucide-react';
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Manage Emergency Guides</h1>
                <p className="text-sm text-gray-600">Create and manage emergency response guides</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Guide
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Guides List */}
        {guides.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No emergency guides yet</h3>
            <p className="text-gray-600 mb-6">Create your first emergency response guide</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Guide
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guides.map(guide => (
              <div key={guide.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{guide.title}</h3>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mb-2">
                      {guide.category}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 text-sm mb-4">{guide.summary}</p>
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Response Steps:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    {guide.steps.slice(0, 3).map((step, idx) => (
                      <li key={idx} className="text-sm text-gray-600 line-clamp-1">
                        {step}
                      </li>
                    ))}
                    {guide.steps.length > 3 && (
                      <li className="text-sm text-gray-500 italic">
                        +{guide.steps.length - 3} more steps...
                      </li>
                    )}
                  </ol>
                </div>
                {guide.reminder && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-yellow-800">
                      <strong>⚠️ Remember:</strong> {guide.reminder}
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(guide)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(guide.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {guide ? 'Edit Emergency Guide' : 'Create New Emergency Guide'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Guide Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="e.g., What to do during a fire"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Summary *
            </label>
            <textarea
              name="summary"
              required
              value={formData.summary}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Brief overview of this emergency guide..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Response Steps *
            </label>
            <div className="space-y-2">
              {formData.steps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <span className="flex-shrink-0 w-8 h-10 flex items-center justify-center bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder={`Step ${index + 1}`}
                  />
                  {formData.steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addStep}
              className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              + Add Step
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Important Reminder
            </label>
            <input
              type="text"
              name="reminder"
              value={formData.reminder}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="e.g., Always call emergency services first"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : guide ? 'Update Guide' : 'Create Guide'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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
