import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const links = [
  { label: "Home", path: "/" },
  { label: "Find Services", path: "/services" },
  { label: "Emergency Guide", path: "/emergency" },
  { label: "Community Challenges", path: "/community-challenges" },
  { label: "Report an Issue", path: "/report" },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate('/');
  }

  return (
    <>
      <button
        className="menu-toggle"
        type="button"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <nav
        id="primary-navigation"
        className={`nav-links ${menuOpen ? "open" : ""}`}
        aria-label="Main navigation"
      >
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === "/"}
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}

        {/* Auth Links */}
        {isAuthenticated ? (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              onClick={() => setMenuOpen(false)}
            >
              <LayoutDashboard size={18} className="inline mr-1" />
              Dashboard
            </NavLink>
            <div className="nav-user-info">
              <span className="text-sm text-gray-600">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="nav-link logout-btn"
            >
              <LogOut size={18} className="inline mr-1" />
              Logout
            </button>
          </>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `nav-link login-btn ${isActive ? "active" : ""}`
            }
            onClick={() => setMenuOpen(false)}
          >
            <User size={18} className="inline mr-1" />
            Login
          </NavLink>
        )}
      </nav>
    </>
  );
}

export default Navbar;
