import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation  } from "react-router-dom";
import "./NavBar.css";
import logoImg from "../assets/timecrax_logo.png";
import { useAuth } from "../context/AuthContext";

export function NavBar() {
  const navigate = useNavigate();

  const location = useLocation();
  const hideCenterOnRoutes = ["/profile", "/create-theme"];
  const hideNavbarCenter = hideCenterOnRoutes.includes(location.pathname);

  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  function handleLogout() {
    logout();
    setIsMobileMenuOpen(false);
    navigate("/");
  }

  const displayName = user?.firstName?.trim() || user?.email || "Perfil";

  // Close language dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside() {
      setShowLanguageDropdown(false);
    }

    if (showLanguageDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [showLanguageDropdown]);

  return (
    <header className="navbar-steam">
      {isMobileMenuOpen && (
        <>
          <div className="navbar-mobile-backdrop" onClick={closeMobileMenu} />
          <div className="navbar-mobile-panel">
            <button
              type="button"
              className="mobile-close"
              onClick={closeMobileMenu}
              aria-label="Close menu"
            >
              ×
            </button>

            <nav className="mobile-links">
              <Link to="/" onClick={closeMobileMenu}>Home</Link>
              <Link to="/#download" onClick={closeMobileMenu}>Download</Link>
              <Link to="/#features" onClick={closeMobileMenu}>Features</Link>
              <Link to="/#contact" onClick={closeMobileMenu}>Contact</Link>
            </nav>

            <div className="mobile-login">
              {user ? (
                <>
                  <p className="mobile-login-title">LOGGED IN</p>
                  <p style={{ margin: "6px 0" }}>
                    {user.firstName ?? user.email}
                  </p>
                  <button
                    type="button"
                    className="navbar-login-button login-button-small"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="mobile-login-link" onClick={closeMobileMenu}>
                  Login
                </Link>
              )}
            </div>
          </div>
        </>
      )}

      <div className="navbar-left" onClick={() => navigate("/")}>
        <img src={logoImg} alt="TimeCrax Machine logo" className="navbar-logo-img" />
        <div className="navbar-title-block">
          <span className="navbar-title-main">TimeCrax</span>
          <span className="navbar-title-sub">Machine</span>
        </div>

        <button
          type="button"
          className="navbar-burger"
          onClick={(e) => {
            e.stopPropagation();
            setIsMobileMenuOpen((prev) => !prev);
          }}
          aria-label="Menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {!hideNavbarCenter && (
        <nav className="navbar-center">
          <div className="navbar-divider" />
          <Link to="/">Home</Link>
          <span className="navbar-sep">•</span>
          <Link to="/#download">Download</Link>
          <span className="navbar-sep">•</span>
          <Link to="/#features">Features</Link>
          <span className="navbar-sep">•</span>
          <Link to="/#contact">Contact</Link>
          <div className="navbar-divider" />
        </nav>
      )}

      <div className="navbar-right">
        {user ? (
          <div className="navbar-profile-wrapper">
            <button
              type="button"
              className="navbar-profile"
              onClick={() => navigate("/profile")}
              aria-label="Abrir perfil"
            >
              <span className="navbar-profile-icon" aria-hidden="true">
                {/* ícone inline (evita dependências) */}
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="currentColor"
                    d="M12 12a4 4 0 1 0-4-4a4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"
                  />
                </svg>
              </span>

              <span className="navbar-profile-name" data-tooltip={displayName}>
                {displayName}
              </span>
            </button>

            <button
              type="button"
              className="navbar-logout"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="navbar-right-links">
            <Link to="/login" className="navbar-login-link">
              Login
            </Link>

            <div className="navbar-language-dropdown">
              <button
                type="button"
                className="navbar-language-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLanguageDropdown((prev) => !prev);
                }}
              >
                Language
                <svg width="12" height="8" viewBox="0 0 12 8" className="dropdown-arrow">
                  <path fill="currentColor" d="M1.41 0L6 4.58 10.59 0 12 1.42l-6 6-6-6z" />
                </svg>
              </button>

              {showLanguageDropdown && (
                <div className="navbar-language-menu">
                  <button type="button" onClick={() => setShowLanguageDropdown(false)}>
                    English
                  </button>
                  <button type="button" onClick={() => setShowLanguageDropdown(false)}>
                    Português
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
