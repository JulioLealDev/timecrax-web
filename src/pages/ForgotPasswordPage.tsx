import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { authService } from "../services/auth.service";
import { translateError } from "../utils/translateError";
import "./ForgotPasswordPage.css";

export function ForgotPasswordPage() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg(t("forgotPassword.errorFillEmail"));
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg(t("forgotPassword.errorInvalidEmail"));
      return;
    }

    try {
      setIsSubmitting(true);
      await authService.forgotPassword(email.trim(), i18n.language);
      setSuccess(true);
    } catch (err) {
      setErrorMsg(translateError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="forgot-password-page">
        <div className="forgot-password-card">
          <div className="forgot-password-header">
            <h1 className="forgot-password-title">{t("forgotPassword.title")}</h1>
          </div>
          <div className="forgot-password-success-content">
            <p className="forgot-password-success-message">
              {t("forgotPassword.successMessage")}
            </p>
            <Link to="/login" className="forgot-password-back-link">
              {t("forgotPassword.backToLogin")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h1 className="forgot-password-title">{t("forgotPassword.title")}</h1>
        </div>

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="forgot-password-row">
            <label className="forgot-password-label">{t("forgotPassword.email")}</label>
            <input
              className="forgot-password-input"
              type="email"
              placeholder={t("forgotPassword.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              autoComplete="email"
            />
          </div>

          <p className="forgot-password-subtitle">
            {t("forgotPassword.subtitle")}
          </p>

          {errorMsg && <div className="forgot-password-error">{errorMsg}</div>}

          <button
            className="forgot-password-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? t("forgotPassword.sending") : t("forgotPassword.sendLink")}
          </button>

          <div className="forgot-password-links">
            <Link to="/login" className="forgot-password-back-link">
              {t("forgotPassword.backToLogin")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
