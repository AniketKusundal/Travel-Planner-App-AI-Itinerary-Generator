import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Sparkles, LayoutDashboard, FileText, Map, Luggage, User, LogOut, LogIn, UserPlus, Menu, X, Sun, Moon } from "lucide-react";

function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to={user ? "/dashboard" : "/"} className="navbar-brand" onClick={() => setMobileOpen(false)}>
          <Sparkles className="navbar-brand-icon-svg" size={24} />
          <span className="brand-text">Wander<span className="brand-accent">AI</span></span>
        </Link>

        {/* Mobile Hamburger Button */}
        <button
          className="mobile-toggle-btn"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <ul className={`navbar-links ${mobileOpen ? "mobile-active" : ""}`}>
          {user ? (
            <>
              <li>
                <Link to="/dashboard" className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}>
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
              </li>
              <li>
                <Link to="/documents" className={`nav-link ${isActive("/documents") ? "active" : ""}`}>
                  <FileText size={16} /> Tickets & Docs
                </Link>
              </li>
              <li>
                <Link to="/itineraries" className={`nav-link ${isActive("/itineraries") ? "active" : ""}`}>
                  <Map size={16} /> Itineraries
                </Link>
              </li>
              <li>
                <Link to="/packing-list" className={`nav-link ${isActive("/packing-list") ? "active" : ""}`}>
                  <Luggage size={16} /> Smart Packing
                </Link>
              </li>
              <li>
                <Link to="/profile" className={`nav-profile-link ${isActive("/profile") ? "active" : ""}`} title="Profile & Preferences">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="nav-avatar-img-only" />
                  ) : (
                    <div className="nav-avatar-icon-only">
                      <User size={18} />
                    </div>
                  )}
                  <span className="nav-profile-text-mobile">Profile</span>
                </Link>
              </li>
              <li className="theme-toggle-item">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="theme-toggle-btn"
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                  aria-pressed={isDark}
                  title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {isDark ? <Sun size={18} className="theme-icon sun-icon" /> : <Moon size={18} className="theme-icon moon-icon" />}
                  <span className="theme-toggle-label">{isDark ? "Light" : "Dark"}</span>
                </button>
              </li>
              <li className="nav-user-item">
                <button onClick={handleLogout} className="navbar-btn-danger">
                  <LogOut size={15} /> Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className={`nav-link ${location.pathname === "/login" ? "active" : ""}`}>
                  <LogIn size={16} /> Sign In
                </Link>
              </li>
              <li className="theme-toggle-item">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="theme-toggle-btn"
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                  aria-pressed={isDark}
                  title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {isDark ? <Sun size={18} className="theme-icon sun-icon" /> : <Moon size={18} className="theme-icon moon-icon" />}
                  <span className="theme-toggle-label">{isDark ? "Light" : "Dark"}</span>
                </button>
              </li>
              <li>
                <Link to="/register" className="navbar-btn-primary">
                  <UserPlus size={16} /> Get Started →
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </header>
  );
}

export default Navbar;