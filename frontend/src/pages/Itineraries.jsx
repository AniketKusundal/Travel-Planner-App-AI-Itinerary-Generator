import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserItineraries, deleteItinerary } from "../services/authApi";

function Itineraries() {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const fetchItineraries = () => {
    setLoading(true);
    getUserItineraries()
      .then((data) => setItineraries(data?.data || data || []))
      .catch(() => setAlert({ type: "error", message: "Failed to load itineraries." }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchItineraries(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this itinerary?")) return;
    try {
      await deleteItinerary(id);
      setItineraries((prev) => prev.filter((it) => it._id !== id));
    } catch {
      setAlert({ type: "error", message: "Delete failed." });
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">My Itineraries</h1>
          <p className="dash-sub">All AI-generated trip plans</p>
        </div>
        <Link to="/documents" className="btn-primary-sm">+ New Itinerary</Link>
      </div>

      {alert && (
        <div className={`auth-alert ${alert.type}`} style={{ marginBottom: "16px" }}>
          <span>{alert.type === "error" ? "⚠️" : "✅"}</span> {alert.message}
        </div>
      )}

      {loading ? (
        <p className="muted-text">Loading...</p>
      ) : itineraries.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🗺️</div>
          <p>No itineraries yet. <Link to="/documents">Upload a document</Link> to get started.</p>
        </div>
      ) : (
        <div className="itin-grid">
          {itineraries.map((it) => (
            <div key={it._id} className="itin-card">
              <div className="itin-card-header">
                <h3 className="itin-title">{it.title}</h3>
                <span className={`badge badge-${it.status}`}>{it.status}</span>
              </div>
              <p className="itin-meta">
                Created: {new Date(it.createdAt).toLocaleDateString()}
              </p>
              {it.extractedData && (
                <p className="itin-meta">
                  📍 {it.extractedData.origin} → {it.extractedData.destination}
                </p>
              )}
              <div className="itin-actions">
                <Link to={`/itineraries/${it._id}`} className="btn-primary-sm">View</Link>
                <button className="btn-danger-sm" onClick={() => handleDelete(it._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Itineraries;
