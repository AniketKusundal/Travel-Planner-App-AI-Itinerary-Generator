import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublicItinerary } from "../services/authApi";
import { Globe, MapPin, Calendar, DollarSign, Sparkles, AlertCircle } from "lucide-react";

function PublicItinerary() {
  const { shareId } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getPublicItinerary(shareId)
      .then((data) => setItinerary(data?.data || data))
      .catch(() => setError("Shared itinerary not found or has been removed."))
      .finally(() => setLoading(false));
  }, [shareId]);

  if (loading) {
    return (
      <div className="public-page">
        <div className="public-card">
          <p className="muted-text">Loading shared itinerary...</p>
        </div>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="public-page">
        <div className="public-card" style={{ textAlign: "center" }}>
          <AlertCircle size={48} className="icon-error" style={{ marginBottom: "12px" }} />
          <h2>Itinerary Not Found</h2>
          <p className="muted-text" style={{ marginTop: "8px" }}>{error}</p>
          <Link to="/" className="btn-primary-sm" style={{ marginTop: "16px", display: "inline-block" }}>
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="public-page">
      <div className="public-card">
        <div className="public-badge flex-align-gap">
          <Globe size={14} /> Shared AI Itinerary
        </div>
        <h1 className="dash-title" style={{ marginTop: "12px" }}>{itinerary.title}</h1>
        
        {itinerary.extractedData && (
          <div className="info-grid" style={{ marginTop: "20px" }}>
            {itinerary.extractedData.destination && (
              <div className="info-item">
                <div className="info-label flex-align-gap"><MapPin size={14} /> Destination</div>
                <div className="info-value">{itinerary.extractedData.destination}</div>
              </div>
            )}
            {itinerary.extractedData.travelDate && (
              <div className="info-item">
                <div className="info-label flex-align-gap"><Calendar size={14} /> Date</div>
                <div className="info-value">{itinerary.extractedData.travelDate}</div>
              </div>
            )}
            {itinerary.extractedData.budget && (
              <div className="info-item">
                <div className="info-label flex-align-gap"><DollarSign size={14} /> Budget Vibe</div>
                <div className="info-value">{itinerary.extractedData.budget}</div>
              </div>
            )}
          </div>
        )}

        <div className="itin-text-card" style={{ marginTop: "24px" }}>
          <pre className="itin-text">{itinerary.itineraryText}</pre>
        </div>

        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <Link to="/" className="btn-primary">
            <Sparkles size={16} /> Create Your Own AI Itinerary
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PublicItinerary;
