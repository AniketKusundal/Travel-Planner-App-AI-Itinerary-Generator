import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={user ? "/dashboard" : "/"} className="navbar-brand">
          <span className="navbar-brand-icon">✈️</span>
          WanderAI
        </Link>

        <ul className="navbar-links">
          {user ? (
            <>
              <li>
                <Link to="/dashboard" className={isActive("/dashboard") ? "active" : ""}>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/documents" className={isActive("/documents") ? "active" : ""}>
                  Documents
                </Link>
              </li>
              <li>
                <Link to="/itineraries" className={isActive("/itineraries") ? "active" : ""}>
                  Itineraries
                </Link>
              </li>
              <li>
                <button onClick={handleLogout} className="navbar-btn-danger">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className={location.pathname === "/login" ? "active" : ""}>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="navbar-btn-primary">
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;