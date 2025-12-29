import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation  } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./NavBar.css";
import logoImg from "../assets/timecrax_logo.png";
import { useAuth } from "../context/AuthContext";
import { withBaseUrl } from "../utils/withBaseUrl";

type Lang = "pt_pt" | "pt_br" | "en" | "es" | "fr";

const langLabel: Record<Lang, string> = {
  pt_br: "PT_BR",
  pt_pt: "PT_PT",
  en: "EN",
  es: "ES",
  fr: "FR",
};

export function NavBar() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const location = useLocation();
  const hideCenterOnRoutes = ["/profile", "/create-theme"];
  const hideNavbarCenter = hideCenterOnRoutes.includes(location.pathname);

  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const currentLanguage: Lang = ((): Lang => {
    const lng = (i18n.resolvedLanguage || i18n.language || "en").toLowerCase();

    if (lng.startsWith("pt_pt")) return "pt_pt";
    if (lng.startsWith("pt_br")) return "pt_br";
    if (lng.startsWith("es")) return "es";
    if (lng.startsWith("fr")) return "fr";
    return "en";
  })();

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  function handleLogout() {
    logout();
    setIsMobileMenuOpen(false);
    navigate("/");
  }

  function handleGoHome() {
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function changeLanguage(lang: Lang) {
    i18n.changeLanguage(lang);
    setShowLanguageDropdown(false);
  }

  const displayName = user?.firstName?.trim() || user?.email || t("navbar.openProfile");

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

  // Scroll to section when hash changes
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

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
              <a href="#" onClick={(e) => { e.preventDefault(); closeMobileMenu(); handleGoHome(); }}>{t("navbar.home")}</a>
              <Link to="/#download" onClick={closeMobileMenu}>{t("navbar.download")}</Link>
              <Link to="/#features" onClick={closeMobileMenu}>{t("navbar.features")}</Link>
              <Link to="/#contact" onClick={closeMobileMenu}>{t("navbar.contact")}</Link>
            </nav>

            <div className="mobile-login">
              {user ? (
                <>
                  <p className="mobile-login-title">{t("navbar.loggedIn")}</p>
                  <p style={{ margin: "6px 0" }}>
                    {user.firstName ?? user.email}
                  </p>
                  <button
                    type="button"
                    className="navbar-login-button login-button-small"
                    onClick={handleLogout}
                  >
                    {t("navbar.logout")}
                  </button>
                </>
              ) : (
                <Link to="/login" className="mobile-login-link" onClick={closeMobileMenu}>
                  {t("navbar.login")}
                </Link>
              )}
            </div>
          </div>
        </>
      )}

      <div className="navbar-left" onClick={handleGoHome}>
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
          <a href="#" onClick={(e) => { e.preventDefault(); handleGoHome(); }}>{t("navbar.home")}</a>
          <span className="navbar-sep">•</span>
          <Link to="/#download">{t("navbar.download")}</Link>
          <span className="navbar-sep">•</span>
          <Link to="/#features">{t("navbar.features")}</Link>
          <span className="navbar-sep">•</span>
          <Link to="/#contact">{t("navbar.contact")}</Link>
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
              aria-label={t("navbar.openProfile")}
            >
              <span className="navbar-profile-icon" aria-hidden="true">
                {user?.picture ? (
                  <img
                    src={withBaseUrl(user.picture)}
                    alt="Profile"
                    className="navbar-profile-img"
                  />
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path
                      fill="currentColor"
                      d="M12 12a4 4 0 1 0-4-4a4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"
                    />
                  </svg>
                )}
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
              {t("navbar.logout")}
            </button>
          </div>
        ) : (
          <Link to="/login" className="navbar-login-link">
            {t("navbar.login")}
          </Link>
        )}

        <div className="navbar-language-dropdown">
          <button
            type="button"
            className="navbar-language-button"
            onClick={(e) => {
              e.stopPropagation();
              setShowLanguageDropdown((prev) => !prev);
            }}
          >
            {langLabel[currentLanguage]}
            <svg width="12" height="8" viewBox="0 0 12 8" className="dropdown-arrow">
              <path fill="currentColor" d="M1.41 0L6 4.58 10.59 0 12 1.42l-6 6-6-6z" />
            </svg>
          </button>

          {showLanguageDropdown && (
            <div className="navbar-language-menu">
              <button
                type="button"
                onClick={() => changeLanguage("en")}
                className={currentLanguage === "en" ? "active" : ""}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => changeLanguage("pt_pt")}
                className={currentLanguage === "pt_pt" ? "active" : ""}
              >
                Português - PT
              </button>
                            <button
                type="button"
                onClick={() => changeLanguage("pt_br")}
                className={currentLanguage === "pt_br" ? "active" : ""}
              >
                Português - BR
              </button>
              <button
                type="button"
                onClick={() => changeLanguage("es")}
                className={currentLanguage === "es" ? "active" : ""}
              >
                Español
              </button>
              <button
                type="button"
                onClick={() => changeLanguage("fr")}
                className={currentLanguage === "fr" ? "active" : ""}
              >
                Français
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
