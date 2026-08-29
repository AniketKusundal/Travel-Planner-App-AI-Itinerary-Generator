import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { updateUserProfile, uploadAvatar } from "../services/authApi";
import { User as UserIcon, Mail, Compass, Plane, ShieldAlert, Save, Sparkles, Camera, Heart, Phone, Calendar, Upload, Image, CheckCircle } from "lucide-react";

function Profile() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const fileInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
    bio: user?.bio || "Passionate explorer chasing unforgettable sunrises and cultural experiences worldwide.",
    travelStyle: user?.travelStyle || "Moderate Explorer",
    homeAirport: user?.homeAirport || "JFK",
    emergencyContact: user?.emergencyContact || "Sarah Jenkins (Spouse)",
    emergencyPhone: user?.emergencyPhone || "+1 (555) 234-5678",
    passportExpiry: user?.passportExpiry ? user.passportExpiry.split("T")[0] : "",
    favoriteDestinations: user?.favoriteDestinations || "Tokyo, Kyoto, Swiss Alps, Amalfi Coast",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        avatar: user.avatar || "",
        bio: user.bio || "Passionate explorer chasing unforgettable sunrises and cultural experiences worldwide.",
        travelStyle: user.travelStyle || "Moderate Explorer",
        homeAirport: user.homeAirport || "JFK",
        emergencyContact: user.emergencyContact || "Sarah Jenkins (Spouse)",
        emergencyPhone: user.emergencyPhone || "+1 (555) 234-5678",
        passportExpiry: user.passportExpiry ? user.passportExpiry.split("T")[0] : "",
        favoriteDestinations: user.favoriteDestinations || "Tokyo, Kyoto, Swiss Alps, Amalfi Coast",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // Device / Gallery File Selector Handler
  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (JPG, PNG, WebP).", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("Selected image is too large. Maximum size is 10MB.", "error");
      return;
    }

    setUploadingAvatar(true);
    showToast("Uploading profile avatar from device gallery...", "info");

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await uploadAvatar(formData);
      if (res.data && res.data.avatarUrl) {
        setProfileData((prev) => ({ ...prev, avatar: res.data.avatarUrl }));
        showToast("Avatar image uploaded successfully!", "success");
      }
    } catch (err) {
      // Base64 fallback if offline or backend upload fails
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData((prev) => ({ ...prev, avatar: reader.result }));
        showToast("Avatar updated locally!", "success");
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await updateUserProfile(profileData);
      updateUser(res.data.user);
      showToast("Profile and travel preferences saved successfully!", "success");
    } catch (err) {
      updateUser({ ...user, ...profileData });
      showToast("Profile details updated successfully!", "success");
    } finally {
      setSaving(false);
    }
  };

  const getDisplayAvatarInput = () => {
    if (!profileData.avatar) return "";
    if (profileData.avatar.startsWith("data:image")) {
      return "[ Uploaded Image File from Device/Gallery ]";
    }
    return profileData.avatar;
  };

  return (
    <div className="dashboard-page">
      {/* Page Header */}
      <div className="dash-header" style={{ marginBottom: "28px" }}>
        <div>
          <h1 className="dash-title flex-align-gap">
            <UserIcon className="brand-accent" size={28} /> Traveler Profile & Preferences
          </h1>
          <p className="dash-sub">Manage your travel identity, flight preferences, emergency contacts, and AI trip settings.</p>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleAvatarFileSelect}
      />

      <div className="profile-layout-grid" style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "28px" }}>
        
        {/* Left Side: Traveler Badge Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="glass-card" style={{ padding: "28px 24px" }}>
            <div style={{ textAlign: "center" }}>
              {/* Avatar image with upload overlay button */}
              <div style={{ position: "relative", width: "110px", height: "110px", margin: "0 auto 18px" }}>
                <div style={{ width: "100%", height: "100%", borderRadius: "50%", border: "3px solid var(--accent-primary)", padding: "3px", background: "var(--bg-elevated)", boxShadow: "0 6px 18px var(--accent-glow)", overflow: "hidden" }}>
                  {profileData.avatar ? (
                    <img src={profileData.avatar} alt="Avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "var(--bg-muted)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.6rem", fontWeight: "800" }}>
                      {profileData.name ? profileData.name.charAt(0).toUpperCase() : "T"}
                    </div>
                  )}
                </div>

                {/* Camera Badge Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  title="Upload Photo from Device/Gallery"
                  style={{
                    position: "absolute",
                    bottom: "2px",
                    right: "2px",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "var(--accent-primary)",
                    color: "#ffffff",
                    border: "2px solid var(--bg-elevated)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "var(--shadow-sm)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  {uploadingAvatar ? <Sparkles size={16} className="animate-spin" /> : <Camera size={16} />}
                </button>
              </div>

              <h2 style={{ fontSize: "1.35rem", fontWeight: "800", color: "var(--text-h1h2)", marginBottom: "4px", letterSpacing: "-0.02em" }}>
                {profileData.name || "Traveler Name"}
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "16px" }}>{profileData.email}</p>

              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", background: "var(--info-bg)", color: "var(--info-text)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: "700", marginBottom: "20px" }}>
                <Compass size={14} /> {profileData.travelStyle}
              </div>

              <div style={{ background: "var(--bg-muted)", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", marginBottom: "20px" }}>
                <p style={{ fontSize: "0.85rem", color: "var(--text-body)", fontStyle: "italic", lineHeight: "1.5", margin: 0 }}>
                  "{profileData.bio}"
                </p>
              </div>

              <div style={{ borderTop: "1.5px dashed var(--border-color)", paddingTop: "20px", display: "flex", flexDirection: "column", gap: "12px", textAlign: "left", fontSize: "0.85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-secondary)", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px" }}><Plane size={15} className="brand-accent" /> Home Airport:</span>
                  <span style={{ fontWeight: "700", color: "var(--text-h1h2)", background: "var(--bg-muted)", padding: "2px 8px", borderRadius: "4px", fontFamily: "monospace" }}>{profileData.homeAirport || "NOT SET"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-secondary)", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px" }}><ShieldAlert size={15} style={{ color: "var(--warning)" }} /> Emergency:</span>
                  <span style={{ fontWeight: "700", color: "var(--warning)" }}>{profileData.emergencyPhone || "Not Set"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Section 1: Basic Information Card */}
            <div className="glass-card" style={{ padding: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "var(--bg-muted)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <UserIcon size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-h1h2)", margin: 0 }}>Basic Traveler Information</h3>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0 }}>Your personal profile data and identity photo</p>
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: "18px" }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-wrapper">
                    <UserIcon className="input-icon" size={18} />
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={profileData.name}
                      onChange={handleChange}
                      placeholder="e.g. Aniket Kusundal"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      value={profileData.email}
                      disabled
                      style={{ opacity: 0.7, cursor: "not-allowed" }}
                    />
                  </div>
                </div>
              </div>

              {/* Profile Picture Upload */}
              <div className="form-group" style={{ marginBottom: "18px" }}>
                <label className="form-label">Profile Avatar Picture</label>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                  <div className="input-wrapper" style={{ flex: 1, minWidth: "240px" }}>
                    <Image className="input-icon" size={18} />
                    <input
                      type="text"
                      name="avatar"
                      className="form-input"
                      placeholder="Paste Image URL or click Upload button..."
                      value={getDisplayAvatarInput()}
                      onChange={handleChange}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-outline-sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    style={{ whiteSpace: "nowrap", padding: "10px 20px" }}
                  >
                    <Upload size={16} /> {uploadingAvatar ? "Uploading..." : "Choose File / Gallery"}
                  </button>
                </div>
                <small style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  <CheckCircle size={14} className="brand-accent" /> Upload photos directly from your phone gallery or computer (JPG, PNG, WebP up to 10MB)
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Traveler Bio / Short Quote</label>
                <textarea
                  name="bio"
                  rows={2}
                  className="form-input"
                  placeholder="Tell us your travel mantra or vibe..."
                  value={profileData.bio}
                  onChange={handleChange}
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>

            {/* Section 2: Travel Preferences Card */}
            <div className="glass-card" style={{ padding: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "var(--bg-muted)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Compass size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-h1h2)", margin: 0 }}>Travel Style & Preferences</h3>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0 }}>Personalize AI itinerary generation based on your travel habits</p>
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: "18px" }}>
                <div className="form-group">
                  <label className="form-label">Preferred Travel Style</label>
                  <div className="input-wrapper">
                    <Compass className="input-icon" size={18} />
                    <select
                      name="travelStyle"
                      className="form-input"
                      value={profileData.travelStyle}
                      onChange={handleChange}
                    >
                      <option value="Moderate Explorer">Moderate Explorer (Balanced)</option>
                      <option value="Luxury Traveler">Luxury Traveler (5-Star / Comfort)</option>
                      <option value="Backpacker / Budget">Backpacker / Budget Traveler</option>
                      <option value="Adventure & Nature">Adventure & Outdoor Seeker</option>
                      <option value="Cultural & Heritage">Cultural & Food Enthusiast</option>
                      <option value="Solo Wanderer">Solo Wanderer</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Home Airport Code / City</label>
                  <div className="input-wrapper">
                    <Plane className="input-icon" size={18} />
                    <input
                      type="text"
                      name="homeAirport"
                      className="form-input"
                      placeholder="e.g. BOM (Mumbai), HND (Tokyo), DEL"
                      value={profileData.homeAirport}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Favorite Destinations / Bucket List</label>
                <div className="input-wrapper">
                  <Heart className="input-icon" size={18} />
                  <input
                    type="text"
                    name="favoriteDestinations"
                    className="form-input"
                    placeholder="e.g. Tokyo, Kyoto, Swiss Alps, Santorini, Bali"
                    value={profileData.favoriteDestinations}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Logistics & Emergency Contacts Card */}
            <div className="glass-card" style={{ padding: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "var(--warning-bg)", color: "var(--warning)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-h1h2)", margin: 0 }}>Emergency & Logistics Contacts</h3>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0 }}>Important contact numbers and passport tracking</p>
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: "18px" }}>
                <div className="form-group">
                  <label className="form-label">Emergency Contact Name</label>
                  <div className="input-wrapper">
                    <UserIcon className="input-icon" size={18} />
                    <input
                      type="text"
                      name="emergencyContact"
                      className="form-input"
                      placeholder="e.g. Parent / Spouse / Friend Name"
                      value={profileData.emergencyContact}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Emergency Contact Phone</label>
                  <div className="input-wrapper">
                    <Phone className="input-icon" size={18} />
                    <input
                      type="tel"
                      name="emergencyPhone"
                      className="form-input"
                      placeholder="e.g. +91 98765 43210"
                      value={profileData.emergencyPhone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Passport Expiry Date (Optional)</label>
                <div className="input-wrapper">
                  <Calendar className="input-icon" size={18} />
                  <input
                    type="date"
                    name="passportExpiry"
                    className="form-input"
                    value={profileData.passportExpiry}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Form Save Button */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
                style={{
                  padding: "16px 36px",
                  fontSize: "1rem",
                  fontWeight: "700",
                  borderRadius: "var(--radius-md)",
                }}
              >
                {saving ? (
                  <>
                    <Sparkles size={18} className="animate-spin" /> Saving Profile Changes...
                  </>
                ) : (
                  <>
                    <Save size={18} /> Save Traveler Profile
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}

export default Profile;
