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

const STATUS_CONFIG = {
  pending: { color: 'badge-orange', icon: Clock },
  in_progress: { color: 'badge-blue', icon: RefreshCw },
  resolved: { color: 'badge-green', icon: CheckCircle },
  closed: { color: 'badge-red', icon: XCircle }
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
      <div className="management-page">
        <div className="loading-spinner">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="management-page">
      <div className="page-header">
        <div className="page-title">
          <FileText size={32} style={{color: '#087c75'}} />
          <h1>Manage Reports</h1>
        </div>
        <p className="page-subtitle">View and update community reports submitted to your organization</p>
        
        <div className="page-actions">
          <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
            {STATUS_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => handleFilterChange(option.value)}
                className={`btn btn-sm ${statusFilter === option.value ? 'btn-primary' : 'btn-secondary'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button onClick={loadReports} className="btn btn-sm btn-secondary">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="empty-state-box">
          <div className="empty-icon">
            <FileText size={40} />
          </div>
          <h3>No reports found</h3>
          <p>{statusFilter ? `No ${statusFilter} reports yet` : 'No reports have been submitted to your organization yet'}</p>
        </div>
      ) : (
        <div className="content-grid">
          {reports.map(report => {
            const statusConfig = STATUS_CONFIG[report.status];
            const StatusIcon = statusConfig?.icon || AlertCircle;
            
            return (
              <div key={report.id} className="content-card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">{report.title}</h3>
                    <span className={`card-badge ${statusConfig?.color}`}>
                      <StatusIcon size={14} />
                      {report.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="card-content">
                  <p><strong>Category:</strong> {report.category}</p>
                  {report.area && <p><strong>Area:</strong> {report.area}</p>}
                  <p>{report.description}</p>
                  {report.notes && (
                    <div style={{marginTop: '12px', padding: '12px', background: '#eff6ff', borderRadius: '8px'}}>
                      <strong style={{fontSize: '13px', color: '#2563eb'}}>Notes:</strong>
                      <p style={{margin: '4px 0 0', fontSize: '13px'}}>{report.notes}</p>
                    </div>
                  )}
                  <p style={{fontSize: '12px', color: '#94a3b8', marginTop: '12px'}}>
                    Submitted: {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>

                {selectedReport === report.id ? (
                  <StatusUpdateForm
                    report={report}
                    onUpdate={handleStatusUpdate}
                    onCancel={() => setSelectedReport(null)}
                    updating={updating === report.id}
                  />
                ) : (
                  <div className="card-actions">
                    <button
                      onClick={() => setSelectedReport(report.id)}
                      className="btn btn-sm btn-secondary"
                    >
                      Update Status
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
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
    <form onSubmit={handleSubmit} style={{borderTop: '1px solid #e5eaf0', paddingTop: '16px', marginTop: '16px'}}>
      <div style={{display: 'grid', gap: '12px', marginBottom: '12px'}}>
        <div>
          <label style={{display: 'block', fontSize: '13px', fontWeight: '500', color: '#172b49', marginBottom: '6px'}}>
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="form-input"
            style={{width: '100%'}}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div>
          <label style={{display: 'block', fontSize: '13px', fontWeight: '500', color: '#172b49', marginBottom: '6px'}}>
            Notes (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this update"
            className="form-input"
            style={{width: '100%'}}
          />
        </div>
      </div>
      <div className="card-actions">
        <button
          type="submit"
          disabled={updating}
          className="btn btn-sm btn-primary"
        >
          {updating ? 'Updating...' : 'Update'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-sm btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default ManageReportsPage;
