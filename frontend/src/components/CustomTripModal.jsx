import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCustomItinerary } from "../services/authApi";
import { useToast } from "../context/ToastContext";
import { Sparkles, Compass, X, MapPin, Calendar, DollarSign, HeartHandshake } from "lucide-react";

function CustomTripModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    destination: "",
    duration: 3,
    budget: "Moderate",
    vibe: "Balanced Explorer",
    interests: "Culture, Local Food, Hidden Gems",
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.destination.trim()) {
      addToast("Destination is required", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await createCustomItinerary(formData);
      const newItinerary = res?.data || res;
      const id = newItinerary?._id;
      addToast("AI Trip Itinerary created successfully!", "success");
      onClose();
      if (id) {
        navigate(`/itineraries/${id}`);
      } else {
        navigate("/itineraries");
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to generate AI trip", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="section-title flex-align-gap">
              <Sparkles size={20} className="icon-glow" /> Create AI Custom Trip
            </h2>
            <p className="muted-text">Design a custom travel itinerary in seconds</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Where are you traveling?</label>
            <div className="input-wrapper">
              <MapPin className="input-icon" size={18} />
              <input
                type="text"
                name="destination"
                className="form-input"
                placeholder="e.g. Paris, France or Kyoto, Japan"
                value={formData.destination}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Duration (Days)</label>
              <div className="input-wrapper">
                <Calendar className="input-icon" size={18} />
                <input
                  type="number"
                  name="duration"
                  min="1"
                  max="30"
                  className="form-input"
                  value={formData.duration}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Budget Level</label>
              <div className="input-wrapper">
                <DollarSign className="input-icon" size={18} />
                <select
                  name="budget"
                  className="form-input"
                  value={formData.budget}
                  onChange={handleChange}
                >
                  <option value="Budget">Budget Friendly</option>
                  <option value="Moderate">Moderate / Balanced</option>
                  <option value="Luxury">Luxury & Comfort</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Travel Style / Vibe</label>
            <div className="input-wrapper">
              <Compass className="input-icon" size={18} />
              <select
                name="vibe"
                className="form-input"
                value={formData.vibe}
                onChange={handleChange}
              >
                <option value="Balanced Explorer">Balanced Explorer</option>
                <option value="Romantic Getaway">Romantic Getaway</option>
                <option value="Thrill & Adventure">Thrill & Adventure</option>
                <option value="Relaxation & Wellness">Relaxation & Wellness</option>
                <option value="Family Vacation">Family Vacation</option>
                <option value="Solo Backpacking">Solo Backpacking</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Special Interests / Activities</label>
            <div className="input-wrapper">
              <HeartHandshake className="input-icon" size={18} />
              <input
                type="text"
                name="interests"
                className="form-input"
                placeholder="e.g. Local Street Food, Art Museums, Nightlife, Beaches"
                value={formData.interests}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-outline-sm" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <Sparkles size={16} className="animate-spin" /> Generating AI Itinerary...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Generate Itinerary
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CustomTripModal;
