import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import API from '../config/api';

function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    totalServices: 0,
    totalGuides: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  async function loadDashboardStats() {
    try {
      setLoading(true);
      
      // Fetch organization reports
      const reportsResponse = await API.getOrganizationReports();
      const reports = reportsResponse.success ? reportsResponse.data : [];
      
      const totalReports = reports.length;
      const pendingReports = reports.filter(r => r.status === 'pending').length;
      const resolvedReports = reports.filter(r => r.status === 'resolved').length;

      setStats({
        totalReports,
        pendingReports,
        resolvedReports,
        totalServices: 0, // Will be updated when we add services listing
        totalGuides: 0    // Will be updated when we add guides listing
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      title: 'Total Reports',
      value: stats.totalReports,
      icon: FileText,
      color: 'bg-blue-500',
      link: '/dashboard/reports'
    },
    {
      title: 'Pending Reports',
      value: stats.pendingReports,
      icon: Clock,
      color: 'bg-yellow-500',
      link: '/dashboard/reports?status=pending'
    },
    {
      title: 'Resolved Reports',
      value: stats.resolvedReports,
      icon: CheckCircle,
      color: 'bg-green-500',
      link: '/dashboard/reports?status=resolved'
    },
    {
      title: 'Services',
      value: stats.totalServices,
      icon: Briefcase,
      color: 'bg-purple-500',
      link: '/dashboard/services'
    },
    {
      title: 'Emergency Guides',
      value: stats.totalGuides,
      icon: AlertTriangle,
      color: 'bg-red-500',
      link: '/dashboard/guides'
    }
  ];

  const quickActions = [
    {
      title: 'Manage Reports',
      description: 'View and update community reports',
      icon: FileText,
      link: '/dashboard/reports',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      title: 'Manage Services',
      description: 'Create and edit services',
      icon: Briefcase,
      link: '/dashboard/services',
      color: 'text-purple-600 bg-purple-50'
    },
    {
      title: 'Manage Guides',
      description: 'Create emergency response guides',
      icon: AlertTriangle,
      link: '/dashboard/guides',
      color: 'text-red-600 bg-red-50'
    }
  ];

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
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-emerald-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Organization Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Organization Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Organization</p>
              <p className="text-lg font-medium text-gray-900">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-medium text-gray-900">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sector</p>
              <p className="text-lg font-medium text-gray-900">{user?.sector}</p>
            </div>
          </div>
          {!user?.verified && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ Your organization is pending verification. Some features may be limited.
              </p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.title}
                to={stat.link}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  to={action.link}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                >
                  <div className={`${action.color} p-3 rounded-lg inline-block mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600">
            You have {stats.pendingReports} pending reports that need attention.
          </p>
          {stats.pendingReports > 0 && (
            <Link
              to="/dashboard/reports?status=pending"
              className="mt-4 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              View Pending Reports →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
