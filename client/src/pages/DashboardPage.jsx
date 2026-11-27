import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Briefcase, 
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import API from '../config/api';

function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  async function loadDashboardStats() {
    try {
      setLoading(true);
      const reportsResponse = await API.getOrganizationReports();
      const reports = reportsResponse.success ? reportsResponse.data : [];
      
      setStats({
        totalReports: reports.length,
        pendingReports: reports.filter(r => r.status === 'pending').length,
        resolvedReports: reports.filter(r => r.status === 'resolved').length
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const quickActions = [
    {
      title: 'Manage Reports',
      description: 'View and update community reports',
      icon: FileText,
      link: '/dashboard/reports',
      color: 'blue'
    },
    {
      title: 'Manage Services',
      description: 'Create and edit services',
      icon: Briefcase,
      link: '/dashboard/services',
      color: 'green'
    },
    {
      title: 'Manage Emergency Guides',
      description: 'Create emergency response guides',
      icon: AlertTriangle,
      link: '/dashboard/guides',
      color: 'orange'
    }
  ];

  if (loading) {
    return (
      <div className="page-shell">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Organization Dashboard</p>
          <h1>Welcome back, {user?.name}</h1>
          <p className="text-muted">Manage your services and community reports</p>
        </div>
      </div>

      {!user?.verified && (
        <div className="alert alert-info" style={{marginBottom: '32px'}}>
          <AlertTriangle size={20} />
          <span>Your organization is pending verification. Some features may be limited.</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Reports</p>
            <p className="stat-value">{stats.totalReports}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Pending</p>
            <p className="stat-value">{stats.pendingReports}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Resolved</p>
            <p className="stat-value">{stats.resolvedReports}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section-heading" style={{marginTop: '48px'}}>
        <h2>Quick Actions</h2>
        <p>Manage your organization's content and reports</p>
      </div>

      <div className="features-grid">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <article className="feature-card" key={action.title}>
              <div className={`feature-icon ${action.color}`}>
                <Icon size={27} />
              </div>
              <h3>{action.title}</h3>
              <p>{action.description}</p>
              <Link to={action.link} className="feature-link">
                Get started
                <ArrowRight size={17} />
              </Link>
            </article>
          );
        })}
      </div>

      {/* Recent Activity */}
      {stats.pendingReports > 0 && (
        <div className="dashboard-alert">
          <div className="dashboard-alert-content">
            <div className="dashboard-alert-icon">
              <Clock size={24} />
            </div>
            <div>
              <h3>Pending Reports</h3>
              <p>You have {stats.pendingReports} pending report{stats.pendingReports !== 1 ? 's' : ''} that need attention</p>
            </div>
          </div>
          <Link to="/dashboard/reports?status=pending" className="btn btn-primary">
            View Reports
            <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
