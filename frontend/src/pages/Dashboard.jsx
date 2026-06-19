import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardStats } from "../services/authApi";

const statCards = [
  { key: "documents",         icon: "📄", label: "Documents Uploaded",   color: "#4f46e5" },
  { key: "itineraries",       icon: "🗺️", label: "Itineraries Generated", color: "#0891b2" },
  { key: "sharedItineraries", icon: "🔗", label: "Shared Itineraries",    color: "#059669" },
];

const actionCards = [
  { to: "/documents",   icon: "📤", label: "Upload Document",  desc: "Upload a PDF or image with travel details" },
  { to: "/itineraries", icon: "🗺️", label: "My Itineraries",   desc: "View all your AI-generated trip plans" },
  { to: "/documents",   icon: "🗂️", label: "My Documents",     desc: "Manage your uploaded travel documents" },
];

function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    getDashboardStats()
      .then((data) => setStats(data?.data || data))
      .catch(() => setError("Failed to load stats."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-page">

      {/* ── Top banner ── */}
      <div className="dash-banner">
        <div>
          <h1 className="dash-title">Welcome back, {user?.name} 👋</h1>
          <p className="dash-sub">{user?.email} &nbsp;·&nbsp; AI Travel Planner</p>
        </div>
        <button className="btn-outline-sm" onClick={logout}>Logout</button>
      </div>

      {/* ── Stat cards ── */}
      <div className="stats-grid">
        {statCards.map(({ key, icon, label, color }) => (
          <div className="stat-card" key={key} style={{ borderTopColor: color }}>
            <div className="stat-icon">{icon}</div>
            <div className="stat-value" style={{ color }}>
              {loading ? "—" : stats?.[key] ?? 0}
            </div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {error && <p className="error-text" style={{ marginBottom: "16px" }}>{error}</p>}

      {/* ── Quick actions ── */}
      <div className="section-header">
        <h2 className="section-title">Quick Actions</h2>
        <p className="dash-sub">Jump right back into where you left off</p>
      </div>

      <div className="action-grid">
        {actionCards.map(({ to, icon, label, desc }) => (
          <Link to={to} className="action-card" key={label}>
            <div className="action-icon">{icon}</div>
            <div className="action-label">{label}</div>
            <p className="action-desc">{desc}</p>
            <span className="action-arrow">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
