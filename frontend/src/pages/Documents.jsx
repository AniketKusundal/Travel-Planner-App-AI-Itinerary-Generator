import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUserDocuments,
  uploadDocument,
  deleteDocument,
  generateItinerary,
} from "../services/authApi";
import { useToast } from "../context/ToastContext";
import { FileText, Image as ImageIcon, CloudUpload, Trash2, Sparkles, Cloud, FileCheck, ExternalLink, Search, Eye } from "lucide-react";

function renderFileIcon(fileType) {
  if (!fileType) return <FileText size={20} className="file-type-icon" />;
  if (fileType.includes("pdf")) return <FileText size={20} className="file-type-icon icon-pdf" />;
  if (fileType.includes("image")) return <ImageIcon size={20} className="file-type-icon icon-image" />;
  return <FileText size={20} className="file-type-icon" />;
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
  const { addToast } = useToast();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generatingId, setGeneratingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewTextDoc, setPreviewTextDoc] = useState(null);

  const fetchDocs = () => {
    setLoading(true);
    getUserDocuments()
      .then((data) => setDocuments(data?.data || data || []))
      .catch(() => addToast("Failed to load document history.", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    document.title = "Tickets & Boarding Passes | WanderAI OCR Parser";
    fetchDocs();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file || null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileRef.current?.files[0];
    if (!file) {
      addToast("Please select a document or ticket file first", "error");
      return;
    }
    const fd = new FormData();
    fd.append("document", file);
    setUploading(true);
    try {
      await uploadDocument(fd);
      addToast("Document uploaded & processed successfully!", "success");
      fileRef.current.value = "";
      setSelectedFile(null);
      fetchDocs();
    } catch (err) {
      addToast(err.response?.data?.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document from history?")) return;
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d._id !== id));
      addToast("Document deleted", "info");
    } catch {
      addToast("Delete failed", "error");
    }
  };

  const handleGenerate = async (docId) => {
    setGeneratingId(docId);
    try {
      const data = await generateItinerary(docId);
      const itinId = data?.data?._id || data?._id;
      addToast("AI Itinerary generated successfully!", "success");
      if (itinId) {
        setTimeout(() => navigate(`/itineraries/${itinId}`), 600);
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Generation failed", "error");
    } finally {
      setGeneratingId(null);
    }
  };

  // Filtered document history
  const filteredDocs = documents.filter((doc) =>
    doc.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.fileType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileViewUrl = (doc) => {
    if (!doc?.fileUrl) return "#";
    if (doc.fileUrl.startsWith("http")) return doc.fileUrl;
    const match = doc.fileUrl.match(/uploads[\\\/].*$/i);
    const relativePath = match ? match[0].replace(/\\/g, "/") : doc.fileUrl.replace(/\\/g, "/");
    return `http://localhost:5000/${relativePath}`;
  };

  return (
    <div className="dashboard-page">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Travel Documents & Upload History</h1>
          <p className="dash-sub">View, manage, and extract AI itineraries from all your uploaded tickets & receipts</p>
        </div>
      </div>

      {/* Upload card */}
      <div className="glass-card upload-card">
        <h2 className="section-title" style={{ marginBottom: "16px" }}>Upload Ticket or Receipt</h2>
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
                  {renderFileIcon(selectedFile.type)}
                </span>
                <div className="file-preview-info">
                  <span className="file-preview-name">{selectedFile.name}</span>
                  <span className="file-preview-meta">
                    {selectedFile.type.split("/")[1]?.toUpperCase()} &middot; {formatSize(selectedFile.size)}
                  </span>
                </div>
                <span className="file-preview-change">Change File</span>
              </label>
            ) : (
              <label htmlFor="doc-upload" className="file-drop-label">
                <CloudUpload size={40} className="file-drop-icon-svg" />
                <span className="file-drop-text">Click or drag ticket file here</span>
                <span className="file-drop-hint">Supports PDF, PNG, JPG</span>
              </label>
            )}
          </div>

          <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={uploading || !selectedFile}
            >
              {uploading ? (
                <>
                  <Cloud size={16} className="animate-spin" /> Uploading to Cloud...
                </>
              ) : (
                <>
                  <CloudUpload size={16} /> Upload & Parse Document
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Document History Header & Search */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "36px", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 className="section-title" style={{ margin: 0 }}>Document Upload History</h2>
          <p className="muted-text" style={{ fontSize: "0.85rem", marginTop: "4px" }}>
            Access and manage all previously uploaded ticket files
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {documents.length > 0 && (
            <div className="input-wrapper" style={{ width: "240px" }}>
              <Search className="input-icon" size={16} />
              <input
                type="text"
                className="form-input-sm"
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          {documents.length > 0 && (
            <span className="doc-count-badge">{documents.length} File{documents.length !== 1 ? "s" : ""}</span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
          <p className="muted-text">Loading document history...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="glass-card empty-state">
          <div style={{ width: "64px", height: "64px", borderRadius: "var(--radius-lg)", background: "rgba(79, 70, 229, 0.12)", border: "1px solid rgba(79, 70, 229, 0.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
            <FileCheck size={32} style={{ color: "var(--accent-secondary)" }} />
          </div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "8px" }}>
            {searchTerm ? "No Matching Documents" : "No Tickets Uploaded Yet"}
          </h3>
          <p className="muted-text" style={{ maxWidth: "440px", margin: "0 auto", fontSize: "0.92rem", lineHeight: "1.5" }}>
            {searchTerm
              ? "We couldn't find any documents matching your search term."
              : "Upload any travel PDF ticket or image receipt above to run OCR date extraction and save it to your travel document history."}
          </p>
        </div>
      ) : (
        <div className="glass-card table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>File Name</th>
                <th>Format</th>
                <th>Uploaded Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc, i) => {
                const viewUrl = getFileViewUrl(doc);
                return (
                  <tr key={doc._id}>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{i + 1}</td>
                    <td>
                      <div className="filename-row">
                        {renderFileIcon(doc.fileType)}
                        <span className="filename-cell" title={doc.fileName}>{doc.fileName}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge">
                        {doc.fileType?.split("/")[1]?.toUpperCase() || doc.fileType}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
                      {new Date(doc.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </td>
                    <td className="actions-cell">
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
                        title="View Original File"
                      >
                        <ExternalLink size={14} /> View File
                      </a>
                      {doc.extractedText && (
                        <button
                          className="btn-outline-sm"
                          onClick={() => setPreviewTextDoc(doc)}
                          title="View Extracted OCR Text"
                        >
                          <Eye size={14} /> Text
                        </button>
                      )}
                      <button
                        className="btn-primary-sm"
                        onClick={() => handleGenerate(doc._id)}
                        disabled={generatingId === doc._id}
                      >
                        {generatingId === doc._id ? "Generating..." : <><Sparkles size={14} /> Generate AI Trip</>}
                      </button>
                      <button className="btn-danger-sm" onClick={() => handleDelete(doc._id)} title="Delete Document">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Extracted Text Preview Modal */}
      {previewTextDoc && (
        <div className="modal-backdrop" onClick={() => setPreviewTextDoc(null)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "650px" }}>
            <div className="modal-header">
              <div>
                <h3 className="section-title">📄 Extracted Text Preview</h3>
                <p className="muted-text">{previewTextDoc.fileName}</p>
              </div>
              <button className="modal-close-btn" onClick={() => setPreviewTextDoc(null)}>×</button>
            </div>
            <div style={{ marginTop: "16px", maxHeight: "350px", overflowY: "auto", background: "var(--bg-muted)", padding: "16px", borderRadius: "var(--radius-md)", fontSize: "0.88rem", fontFamily: "monospace", color: "var(--text-primary)", whiteSpace: "pre-wrap", border: "1px solid var(--border-color)" }}>
              {previewTextDoc.extractedText || "No text extracted."}
            </div>
            <div className="modal-actions" style={{ marginTop: "20px" }}>
              <button className="btn-outline-sm" onClick={() => setPreviewTextDoc(null)}>Close</button>
              <button className="btn-primary-sm" onClick={() => { setPreviewTextDoc(null); handleGenerate(previewTextDoc._id); }}>
                <Sparkles size={14} /> Generate AI Itinerary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Documents;
