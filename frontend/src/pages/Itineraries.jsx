import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserItineraries, deleteItinerary } from "../services/authApi";
import CustomTripModal from "../components/CustomTripModal";
import { useToast } from "../context/ToastContext";
import { Map, Search, Sparkles, Trash2, Eye, MapPin, Compass, Calendar, Plus } from "lucide-react";

function Itineraries() {
  const { addToast } = useToast();
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchItineraries = () => {
    setLoading(true);
    getUserItineraries()
      .then((data) => setItineraries(data?.data || data || []))
      .catch(() => addToast("Failed to load itineraries.", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    document.title = "Saved Travel Itineraries | WanderAI Travel Planner";
    fetchItineraries();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this itinerary?")) return;
    try {
      await deleteItinerary(id);
      setItineraries((prev) => prev.filter((it) => it._id !== id));
      addToast("Itinerary deleted", "info");
    } catch {
      addToast("Delete failed", "error");
    }
  };

  const filteredItineraries = itineraries.filter((it) =>
    it.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    it.extractedData?.destination?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-page">
      {/* Top Header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">My AI Itineraries</h1>
          <p className="dash-sub">Browse all your personalized AI trip plans, day-by-day schedules, and public share links.</p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Sparkles size={16} /> Plan New AI Trip
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <div className="input-wrapper" style={{ maxWidth: "440px" }}>
          <Search className="input-icon" size={18} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by city, destination, or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {itineraries.length > 0 && (
          <span className="doc-count-badge">
            {filteredItineraries.length} Trip{filteredItineraries.length !== 1 ? "s" : ""} Found
          </span>
        )}
      </div>

      {loading ? (
        <div className="glass-card" style={{ padding: "48px", textAlign: "center" }}>
          <p className="muted-text">Loading your travel itineraries...</p>
        </div>
      ) : filteredItineraries.length === 0 ? (
        <div className="glass-card empty-state" style={{ padding: "56px 24px", textAlign: "center" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "var(--radius-lg)", background: "rgba(79, 70, 229, 0.12)", border: "1px solid rgba(79, 70, 229, 0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Map size={32} style={{ color: "var(--accent-secondary)" }} />
          </div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "8px" }}>
            {searchTerm ? "No Matching Itineraries" : "No Travel Itineraries Yet"}
          </h3>
          <p className="muted-text" style={{ maxWidth: "420px", margin: "0 auto 24px", fontSize: "0.92rem", lineHeight: "1.5" }}>
            {searchTerm
              ? "We couldn't find any trips matching your search keyword. Try typing a different city or destination."
              : "Generate your first AI-powered travel plan in seconds by specifying your destination and travel vibe!"}
          </p>
          {!searchTerm && (
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <Sparkles size={16} /> Plan First AI Trip
            </button>
          )}
        </div>
      ) : (
        <div className="itin-grid">
          {filteredItineraries.map((it) => (
            <div key={it._id} className="itin-card glass-card">
              <div className="itin-card-header">
                <h3 className="itin-title">{it.title}</h3>
                <span className={`badge badge-${it.status}`}>{it.status}</span>
              </div>

              <div className="itin-card-body">
                <p className="itin-meta flex-align-gap">
                  <Calendar size={14} /> Created: {new Date(it.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                {it.extractedData?.destination && (
                  <p className="itin-location-tag flex-align-gap" style={{ marginTop: "4px" }}>
                    <MapPin size={14} /> {it.extractedData.destination}
                  </p>
                )}
                {it.extractedData?.vibe && (
                  <p className="itin-vibe-tag flex-align-gap">
                    <Compass size={14} /> Vibe: {it.extractedData.vibe}
                  </p>
                )}
              </div>

              <div className="itin-actions">
                <Link to={`/itineraries/${it._id}`} className="btn-primary-sm" style={{ flex: 1, justifyContent: "center" }}>
                  <Eye size={14} /> View Full Trip
                </Link>
                <button className="btn-danger-sm" onClick={() => handleDelete(it._id)} title="Delete Itinerary">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom AI Trip Modal */}
      <CustomTripModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default Itineraries;
