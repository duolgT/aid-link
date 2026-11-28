import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  HeartHandshake, 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  AlertTriangle, 
  LogOut,
  User,
  Menu,
  X
} from "lucide-react";

function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  function handleLogout() {
    logout();
    navigate('/');
  }

  function toggleSidebar() {
    setSidebarOpen(!sidebarOpen);
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className="dashboard-layout">
      {/* Mobile Header with Menu Button */}
      <div className="dashboard-mobile-header">
        <button 
          className="mobile-menu-button" 
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="brand">
          <div className="brand-icon">
            <HeartHandshake size={24} />
          </div>
          <div className="brand-text">
            <strong>AidLink</strong>
            <small>DASHBOARD</small>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={closeSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }}
        />
      )}

      {/* Dashboard Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
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
            onClick={closeSidebar}
          >
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </NavLink>

          <NavLink 
            to="/dashboard/reports"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <FileText size={20} />
            <span>Reports</span>
          </NavLink>

          <NavLink 
            to="/dashboard/services"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <Briefcase size={20} />
            <span>Services</span>
          </NavLink>

          <NavLink 
            to="/dashboard/guides"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
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
