import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { translateError } from "../utils/translateError";
import "./LoginPage.css";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg(t("login.errorFillFields"));
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email.trim(), password);
      navigate("/profile");
    } catch (err) {
      setErrorMsg(translateError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">{t("login.title")}</h1>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-row">
            <label className="login-label">{t("login.email")}</label>
            <input
              className="login-input"
              type="email"
              placeholder={t("login.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              autoComplete="email"
            />
          </div>

          <div className="login-row">
            <label className="login-label">{t("login.password")}</label>
            <input
              className="login-input"
              type="password"
              placeholder={t("login.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              autoComplete="current-password"
            />
          </div>

          {errorMsg && <div className="login-error">{errorMsg}</div>}

          <button className="login-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("login.signingIn") : t("login.signIn")}
          </button>

          <div className="login-links">
            <Link to="/forgot-password" className="login-forgot-link">
              {t("login.forgotPassword")}
            </Link>
          </div>

          <div className="login-register">
            <span className="login-register-text">{t("login.noAccount")}</span>{" "}
            <Link to="/register" className="login-register-link">
              {t("login.register")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
