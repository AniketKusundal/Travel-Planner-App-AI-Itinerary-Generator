import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loginuser } from "../services/authApi";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handelChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (alert) setAlert(null);
  };

  const handelLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    try {
      const res = await Loginuser(formData);
      // Backend returns { Message, data: { _id, name, email, token } }
      login(res.data);
      navigate("/dashboard");
    } catch (error) {
      const msg = error.response?.data?.message || "Invalid credentials. Please try again.";
      setAlert({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">✈️</div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue planning your trips</p>
        </div>

        {alert && (
          <div className={`auth-alert ${alert.type}`}>
            <span>{alert.type === "error" ? "⚠️" : "✅"}</span> {alert.message}
          </div>
        )}

        <form className="auth-form" onSubmit={handelLoginSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                id="login-email" type="email" name="email"
                value={formData.email} onChange={handelChange}
                placeholder="you@example.com" className="form-input"
                required autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                name="password" value={formData.password} onChange={handelChange}
                placeholder="Enter your password" className="form-input"
                required autoComplete="current-password"
              />
              <button type="button" className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button id="login-submit-btn" type="submit"
            className={`btn-submit ${loading ? "loading" : ""}`} disabled={loading}>
            {loading ? "" : "Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
