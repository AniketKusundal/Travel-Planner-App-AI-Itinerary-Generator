import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SignupUser } from "../services/authApi";

function getStrength(password) {
  if (!password) return { score: 0, label: "", cls: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const classes = ["", "weak", "fair", "good", "strong"];
  return { score, label: labels[score], cls: classes[score] };
}

function Register() {
  const navigate = useNavigate();
  const [formData, setformData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const strength = getStrength(formData.password);

  const handelChange = (e) => {
    setformData({ ...formData, [e.target.name]: e.target.value });
    if (alert) setAlert(null);
  };

  const handelSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    try {
      await SignupUser(formData);
      setAlert({ type: "success", message: "Account created! Redirecting to login..." });
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      const msg = error.response?.data?.message || "Something went wrong.";
      setAlert({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">🌍</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Start planning your trips with AI</p>
        </div>

        {alert && (
          <div className={`auth-alert ${alert.type}`}>
            <span>{alert.type === "error" ? "⚠️" : "✅"}</span>
            {alert.message}
          </div>
        )}

        <form className="auth-form" onSubmit={handelSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="register-name" className="form-label">Full Name</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input id="register-name" type="text" name="name"
                value={formData.name} onChange={handelChange}
                placeholder="John Doe" className="form-input" required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="register-email" className="form-label">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input id="register-email" type="email" name="email"
                value={formData.email} onChange={handelChange}
                placeholder="you@example.com" className="form-input" required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="register-password" className="form-label">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input id="register-password"
                type={showPassword ? "text" : "password"} name="password"
                value={formData.password} onChange={handelChange}
                placeholder="Create a strong password" className="form-input" required />
              <button type="button" className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`strength-segment ${i <= strength.score ? strength.cls : ""}`} />
                  ))}
                </div>
                <span className="strength-label">{strength.label && `Strength: ${strength.label}`}</span>
              </div>
            )}
          </div>

          <button id="register-submit-btn" type="submit"
            className={`btn-submit ${loading ? "loading" : ""}`} disabled={loading}>
            {loading ? "" : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
