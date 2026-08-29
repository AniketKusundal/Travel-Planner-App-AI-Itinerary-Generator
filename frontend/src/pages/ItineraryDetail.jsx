import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getItineraryById, shareItinerary, exportItineraryPdf, generatePackingList } from "../services/authApi";
import { useToast } from "../context/ToastContext";
import { ArrowLeft, Share2, Download, Copy, Map, Luggage, Calendar, MapPin, DollarSign, Compass, CheckSquare } from "lucide-react";

// Helper to parse markdown into structured blocks (headings, tables, quotes, paragraphs)
const parseItineraryMarkdown = (text = "") => {
  const blocks = [];
  const lines = text.split("\n");
  let currentTable = [];
  let currentParagraph = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({ type: "paragraph", content: currentParagraph.join(" ") });
      currentParagraph = [];
    }
  };

  const flushTable = () => {
    if (currentTable.length > 0) {
      blocks.push({ type: "table", content: currentTable.join("\n") });
      currentTable = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushTable();
      continue;
    }

    if (trimmed.startsWith("|")) {
      flushParagraph();
      currentTable.push(trimmed);
    } else {
      flushTable();
      if (trimmed.startsWith("#") || /^Day\s*\d+/i.test(trimmed) || /^📍\s*Day/i.test(trimmed) || /^🗓️/i.test(trimmed) || /^📞/i.test(trimmed) || /^🎒/i.test(trimmed)) {
        flushParagraph();
        blocks.push({ type: "heading", content: trimmed.replace(/#/g, "").replace(/\*/g, "").trim() });
      } else if (trimmed.startsWith(">")) {
        flushParagraph();
        blocks.push({ type: "quote", content: trimmed.replace(/^>\s*/, "").replace(/\*/g, "").trim() });
      } else {
        currentParagraph.push(trimmed.replace(/\*/g, ""));
      }
    }
  }

  flushParagraph();
  flushTable();
  return blocks;
};

// Render cell content with colored highlights for numbers, prices, and checklists
const renderCellContent = (text = "") => {
  const clean = text.replace(/\*\*/g, "").replace(/\*/g, "");

  // Emergency numbers & phone numbers
  if (/\+?\d{2,4}[\s\-\d]{5,}/.test(clean) || /\b(110|119)\b/.test(clean)) {
    return <span className="cell-highlight-phone">{clean}</span>;
  }

  // Checklist boxes
  if (clean.startsWith("[ ]") || clean.startsWith("[x]")) {
    const isChecked = clean.startsWith("[x]");
    return (
      <span className="cell-checklist">
        <input type="checkbox" defaultChecked={isChecked} style={{ marginRight: "8px", accentColor: "var(--accent-primary)" }} />
        {clean.replace(/^\[[ x]\]\s*/i, "")}
      </span>
    );
  }

  // Price / Cost highlight
  if (/\$|¥/.test(clean)) {
    return <span className="cell-highlight-cost">{clean}</span>;
  }

  return clean;
};

function ItineraryDetail() {
  const { id } = useParams();
  const { addToast } = useToast();

  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareLink, setShareLink] = useState("");
  const [sharing, setSharing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState("itinerary");

  // Packing list state for this trip
  const [packingData, setPackingData] = useState(null);
  const [loadingPacking, setLoadingPacking] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    getItineraryById(id)
      .then((data) => {
        const item = data?.data || data;
        setItinerary(item);
        if (item?.title) {
          document.title = `${item.title} | WanderAI`;
        } else {
          document.title = "Travel Itinerary Details | WanderAI";
        }
      })
      .catch(() => addToast("Failed to load itinerary details", "error"))
      .finally(() => setLoading(false));
  }, [id, addToast]);

  const handleShare = async () => {
    setSharing(true);
    try {
      const data = await shareItinerary(id);
      const sid = data?.data?.shareId || data?.shareId;
      const link = `${window.location.origin}/shared/${sid}`;
      setShareLink(link);
      navigator.clipboard.writeText(link);
      addToast("Public link generated & copied to clipboard! 🔗", "success");
    } catch {
      addToast("Share failed", "error");
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
      addToast("PDF Export downloaded successfully!", "success");
    } catch {
      addToast("PDF Export failed", "error");
    } finally {
      setExporting(false);
    }
  };

  const handleLoadPackingList = async () => {
    if (packingData) return;
    setLoadingPacking(true);
    try {
      const destination = itinerary?.extractedData?.destination || itinerary?.title || "Trip";
      const duration = itinerary?.extractedData?.duration || 3;
      const res = await generatePackingList({
        destination,
        duration,
        climate: "Seasonal",
        activities: itinerary?.extractedData?.interests || "Sightseeing",
      });
      setPackingData(res?.data || res);
      addToast("Packing checklist generated for trip!", "success");
    } catch {
      addToast("Failed to generate packing list", "error");
    } finally {
      setLoadingPacking(false);
    }
  };

  const toggleCheck = (categoryName, item) => {
    const key = `${categoryName}-${item}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
          <p className="muted-text">Loading itinerary details...</p>
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="dashboard-page">
        <div className="glass-card empty-state">
          <h2>Itinerary Not Found</h2>
          <Link to="/itineraries" className="btn-primary-sm" style={{ marginTop: "16px", display: "inline-block" }}>
            <ArrowLeft size={14} /> Back to Itineraries
          </Link>
        </div>
      </div>
    );
  }

  const parsedBlocks = itinerary.itineraryText ? parseItineraryMarkdown(itinerary.itineraryText) : [];

  return (
    <div className="dashboard-page">
      {/* Top Header */}
      <div className="dash-header">
        <div>
          <Link to="/itineraries" className="back-link">
            <ArrowLeft size={14} /> All Itineraries
          </Link>
          <h1 className="dash-title" style={{ marginTop: "6px" }}>{itinerary.title}</h1>
          <span className={`badge badge-${itinerary.status}`}>{itinerary.status}</span>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn-outline-sm" onClick={handleShare} disabled={sharing}>
            <Share2 size={15} /> {sharing ? "Generating Link..." : "Share Public Link"}
          </button>
          <button className="btn-primary" onClick={handleExport} disabled={exporting}>
            <Download size={16} /> {exporting ? "Generating PDF..." : "Download PDF"}
          </button>
        </div>
      </div>

      {shareLink && (
        <div className="glass-card share-box" style={{ marginBottom: "20px" }}>
          <span>Public Share Link:</span>
          <input className="share-input" readOnly value={shareLink} onClick={(e) => e.target.select()} />
          <button
            className="btn-primary-sm"
            onClick={() => {
              navigator.clipboard.writeText(shareLink);
              addToast("Link copied to clipboard!", "success");
            }}
          >
            <Copy size={14} /> Copy Link
          </button>
        </div>
      )}

      {/* Extracted Metadata Banner */}
      {itinerary.extractedData && (
        <div className="glass-card info-grid" style={{ marginBottom: "24px" }}>
          {[
            ["Destination", itinerary.extractedData.destination, <MapPin size={14} key="dest" />],
            ["Origin", itinerary.extractedData.origin, <MapPin size={14} key="orig" />],
            ["Travel Date", itinerary.extractedData.travelDate, <Calendar size={14} key="date" />],
            ["Budget Vibe", itinerary.extractedData.budget, <DollarSign size={14} key="budg" />],
            ["Interests / Vibe", itinerary.extractedData.interests || itinerary.extractedData.vibe, <Compass size={14} key="vibe" />],
          ]
            .filter(([, v]) => v)
            .map(([label, value, icon]) => (
              <div key={label} className="info-item">
                <div className="info-label flex-align-gap">{icon} {label}</div>
                <div className="info-value">{value}</div>
              </div>
            ))}
        </div>
      )}

      {/* Tabs */}
      <div className="detail-tabs">
        <button
          className={`detail-tab ${activeTab === "itinerary" ? "detail-tab-active" : ""}`}
          onClick={() => setActiveTab("itinerary")}
        >
          <Map size={16} /> Trip Itinerary
        </button>
        <button
          className={`detail-tab ${activeTab === "packing" ? "detail-tab-active" : ""}`}
          onClick={() => {
            setActiveTab("packing");
            handleLoadPackingList();
          }}
        >
          <Luggage size={16} /> Trip Packing List
        </button>
      </div>

      {/* Tab 1: Itinerary */}
      {activeTab === "itinerary" && (
        <div className="glass-card itin-text-card">
          <div className="itin-text-header">
            <h2 className="section-title">Day-by-Day AI Travel Plan</h2>
          </div>
          <div className="formatted-itin-content">
            {parsedBlocks.length > 0 ? (
              <div className="itin-body-markdown">
                {parsedBlocks.map((block, index) => {
                  if (block.type === "heading") {
                    return (
                      <h3 key={index} className="itin-section-header">
                        {block.content}
                      </h3>
                    );
                  }

                  if (block.type === "table") {
                    const rows = block.content
                      .split("\n")
                      .filter((r) => r.trim().startsWith("|") && !r.includes("---"));
                    if (rows.length > 0) {
                      const parseRow = (row) =>
                        row
                          .split("|")
                          .slice(1, -1)
                          .map((c) => c.trim());
                      const headers = parseRow(rows[0]);
                      const bodyRows = rows.slice(1).map(parseRow);
                      return (
                        <div key={index} className="table-wrapper" style={{ margin: "20px 0" }}>
                          <table className="data-table">
                            <thead>
                              <tr>
                                {headers.map((h, i) => (
                                  <th key={i}>{h.replace(/\*\*/g, "").replace(/\*/g, "")}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {bodyRows.map((r, rowIndex) => (
                                <tr key={rowIndex}>
                                  {r.map((cell, colIndex) => (
                                    <td key={colIndex}>{renderCellContent(cell)}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    }
                  }

                  if (block.type === "quote") {
                    return (
                      <blockquote key={index} className="itin-blockquote">
                        {block.content}
                      </blockquote>
                    );
                  }

                  return (
                    <p key={index} className="itin-paragraph">
                      {block.content}
                    </p>
                  );
                })}
              </div>
            ) : (
              <p className="muted-text">No itinerary content available.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Smart Packing List */}
      {activeTab === "packing" && (
        <div className="glass-card itin-text-card">
          <h2 className="section-title">Trip Packing Checklist</h2>
          {loadingPacking ? (
            <p className="muted-text" style={{ marginTop: "16px" }}>Generating custom AI packing list for this trip...</p>
          ) : !packingData ? (
            <p className="muted-text" style={{ marginTop: "16px" }}>Click to generate trip checklist.</p>
          ) : (
            <div style={{ marginTop: "16px" }}>
              <p className="muted-text" style={{ marginBottom: "16px" }}>{packingData.climateSummary}</p>
              <div className="category-list">
                {packingData.categories?.map((cat) => (
                  <div key={cat.name} className="packing-cat-block">
                    <h4 className="cat-title flex-align-gap">
                      <CheckSquare size={16} /> {cat.name}
                    </h4>
                    <div className="item-list">
                      {cat.items.map((item) => {
                        const key = `${cat.name}-${item}`;
                        const isChecked = checkedItems[key];
                        return (
                          <label key={item} className={`checklist-item ${isChecked ? "item-checked" : ""}`}>
                            <input
                              type="checkbox"
                              checked={Boolean(isChecked)}
                              onChange={() => toggleCheck(cat.name, item)}
                            />
                            <span className="item-text">{item}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ItineraryDetail;
