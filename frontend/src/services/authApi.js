import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/v1",
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// ── Auth ──
export const SignupUser = (data) => API.post("/auth/signup", data).then((r) => r.data);
export const Loginuser  = (data) => API.post("/auth/login",  data).then((r) => r.data);

// ── Dashboard ──
export const getDashboardStats = () => API.get("/dashboard/stats").then((r) => r.data);

// ── Documents ──
export const uploadDocument   = (formData) => API.post("/document/upload/document", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);
export const getUserDocuments = ()         => API.get("/document").then((r) => r.data);
export const getDocumentById  = (id)       => API.get(`/document/${id}`).then((r) => r.data);
export const deleteDocument   = (id)       => API.delete(`/document/${id}`).then((r) => r.data);

// ── Itineraries ──
export const generateItinerary  = (documentId) => API.post(`/itinerary/generate/${documentId}`).then((r) => r.data);
export const getUserItineraries  = ()           => API.get("/itinerary/history").then((r) => r.data);
export const getItineraryById    = (id)         => API.get(`/itinerary/${id}`).then((r) => r.data);
export const shareItinerary      = (id)         => API.post(`/itinerary/share/${id}`).then((r) => r.data);
export const deleteItinerary     = (id)         => API.delete(`/itinerary/${id}`).then((r) => r.data);
export const exportItineraryPdf  = (id)         => API.get(`/itinerary/export/${id}`, { responseType: "blob" }).then((r) => r.data);
export const getPublicItinerary  = (shareId)    => API.get(`/itinerary/public/${shareId}`).then((r) => r.data);