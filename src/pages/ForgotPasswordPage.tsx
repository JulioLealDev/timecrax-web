import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { authService } from "../services/auth.service";
import "./ForgotPasswordPage.css";

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

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

      const response = await authService.forgotPassword(email);

      setSuccessMsg(response.message);
      setEmail("");
    } catch (err: any) {
      setErrorMsg(err?.message ?? t("forgotPassword.errorFailed"));
    } finally {
      setIsSubmitting(false);
    }
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
          {successMsg && <div className="forgot-password-success">{successMsg}</div>}

          <button
            className="forgot-password-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? t("forgotPassword.sending") : t("forgotPassword.sendLink")}
          </button>
        </form>
      </div>
    </div>
  );
}
