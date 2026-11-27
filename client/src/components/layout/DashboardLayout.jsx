import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  HeartHandshake, 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  AlertTriangle, 
  LogOut,
  User 
} from "lucide-react";

function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="dashboard-layout">
      {/* Dashboard Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-icon">
              <HeartHandshake size={28} />
            </div>
            <div className="brand-text">
              <strong>AidLink</strong>
              <small>DASHBOARD</small>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink 
            to="/dashboard" 
            end
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </NavLink>

          <NavLink 
            to="/dashboard/reports"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <FileText size={20} />
            <span>Reports</span>
          </NavLink>

          <NavLink 
            to="/dashboard/services"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Briefcase size={20} />
            <span>Services</span>
          </NavLink>

          <NavLink 
            to="/dashboard/guides"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <AlertTriangle size={20} />
            <span>Emergency Guides</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">
              <User size={20} />
            </div>
            <div className="user-info">
              <p className="user-name">{user?.name}</p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>
          
          <button onClick={handleLogout} className="sidebar-logout">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Dashboard Main Content */}
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
