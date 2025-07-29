import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";

const SunIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--primary)" aria-hidden="true">
    <circle cx="12" cy="12" r="5" />
    <g>
      <rect x="11" y="2" width="2" height="3" rx="1" />
      <rect x="11" y="19" width="2" height="3" rx="1" />
      <rect x="2" y="11" width="3" height="2" rx="1" />
      <rect x="19" y="11" width="3" height="2" rx="1" />
      <rect x="4.22" y="4.22" width="2" height="2" rx="1" transform="rotate(-45 5.22 5.22)" />
      <rect x="17.78" y="17.78" width="2" height="2" rx="1" transform="rotate(-45 18.78 18.78)" />
      <rect x="4.22" y="17.78" width="2" height="2" rx="1" transform="rotate(45 5.22 18.78)" />
      <rect x="17.78" y="4.22" width="2" height="2" rx="1" transform="rotate(45 18.78 5.22)" />
    </g>
  </svg>
);

const MoonIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--primary)" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
  </svg>
);

const buttonStyle = {
  background: "var(--card)",
  color: "var(--primary)",
  border: "2px solid var(--primary)",
  fontWeight: 600,
  boxShadow: "none",
  padding: "0.35em 1.2em",
  borderRadius: "1.5em",
  marginLeft: "1rem",
  textDecoration: "none",
  fontSize: "1rem",
  height: "38px",
  display: "flex",
  alignItems: "center",
  transition: "background 0.2s, color 0.2s, border 0.2s",
  outline: "none",
  cursor: "pointer"
};

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isGuest, signOut } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setMenuOpen(false);
    navigate("/");
  };

  let displayName = "User";
  if (user) {
    if (user.email) {
      displayName = user.email.split("@")[0];
    } else if (user.username) {
      displayName = user.username;
    } else if (user.id && isGuest) {
      displayName = "Guest";
    }
  }

  return (
    <nav
      className="navbar"
      role="navigation"
      aria-label="Main Navigation"
      style={{
        background: "var(--navbar-bg)",
        color: "var(--text)",
        position: "fixed",
        top: 0,
        zIndex: 40,
        width: "100%",
        backdropFilter: "blur(5px)",
        WebkitBackdropFilter: "blur(5px)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        overflowX: "clip",
        minHeight: "64px",
        height: "64px",
      }}
    >
      <div
        className="navbar-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0.5rem 1rem",
          position: "relative",
          height: "64px",
        }}
      >
        <div
          className="navbar-left"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            height: "100%",
          }}
        >
          <Link
            to="/"
            className="navbar-brand"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              height: "100%",
            }}
          >
            <img
              src={darkMode ? "/logo-dark.png" : "/logo-light.png"}
              alt="PatentCraft Logo"
              style={{
                height: 38,
                width: 38,
                objectFit: "contain",
                marginRight: 4,
                verticalAlign: "middle",
              }}
            />
            <span
              style={{
                fontWeight: 700,
                fontSize: "1.18rem",
                color: "var(--primary)",
                letterSpacing: "0.02em",
                lineHeight: 1,
                verticalAlign: "middle",
                marginTop: 2,
              }}
            >
              PatentCraft
            </span>
          </Link>
        </div>
        <button
          className="navbar-toggle"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((open) => !open)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            marginLeft: "1rem",
            height: "38px",
          }}
        >
          <span className="navbar-toggle-icon" />
        </button>
        <div className={`navbar-links${menuOpen ? " open" : ""}`}>
          {user && !isGuest ? (
            <div className="navbar-profile" style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginLeft: "1rem"
            }}>
              <span className="profile-icon" style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                background: "var(--primary-light)",
                width: "32px",
                height: "32px",
                fontWeight: 700,
                fontSize: "1.1rem",
                color: "var(--primary)",
                textTransform: "uppercase"
              }}>{displayName[0]?.toUpperCase()}</span>
              <span>{displayName}</span>
              <button
                className="navbar-signout-btn"
                style={buttonStyle}
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="nav-link navbar-signin-btn"
              style={buttonStyle}
              onClick={() => setMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            type="button"
            style={{
              background: "none",
              border: "none",
              borderRadius: 0,
              padding: "0.3em",
              marginLeft: "1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              height: "38px",
              width: "38px",
              justifyContent: "center",
              color: "var(--primary)",
              transition: "color 0.3s",
            }}
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
      <style>
        {`
          @media (max-width: 768px) {
            .navbar-toggle {
              display: block !important;
            }
            .navbar-links {
              display: none !important;
              flex-direction: column;
              position: absolute;
              top: 100%;
              left: 0;
              right: 0;
              background: var(--navbar-links-mobile-bg);
              border-bottom: 1px solid var(--border);
              padding: 1rem 0;
              gap: 1rem;
              z-index: 50;
              -webkit-backdrop-filter: none;
              backdrop-filter: none;
            }
            .navbar-links.open {
              display: flex !important;
            }
          }
        `}
      </style>
    </nav>
  );
};

export default Navbar;