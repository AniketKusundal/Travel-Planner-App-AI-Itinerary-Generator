import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUserDocuments,
  uploadDocument,
  deleteDocument,
  generateItinerary,
} from "../services/authApi";

function fileIcon(fileType) {
  if (!fileType) return "📄";
  if (fileType.includes("pdf")) return "📕";
  if (fileType.includes("image")) return "🖼️";
  return "📄";
}

function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Documents() {
  const navigate = useNavigate();
  const fileRef = useRef();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generatingId, setGeneratingId] = useState(null);
  const [alert, setAlert] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchDocs = () => {
    setLoading(true);
    getUserDocuments()
      .then((data) => setDocuments(data?.data || data || []))
      .catch(() => setAlert({ type: "error", message: "Failed to load documents." }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file || null);
    if (alert) setAlert(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileRef.current?.files[0];
    if (!file) {
      setAlert({ type: "error", message: "Please select a file first." });
      return;
    }
    const fd = new FormData();
    fd.append("document", file);
    setUploading(true);
    setAlert(null);
    try {
      await uploadDocument(fd);
      setAlert({ type: "success", message: "Document uploaded successfully!" });
      fileRef.current.value = "";
      setSelectedFile(null);
      fetchDocs();
    } catch (err) {
      setAlert({ type: "error", message: err.response?.data?.message || "Upload failed." });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d._id !== id));
    } catch {
      setAlert({ type: "error", message: "Delete failed." });
    }
  };

  const handleGenerate = async (docId) => {
    setGeneratingId(docId);
    setAlert(null);
    try {
      const data = await generateItinerary(docId);
      const itinId = data?.data?._id || data?._id;
      setAlert({ type: "success", message: "Itinerary generated!" });
      if (itinId) setTimeout(() => navigate(`/itineraries/${itinId}`), 1000);
    } catch (err) {
      setAlert({ type: "error", message: err.response?.data?.message || "Generation failed." });
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Documents</h1>
          <p className="dash-sub">Upload travel documents (PDF / image) to generate itineraries</p>
        </div>
      </div>

      {/* Upload card */}
      <div className="upload-card">
        <h2 className="section-title" style={{ marginBottom: "16px" }}>Upload Document</h2>
        <form onSubmit={handleUpload}>
          <div className={`file-drop-zone ${selectedFile ? "file-drop-zone--selected" : ""}`}>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,image/png,image/jpeg,image/jpg"
              className="file-input"
              id="doc-upload"
              onChange={handleFileChange}
            />
            {selectedFile ? (
              <label htmlFor="doc-upload" className="file-selected-preview">
                <span className="file-preview-icon">
                  {selectedFile.type.includes("pdf") ? "📕" : "🖼️"}
                </span>
                <div className="file-preview-info">
                  <span className="file-preview-name">{selectedFile.name}</span>
                  <span className="file-preview-meta">
                    {selectedFile.type.split("/")[1]?.toUpperCase()} &middot; {formatSize(selectedFile.size)}
                  </span>
                </div>
                <span className="file-preview-change">Change</span>
              </label>
            ) : (
              <label htmlFor="doc-upload" className="file-drop-label">
                <span className="file-drop-icon">📂</span>
                <span className="file-drop-text">Click to choose a file</span>
                <span className="file-drop-hint">PDF, PNG or JPG supported</span>
              </label>
            )}
          </div>

          <div style={{ marginTop: "14px" }}>
            <button
              type="submit"
              className="btn-primary-sm"
              disabled={uploading || !selectedFile}
              style={{ minWidth: "110px" }}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>

        {alert && (
          <div className={`auth-alert ${alert.type}`} style={{ marginTop: "14px" }}>
            <span>{alert.type === "error" ? "⚠️" : "✅"}</span> {alert.message}
          </div>
        )}
      </div>

      {/* Document list */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "28px", marginBottom: "14px" }}>
        <h2 className="section-title" style={{ margin: 0 }}>My Documents</h2>
        {documents.length > 0 && (
          <span className="doc-count-badge">{documents.length} file{documents.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {loading ? (
        <p className="muted-text">Loading...</p>
      ) : documents.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: "2rem", marginBottom: "10px" }}>📂</div>
          <p>No documents uploaded yet. Upload one above to get started.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>File Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, i) => (
                <tr key={doc._id}>
                  <td style={{ color: "#94a3b8", fontSize: "0.8rem" }}>{i + 1}</td>
                  <td>
                    <div className="filename-row">
                      <span className="filename-icon">{fileIcon(doc.fileType)}</span>
                      <span className="filename-cell">{doc.fileName}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge">
                      {doc.fileType?.split("/")[1]?.toUpperCase() || doc.fileType}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${doc.status}`}>{doc.status}</span>
                  </td>
                  <td style={{ color: "#64748b", fontSize: "0.82rem" }}>
                    {new Date(doc.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="actions-cell">
                    <button
                      className="btn-primary-sm"
                      onClick={() => handleGenerate(doc._id)}
                      disabled={generatingId === doc._id}
                    >
                      {generatingId === doc._id ? "Generating..." : "✨ Generate"}
                    </button>
                    <button className="btn-danger-sm" onClick={() => handleDelete(doc._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Documents;
