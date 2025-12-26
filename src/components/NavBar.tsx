import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation  } from "react-router-dom";
import "./NavBar.css";
import logoImg from "../assets/timecrax_logo.png";
import { useAuth } from "../context/AuthContext";

export function NavBar() {
  const navigate = useNavigate();

  const location = useLocation();
  const hideCenterOnRoutes = ["/profile", "/create-theme"];
  const hideNavbarCenter = hideCenterOnRoutes.includes(location.pathname);


  const { user, login, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showLoginPanel, setShowLoginPanel] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg("Preencha email e senha.");
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);

      // limpa e fecha painéis
      setPassword("");
      setShowLoginPanel(false);
      setIsMobileMenuOpen(false);

      // opcional: navegar para home ou dashboard
      navigate("/");
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Falha no login.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  function handleLogout() {
    logout();
    setEmail("");
    setPassword("");
    setShowLoginPanel(false);
    setIsMobileMenuOpen(false);
    navigate("/");
  }

  const displayName = user?.firstName?.trim() || user?.email || "Perfil";

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
              aria-label="Fechar menu"
            >
              ×
            </button>

            <nav className="mobile-links">
              <a href="#home" onClick={closeMobileMenu}>Home</a>
              <a href="#download" onClick={closeMobileMenu}>Download</a>
              <a href="#features" onClick={closeMobileMenu}>Features</a>
              <a href="#ranking" onClick={closeMobileMenu}>Ranking</a>
              <a href="#contact" onClick={closeMobileMenu}>Contact</a>
            </nav>

            <div className="mobile-login">
              {user ? (
                <>
                  <p className="login-title">LOGADO</p>
                  <p style={{ margin: "6px 0" }}>
                    {user.firstName ?? user.email}
                  </p>
                  <button
                    type="button"
                    className="login-button login-button-small"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <p className="login-title">LOGIN</p>

                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  {errorMsg && (
                    <p style={{ marginTop: 8, fontSize: 12 }}>
                      {errorMsg}
                    </p>
                  )}

                  <div className="mobile-login-actions">
                    <button
                      type="button"
                      className="login-button login-button-small"
                      onClick={(e) => {
                        // simula submit do form
                        handleLogin(e as any);
                      }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "..." : "Enter"}
                    </button>

                    <Link
                      to="/forgot-password"
                      className="login-forgot-password-sandwich"
                      onClick={closeMobileMenu}
                    >
                      Forgot Password
                    </Link>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <Link to="/register" onClick={closeMobileMenu}>
                      REGISTER
                    </Link>
                  </div>
                </>
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
          <a href="#home">Home</a>
          <span className="navbar-sep">•</span>
          <a href="#download">Download</a>
          <span className="navbar-sep">•</span>
          <a href="#features">Features</a>
          <span className="navbar-sep">•</span>
          <a href="#ranking">Ranking</a>
          <span className="navbar-sep">•</span>
          <a href="#contact">Contact</a>
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

              <span className="navbar-profile-name" title={displayName}>
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
          <form className="navbar-right" onSubmit={handleLogin}>
            <div className="login-grid desktop-login">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />

              <button type="submit" className="login-button" disabled={isSubmitting}>
                {isSubmitting ? "..." : "Login"}
              </button>

              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />

              <Link to="/register" className="login-register-link">
                REGISTER
              </Link>

              <Link to="/forgot-password" className="login-forgot-password-link">
                FORGOT PASSWORD
              </Link>

              {errorMsg && (
                <div style={{ gridColumn: "1 / span 4", fontSize: 12 }}>
                  {errorMsg}
                </div>
              )}
            </div>

            <div className="login-compact">
              <button
                type="button"
                className="login-text-link"
                onClick={() => setShowLoginPanel((prev) => !prev)}
              >
                Login
              </button>

              <span className="navbar-sep">•</span>

              <Link to="/register" className="login-text-link">
                REGISTER
              </Link>
            </div>

            {showLoginPanel && (
              <div className="login-dropdown">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />

                <input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                />

                {errorMsg && (
                  <p style={{ marginTop: 8, fontSize: 12 }}>{errorMsg}</p>
                )}

                <div className="login-dropdown-actions">
                  <button
                    type="submit"
                    className="login-button login-button-small"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "..." : "Enter"}
                  </button>

                  <Link to="/forgot-password" className="login-forgot-password-link">
                    Forgot Password?
                  </Link>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </header>
  );
}
