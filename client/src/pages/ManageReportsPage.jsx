import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, Filter, RefreshCw, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import API from '../config/api';

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' }
];

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800'
};

const STATUS_ICONS = {
  pending: Clock,
  in_progress: RefreshCw,
  resolved: CheckCircle,
  closed: XCircle
};

function ManageReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  async function loadReports() {
    try {
      setLoading(true);
      const filters = statusFilter ? { status: statusFilter } : {};
      const response = await API.getOrganizationReports(filters);
      if (response.success) {
        setReports(response.data);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(reportId, newStatus, notes) {
    try {
      setUpdating(reportId);
      const response = await API.updateReportStatus(reportId, newStatus, notes);
      if (response.success) {
        // Update local state
        setReports(reports.map(r => 
          r.id === reportId ? { ...r, status: newStatus, notes } : r
        ));
        setSelectedReport(null);
      }
    } catch (error) {
      console.error('Failed to update report:', error);
      alert('Failed to update report status');
    } finally {
      setUpdating(null);
    }
  }

  function handleFilterChange(status) {
    setStatusFilter(status);
    if (status) {
      setSearchParams({ status });
    } else {
      setSearchParams({});
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
              <FileText className="h-8 w-8 text-emerald-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Manage Reports</h1>
                <p className="text-sm text-gray-600">View and update community reports</p>
              </div>
            </div>
            <button
              onClick={loadReports}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === option.value
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reports List */}
        {reports.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-600">
              {statusFilter ? 'Try changing the filter' : 'No reports have been submitted yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map(report => {
              const StatusIcon = STATUS_ICONS[report.status];
              return (
                <div key={report.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[report.status]}`}>
                          <StatusIcon className="h-3 w-3" />
                          {report.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Category: <span className="font-medium">{report.category}</span>
                        {report.area && ` • Area: ${report.area}`}
                      </p>
                      <p className="text-gray-700 mb-4">{report.description}</p>
                      {report.notes && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                          <p className="text-sm text-blue-900">
                            <strong>Notes:</strong> {report.notes}
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Submitted: {new Date(report.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Update Status Form */}
                  {selectedReport === report.id ? (
                    <div className="border-t pt-4 mt-4">
                      <StatusUpdateForm
                        report={report}
                        onUpdate={handleStatusUpdate}
                        onCancel={() => setSelectedReport(null)}
                        updating={updating === report.id}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedReport(report.id)}
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      Update Status →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusUpdateForm({ report, onUpdate, onCancel, updating }) {
  const [status, setStatus] = useState(report.status);
  const [notes, setNotes] = useState(report.notes || '');

  function handleSubmit(e) {
    e.preventDefault();
    onUpdate(report.id, status, notes);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this update"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={updating}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {updating ? 'Updating...' : 'Update Status'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default ManageReportsPage;
