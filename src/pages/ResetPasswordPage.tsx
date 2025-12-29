import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";
import { translateError } from "../utils/translateError";
import "./ResetPasswordPage.css";

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!token) {
      setErrorMsg(t("resetPassword.errorNoToken"));
      return;
    }

    if (!newPassword.trim()) {
      setErrorMsg(t("resetPassword.errorFillPassword"));
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg(t("resetPassword.errorPasswordLength"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg(t("resetPassword.errorPasswordMatch"));
      return;
    }

    try {
      setIsSubmitting(true);
      await authService.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err) {
      setErrorMsg(translateError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-card">
          <div className="reset-password-header">
            <h1 className="reset-password-title">{t("resetPassword.title")}</h1>
          </div>
          <div className="reset-password-success-content">
            <div className="reset-password-success">
              {t("resetPassword.successMessage")}
            </div>
            <Link to="/login" className="reset-password-login-link">
              {t("resetPassword.goToLogin")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-card">
          <div className="reset-password-header">
            <h1 className="reset-password-title">{t("resetPassword.title")}</h1>
          </div>
          <div className="reset-password-error-content">
            <div className="reset-password-error">
              {t("resetPassword.errorNoToken")}
            </div>
            <Link to="/forgot-password" className="reset-password-back-link">
              {t("resetPassword.requestNewLink")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-card">
        <div className="reset-password-header">
          <h1 className="reset-password-title">{t("resetPassword.title")}</h1>
        </div>

        <form onSubmit={handleSubmit} className="reset-password-form">
          <p className="reset-password-subtitle">
            {t("resetPassword.subtitle")}
          </p>

          <div className="reset-password-row">
            <label className="reset-password-label">{t("resetPassword.newPassword")}</label>
            <input
              className="reset-password-input"
              type="password"
              placeholder={t("resetPassword.newPasswordPlaceholder")}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isSubmitting}
              autoComplete="new-password"
            />
          </div>

          <div className="reset-password-row">
            <label className="reset-password-label">{t("resetPassword.confirmPassword")}</label>
            <input
              className="reset-password-input"
              type="password"
              placeholder={t("resetPassword.confirmPasswordPlaceholder")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting}
              autoComplete="new-password"
            />
          </div>

          {errorMsg && <div className="reset-password-error">{errorMsg}</div>}

          <button
            className="reset-password-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? t("resetPassword.resetting") : t("resetPassword.resetButton")}
          </button>

          <div className="reset-password-links">
            <Link to="/login" className="reset-password-back-link">
              {t("resetPassword.backToLogin")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
