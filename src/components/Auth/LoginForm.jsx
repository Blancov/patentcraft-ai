import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const EyeIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M4 12s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeSlashIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 1l22 22"/>
    <path d="M4 12s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const LoginForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError({});
  };

  const validate = () => {
    const errors = {};
    if (!form.email) errors.email = "Email is required.";
    if (!form.password) errors.password = "Password is required.";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setLoading(true);

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setError(errors);
      setLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard"); // Redirect after login
      }, 1200);
    }, 1000);
  };

  return (
    <div className="auth-form" style={{
      maxWidth: 420,
      margin: "3.5rem auto",
      background: "var(--card)",
      borderRadius: "1.25rem",
      boxShadow: "0 2px 12px rgba(60,60,60,0.07)",
      padding: "2.5rem 2rem"
    }}>
      <h2
        className="form-title"
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "var(--primary)",
          marginBottom: 8,
          textAlign: "center"
        }}
      >
        Sign In
      </h2>
      {success ? (
        <div className="text-center" style={{ margin: "2rem 0" }}>
          <h3 style={{ color: "var(--success)" }}>Login successful!</h3>
          <p>
            Redirecting to your dashboard...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label htmlFor="email" className="form-label" style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
              Email
            </label>
            <input
              className="form-input"
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              required
              aria-invalid={!!error.email}
              style={{
                width: "100%",
                borderRadius: "1rem",
                border: error.email ? "1.5px solid var(--danger)" : "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: "1rem",
                padding: "0.9em 0.9em 0.9em 0.9em",
                boxShadow: "0 1px 4px rgba(60,60,60,0.04)",
                transition: "background 0.3s, color 0.3s, border 0.3s"
              }}
            />
            {error.email && (
              <div style={{
                color: "var(--danger)",
                fontSize: "0.97rem",
                marginTop: 4,
                background: "transparent",
                padding: "2px 0 0 0"
              }}>
                {error.email}
              </div>
            )}
          </div>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label htmlFor="password" className="form-label" style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                className="form-input"
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
                required
                aria-invalid={!!error.password}
                style={{
                  width: "100%",
                  borderRadius: "1rem",
                  border: error.password ? "1.5px solid var(--danger)" : "1px solid var(--border)",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontSize: "1rem",
                  padding: "0.9em 2.5em 0.9em 0.9em",
                  boxShadow: "0 1px 4px rgba(60,60,60,0.04)",
                  transition: "background 0.3s, color 0.3s, border 0.3s"
                }}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  color: "var(--primary)",
                  opacity: 0.8
                }}
                tabIndex={0}
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
            {error.password && (
              <div style={{
                color: "var(--danger)",
                fontSize: "0.97rem",
                marginTop: 4,
                background: "transparent",
                padding: "2px 0 0 0"
              }}>
                {error.password}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="auth-btn btn-primary"
            style={{
              width: "100%",
              fontSize: "1.1rem",
              borderRadius: "1rem",
              padding: "0.9em 2em",
              boxShadow: "0 2px 8px rgba(60,60,60,0.07)",
              background: "var(--primary)",
              color: "#fff",
              fontWeight: 600,
              marginTop: 8,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "background 0.3s, color 0.3s, opacity 0.2s"
            }}
            aria-disabled={loading}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="animate-spin" style={{
                  display: "inline-block",
                  borderRadius: "50%",
                  height: 20,
                  width: 20,
                  borderTop: "2px solid #fff",
                  borderBottom: "2px solid #fff",
                  marginRight: 8,
                  animation: "spin 1s linear infinite"
                }}></span>
                Logging in...
              </span>
            ) : 'Login'}
          </button>
          <div className="form-footer" style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "1rem" }}>
            Don't have an account?{" "}
            <Link to="/signup" className="form-link" style={{ color: "var(--primary)", fontWeight: 500 }}>
              Sign Up
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default LoginForm;