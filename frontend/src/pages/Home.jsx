import { Link } from "react-router-dom";

const stats = [
  { value: "50K+", label: "Trips Planned" },
  { value: "120+", label: "Destinations" },
  { value: "4.9★", label: "User Rating" },
];

const features = [
  { icon: "🤖", title: "AI Itinerary", desc: "Get a personalized day-by-day plan in seconds" },
  { icon: "🗺️", title: "Smart Routes", desc: "Optimized travel paths that save your time" },
  { icon: "💰", title: "Budget Aware", desc: "Plans tailored to your budget and preferences" },
];

function Home() {
  return (
    <div className="hero-section">
      <div className="hero-content">
        {/* Badge */}
        <div className="hero-badge">
          <span>✨</span>
          AI-Powered Travel Planning
        </div>

        {/* Title */}
        <h1 className="hero-title">
          Plan Your Perfect Trip{" "}
          <span className="gradient-text">with AI Magic</span>
        </h1>

        {/* Description */}
        <p className="hero-description">
          Describe your dream destination and let our AI craft a complete,
          personalized itinerary — from flights to hidden gems — in seconds.
        </p>

        {/* CTA */}
        <div className="hero-cta">
          <Link to="/register" className="btn-hero-primary">
            🚀 Start for Free
          </Link>
          <Link to="/login" className="btn-hero-secondary">
            Sign In →
          </Link>
        </div>

        {/* Stats */}
        <div className="hero-cards">
          {stats.map((s) => (
            <div key={s.label} className="hero-stat-card">
              <div className="hero-stat-value">{s.value}</div>
              <div className="hero-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div
          className="hero-cards"
          style={{ marginTop: "24px", gap: "12px" }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              className="hero-stat-card"
              style={{ textAlign: "left", maxWidth: "220px" }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>
                {f.icon}
              </div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: "var(--text-primary)",
                  marginBottom: "4px",
                }}
              >
                {f.title}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
