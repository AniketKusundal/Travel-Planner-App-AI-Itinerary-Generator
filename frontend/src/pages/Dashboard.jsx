import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardStats, getUserItineraries, getUserDocuments } from "../services/authApi";
import CustomTripModal from "../components/CustomTripModal";
import { useToast } from "../context/ToastContext";
import { Plane, FileText, Map, Share2, Luggage, Sparkles, ArrowRight, Upload, Clock, Eye, ExternalLink, Calendar, MapPin } from "lucide-react";

function Dashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [stats, setStats] = useState(null);
  const [recentItineraries, setRecentItineraries] = useState([]);
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    document.title = "Dashboard | WanderAI Travel Planner";
    setLoading(true);
    Promise.allSettled([
      getDashboardStats(),
      getUserItineraries(),
      getUserDocuments(),
    ])
      .then(([statsRes, itinRes, docsRes]) => {
        if (statsRes.status === "fulfilled") setStats(statsRes.value?.data || statsRes.value);
        if (itinRes.status === "fulfilled") {
          const itinData = itinRes.value?.data || itinRes.value || [];
          setRecentItineraries(itinData.slice(0, 3));
        }
        if (docsRes.status === "fulfilled") {
          const docData = docsRes.value?.data || docsRes.value || [];
          setRecentDocs(docData.slice(0, 3));
        }
      })
      .catch(() => addToast("Failed to load dashboard data", "error"))
      .finally(() => setLoading(false));
  }, [addToast]);

  const statCards = [
    { key: "documents", icon: <FileText size={22} />, label: "Docs & Tickets Processed", color: "#6366f1" },
    { key: "itineraries", icon: <Map size={22} />, label: "AI Itineraries Created", color: "#06b6d4" },
    { key: "sharedItineraries", icon: <Share2 size={22} />, label: "Shared Public Links", color: "#10b981" },
  ];

  const getFileViewUrl = (doc) => {
    if (!doc?.fileUrl) return "#";
    if (doc.fileUrl.startsWith("http")) return doc.fileUrl;
    const match = doc.fileUrl.match(/uploads[\\\/].*$/i);
    const relativePath = match ? match[0].replace(/\\/g, "/") : doc.fileUrl.replace(/\\/g, "/");
    return `http://localhost:5000/${relativePath}`;
  };

  return (
    <div className="dashboard-page">
      {/* Top Banner */}
      <div className="dash-banner glass-card">
        <div className="dash-welcome">
          <span className="welcome-badge">
            <Plane size={14} className="badge-icon" /> WanderAI Copilot
          </span>
          <h1 className="dash-title">Welcome back, {user?.name || "Traveler"}! 👋</h1>
          <p className="dash-sub">Here is a complete summary of your saved trips, documents, and travel AI tools.</p>
        </div>
        <div className="dash-banner-actions">
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Sparkles size={16} /> Plan New AI Trip
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-grid">
        {statCards.map(({ key, icon, label, color }) => (
          <div className="stat-card glass-card" key={key}>
            <div className="stat-card-top">
              <span className="stat-icon-wrapper" style={{ background: `${color}18`, color }}>
                {icon}
              </span>
              <span className="stat-value">{loading ? "—" : stats?.[key] ?? 0}</span>
            </div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* History Overview Section */}
      <div className="dashboard-history-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px", marginBottom: "40px" }}>
        
        {/* Recent Itineraries Card */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 className="section-title flex-align-gap" style={{ fontSize: "1.1rem" }}>
              <Clock size={18} className="icon-glow" /> Recent AI Itineraries
            </h3>
            <Link to="/itineraries" className="action-arrow" style={{ position: "static", fontSize: "0.85rem" }}>
              View All →
            </Link>
          </div>

          {loading ? (
            <p className="muted-text">Loading trip history...</p>
          ) : recentItineraries.length === 0 ? (
            <div className="empty-state" style={{ padding: "24px" }}>
              <p className="muted-text">No itineraries created yet.</p>
              <button className="btn-primary-sm" style={{ marginTop: "12px" }} onClick={() => setIsModalOpen(true)}>
                <Sparkles size={14} /> Create First Trip
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {recentItineraries.map((it) => (
                <div key={it._id} style={{ background: "var(--bg-muted)", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: "700", margin: "0 0 4px", color: "var(--text-primary)" }}>{it.title}</h4>
                    <span className="muted-text flex-align-gap" style={{ fontSize: "0.8rem" }}>
                      {it.extractedData?.destination ? <><MapPin size={12} /> {it.extractedData.destination}</> : <><Calendar size={12} /> {new Date(it.createdAt).toLocaleDateString()}</>}
                    </span>
                  </div>
                  <Link to={`/itineraries/${it._id}`} className="btn-outline-sm" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                    <Eye size={13} /> View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Uploaded Tickets Card */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 className="section-title flex-align-gap" style={{ fontSize: "1.1rem" }}>
              <FileText size={18} className="icon-glow" /> Recent Uploaded Tickets
            </h3>
            <Link to="/documents" className="action-arrow" style={{ position: "static", fontSize: "0.85rem" }}>
              View All →
            </Link>
          </div>

          {loading ? (
            <p className="muted-text">Loading document history...</p>
          ) : recentDocs.length === 0 ? (
            <div className="empty-state" style={{ padding: "24px" }}>
              <p className="muted-text">No tickets uploaded yet.</p>
              <Link to="/documents" className="btn-primary-sm" style={{ marginTop: "12px", display: "inline-block" }}>
                <Upload size={14} /> Upload Ticket
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {recentDocs.map((doc) => (
                <div key={doc._id} style={{ background: "var(--bg-muted)", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4 style={{ fontSize: "0.92rem", fontWeight: "600", margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "180px", color: "var(--text-primary)" }}>{doc.fileName}</h4>
                    <span className="badge" style={{ fontSize: "0.72rem", padding: "2px 8px" }}>
                      {doc.fileType?.split("/")[1]?.toUpperCase() || "DOC"}
                    </span>
                  </div>
                  <a 
                    href={doc.fileUrl?.startsWith("http") ? doc.fileUrl : "#"} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn-outline-sm" 
                    onClick={(e) => {
                      if (!doc.fileUrl?.startsWith("http")) {
                        e.preventDefault();
                        addToast("Legacy ticket saved before Cloudinary migration. Please upload a new ticket!", "info");
                      }
                    }}
                    style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                  >
                    <ExternalLink size={13} /> View
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Quick Action Cards */}
      <div className="section-header">
        <h2 className="section-title">Quick Travel Tools</h2>
        <p className="dash-sub">Choose a tool to begin building your next travel experience</p>
      </div>

      <div className="action-grid">
        <div className="action-card glass-card" onClick={() => setIsModalOpen(true)}>
          <div className="action-icon-bg">
            <Sparkles size={24} className="action-icon-svg" />
          </div>
          <h3 className="action-label">Create Custom AI Itinerary</h3>
          <p className="action-desc">Generate a personalized multi-day trip by entering your destination & vibe.</p>
          <span className="action-arrow">Start Plan <ArrowRight size={14} /></span>
        </div>

        <Link to="/documents" className="action-card glass-card">
          <div className="action-icon-bg">
            <Upload size={24} className="action-icon-svg" />
          </div>
          <h3 className="action-label">Upload Ticket & OCR Parser</h3>
          <p className="action-desc">Upload flight/train tickets (PDF or Image) to auto-extract travel dates & itinerary.</p>
          <span className="action-arrow">Upload Ticket <ArrowRight size={14} /></span>
        </Link>

        <Link to="/packing-list" className="action-card glass-card">
          <div className="action-icon-bg">
            <Luggage size={24} className="action-icon-svg" />
          </div>
          <h3 className="action-label">Smart Packing Checklist</h3>
          <p className="action-desc">Auto-generate a climate & activity tailored packing checklist with interactive tracking.</p>
          <span className="action-arrow">Open Checklist <ArrowRight size={14} /></span>
        </Link>

        <Link to="/itineraries" className="action-card glass-card">
          <div className="action-icon-bg">
            <Map size={24} className="action-icon-svg" />
          </div>
          <h3 className="action-label">View My Itineraries</h3>
          <p className="action-desc">Browse, export to PDF, or generate public share links for all your saved trips.</p>
          <span className="action-arrow">View All <ArrowRight size={14} /></span>
        </Link>
      </div>

      {/* Custom AI Trip Modal */}
      <CustomTripModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default Dashboard;
