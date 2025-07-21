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

const passwordRequirements = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "At least one number", test: (v) => /\d/.test(v) },
  { label: "At least one uppercase letter", test: (v) => /[A-Z]/.test(v) },
];

const SignUpForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const [success, setSuccess] = useState(false);

  const passwordFeedback = passwordRequirements.map((req, idx) => (
    <li
      key={idx}
      style={{
        color: req.test(form.password) ? "var(--success)" : "var(--text-light)",
        fontWeight: req.test(form.password) ? 600 : 400,
        fontSize: "0.97rem",
        marginBottom: 2,
        listStyle: "none"
      }}
    >
      {req.label}
    </li>
  ));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    setError({});
  };

  const validate = () => {
    const errors = {};
    if (!form.email) errors.email = "Email is required.";
    if (!form.password) errors.password = "Password is required.";
    if (!form.confirmPassword) errors.confirmPassword = "Please confirm your password.";
    if (form.password !== form.confirmPassword) errors.confirmPassword = "Passwords do not match.";
    if (!form.agree) errors.agree = "You must agree to the Terms and Privacy Policy.";
    passwordRequirements.forEach(req => {
      if (!req.test(form.password)) errors.password = "Password does not meet requirements.";
    });
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
        navigate("/login");
      }, 1800);
    }, 1200);
  };

  return (
    <div className="auth-form" style={{
      maxWidth: 420,
      margin: "0 auto",
      background: "var(--card)",
      borderRadius: "1.25rem",
      boxShadow: "0 2px 12px rgba(60,60,60,0.07)",
      padding: "2.5rem 2rem",
      transition: "box-shadow 0.3s, transform 0.3s",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = "0 4px 24px rgba(60,60,60,0.13)";
      e.currentTarget.style.transform = "translateY(-2px)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = "0 2px 12px rgba(60,60,60,0.07)";
      e.currentTarget.style.transform = "none";
    }}
    >
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
        Sign Up
      </h2>
      {success ? (
        <div className="text-center" style={{ margin: "2rem 0" }}>
          <h3 style={{ color: "var(--success)" }}>Account created!</h3>
          <p>
            Redirecting to <Link to="/login" className="form-link">Sign In</Link>...
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
                padding: "0.9em 2.5em 0.9em 0.9em",
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
                autoComplete="new-password"
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
            <ul style={{ margin: "8px 0 0 0", padding: 0 }}>
              {passwordFeedback}
            </ul>
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
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label htmlFor="confirmPassword" className="form-label" style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
              Confirm Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                className="form-input"
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                required
                aria-invalid={!!error.confirmPassword}
                style={{
                  width: "100%",
                  borderRadius: "1rem",
                  border: error.confirmPassword ? "1.5px solid var(--danger)" : "1px solid var(--border)",
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
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
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
                {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
            {error.confirmPassword && (
              <div style={{
                color: "var(--danger)",
                fontSize: "0.97rem",
                marginTop: 4,
                background: "transparent",
                padding: "2px 0 0 0"
              }}>
                {error.confirmPassword}
              </div>
            )}
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "0.98rem",
                cursor: "pointer",
                gap: 0,
                minHeight: 28
              }}
            >
              <input
                type="checkbox"
                name="agree"
                id="agree"
                checked={form.agree}
                onChange={handleChange}
                disabled={loading}
                required
                style={{
                  width: 18,
                  height: 18,
                  cursor: "pointer",
                  marginRight: 8,
                  marginTop: 0,
                  marginBottom: 0,
                  verticalAlign: "middle",
                  display: "inline-block"
                }}
                aria-invalid={!!error.agree}
              />
              <label htmlFor="agree" style={{
                margin: 0,
                cursor: "pointer",
                lineHeight: 1.3,
                display: "inline-block"
              }}>
                I agree to the <Link to="/terms" className="form-link" style={{ color: "var(--primary)" }}>Terms of Service</Link> and <Link to="/privacy" className="form-link" style={{ color: "var(--primary)" }}>Privacy Policy</Link>
              </label>
            </div>
            {error.agree && (
              <div style={{
                color: "var(--danger)",
                fontSize: "0.97rem",
                marginTop: 4,
                background: "transparent",
                padding: "2px 0 0 0"
              }}>
                {error.agree}
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
                Creating Account...
              </span>
            ) : 'Sign Up'}
          </button>
          <div className="form-footer" style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "1rem" }}>
            Already have an account?{" "}
            <Link to="/login" className="form-link" style={{ color: "var(--primary)", fontWeight: 500 }}>
              Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default SignUpForm;