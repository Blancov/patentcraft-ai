import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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

const Navbar = () => {
  const [theme, setTheme] = useState(() =>
    window.localStorage.getItem("theme") || "dark"
  );
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.className = theme === "dark" ? "dark" : "";
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  const toggleMenu = () => setMenuOpen((open) => !open);

  // Example: Replace with your actual authentication logic
  const isAuthenticated = false;
  const userName = "User";

  const signInBtnStyle =
    theme === "dark"
      ? {
          background: "var(--card)",
          color: "var(--primary)",
          border: "2px solid var(--primary)",
          fontWeight: 600,
          boxShadow: "none",
          padding: "0.35em 1em",
          borderRadius: "0.7em",
          marginLeft: "1rem",
          textDecoration: "none",
          fontSize: "1rem",
          height: "38px",
          display: "flex",
          alignItems: "center",
        }
      : {
          background: "var(--primary)",
          color: "#fff",
          border: "2px solid var(--primary)",
          fontWeight: 600,
          boxShadow: "none",
          padding: "0.35em 1em",
          borderRadius: "0.7em",
          marginLeft: "1rem",
          textDecoration: "none",
          fontSize: "1rem",
          height: "38px",
          display: "flex",
          alignItems: "center",
        };

  return (
    <nav
      className="navbar"
      role="navigation"
      aria-label="Main Navigation"
      style={{
        background: "var(--navbar-bg)",
        color: "var(--text)",
        position: "stickyfixed",
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
              src={theme === "dark" ? "/logo-dark.png" : "/logo-light.png"}
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
          onClick={toggleMenu}
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
          <Link
            to="/login"
            className="nav-link navbar-signin-btn"
            style={signInBtnStyle}
            onClick={() => setMenuOpen(false)}
          >
            Sign In
          </Link>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
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
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          {isAuthenticated && (
            <div className="navbar-profile" style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginLeft: "1rem"
            }}>
              <span className="profile-icon" style={{
                display: "flex",
                alignItems: "center",
                borderRadius: "50%",
                background: "var(--primary-light)",
                padding: "0.2em"
              }}>{userName[0]}</span>
              <span>{userName}</span>
              <button className="navbar-signout-btn" style={{
                background: "none",
                border: "none",
                color: "var(--primary)",
                fontWeight: 600,
                cursor: "pointer",
                padding: "0.3em 0.8em",
                borderRadius: 6
              }}>Sign Out</button>
            </div>
          )}
        </div>
      </div>
      {/* Responsive hamburger menu for mobile */}
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