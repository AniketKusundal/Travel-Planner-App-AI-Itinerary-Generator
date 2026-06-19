import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getItineraryById, shareItinerary, exportItineraryPdf } from "../services/authApi";

function ItineraryDetail() {
  const { id } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [shareLink, setShareLink] = useState("");
  const [sharing, setSharing] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getItineraryById(id)
      .then((data) => setItinerary(data?.data || data))
      .catch(() => setAlert({ type: "error", message: "Failed to load itinerary." }))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = async () => {
    setSharing(true);
    try {
      const data = await shareItinerary(id);
      const sid = data?.data?.shareId || data?.shareId;
      const link = `${window.location.origin}/shared/${sid}`;
      setShareLink(link);
      setAlert({ type: "success", message: "Share link generated!" });
    } catch {
      setAlert({ type: "error", message: "Share failed." });
    } finally {
      setSharing(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportItineraryPdf(id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${itinerary?.title || "itinerary"}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setAlert({ type: "error", message: "Export failed." });
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="dashboard-page"><p className="muted-text">Loading...</p></div>;
  if (!itinerary && !loading) return (
    <div className="dashboard-page">
      <p className="error-text">Itinerary not found.</p>
      <Link to="/itineraries" className="btn-primary-sm" style={{ marginTop: "12px", display: "inline-block" }}>← Back</Link>
    </div>
  );

  return (
    <div className="dashboard-page">
      <div className="dash-header">
        <div>
          <Link to="/itineraries" className="back-link">← All Itineraries</Link>
          <h1 className="dash-title" style={{ marginTop: "6px" }}>{itinerary?.title}</h1>
          <span className={`badge badge-${itinerary?.status}`}>{itinerary?.status}</span>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn-outline-sm" onClick={handleShare} disabled={sharing}>
            {sharing ? "Sharing..." : "🔗 Share"}
          </button>
          <button className="btn-outline-sm" onClick={handleExport} disabled={exporting}>
            {exporting ? "Exporting..." : "📥 Export PDF"}
          </button>
        </div>
      </div>

      {alert && (
        <div className={`auth-alert ${alert.type}`} style={{ marginBottom: "16px" }}>
          <span>{alert.type === "error" ? "⚠️" : "✅"}</span> {alert.message}
        </div>
      )}

      {shareLink && (
        <div className="share-box">
          <span>Share Link:</span>
          <input className="share-input" readOnly value={shareLink} onClick={(e) => e.target.select()} />
          <button className="btn-primary-sm" onClick={() => navigator.clipboard.writeText(shareLink)}>Copy</button>
        </div>
      )}

      {/* Trip info */}
      {itinerary?.extractedData && (
        <div className="info-grid">
          {[
            ["Origin", itinerary.extractedData.origin],
            ["Destination", itinerary.extractedData.destination],
            ["Travel Date", itinerary.extractedData.travelDate],
            ["Travelers", itinerary.extractedData.numberOfTravelers],
            ["Budget", itinerary.extractedData.budget],
            ["Preferences", itinerary.extractedData.preferences],
          ].filter(([, v]) => v).map(([label, value]) => (
            <div key={label} className="info-item">
              <div className="info-label">{label}</div>
              <div className="info-value">{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Itinerary text */}
      <div className="itin-text-card">
        <h2 className="section-title" style={{ marginBottom: "16px" }}>Trip Plan</h2>
        <pre className="itin-text">{itinerary?.itineraryText}</pre>
      </div>
    </div>
  );
}

export default ItineraryDetail;
