import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { DeleteAccountModal } from "../components/DeleteAccountModal";
import "./SettingsPage.css";

function translateApiError(data: any, t: (key: string) => string): string {
  if (data?.code) {
    const translated = t(`errors.${data.code}`);
    if (translated !== `errors.${data.code}`) {
      return translated;
    }
  }
  return data?.error || t("errors.UNKNOWN");
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { logout } = useAuth();

  // Change Email State
  const [emailPassword, setEmailPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailErrors, setEmailErrors] = useState<Record<string, string>>({});
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Delete Account State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Change Email Handler
  async function handleChangeEmail(e: FormEvent) {
    e.preventDefault();
    setEmailErrors({});
    setEmailSuccess(false);

    // Validation
    const errors: Record<string, string> = {};
    if (!emailPassword.trim()) {
      errors.emailPassword = t("settings.errorCurrentPasswordRequired");
    }
    if (!newEmail.trim()) {
      errors.newEmail = t("settings.errorNewEmailRequired");
    } else if (!newEmail.includes("@") || !newEmail.includes(".")) {
      errors.newEmail = t("settings.errorInvalidEmail");
    }

    if (Object.keys(errors).length > 0) {
      setEmailErrors(errors);
      return;
    }

    setEmailLoading(true);

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/me/email`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: emailPassword,
          newEmail: newEmail.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setEmailErrors({ general: translateApiError(data, t) });
        return;
      }

      setEmailSuccess(true);
      setEmailPassword("");
      setNewEmail("");

      // Hide success message after 5 seconds
      setTimeout(() => setEmailSuccess(false), 5000);
    } catch (error) {
      setEmailErrors({ general: t("settings.errorNetwork") });
    } finally {
      setEmailLoading(false);
    }
  }

  // Change Password Handler
  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordErrors({});
    setPasswordSuccess(false);

    // Validation
    const errors: Record<string, string> = {};
    if (!currentPassword.trim()) {
      errors.currentPassword = t("settings.errorCurrentPasswordRequired");
    }
    if (!newPassword.trim()) {
      errors.newPassword = t("settings.errorNewPasswordRequired");
    } else if (newPassword.length < 8) {
      errors.newPassword = t("settings.errorPasswordLength");
    }
    if (!confirmPassword.trim()) {
      errors.confirmPassword = t("settings.errorConfirmPasswordRequired");
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = t("settings.errorPasswordMatch");
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordLoading(true);

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/me/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setPasswordErrors({ general: translateApiError(data, t) });
        return;
      }

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Hide success message after 5 seconds
      setTimeout(() => setPasswordSuccess(false), 5000);
    } catch (error) {
      setPasswordErrors({ general: t("settings.errorNetwork") });
    } finally {
      setPasswordLoading(false);
    }
  }

  // Delete Account Handler
  async function handleDeleteAccount(password: string) {
    setDeleteError("");
    setDeleteLoading(true);

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/me/account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setDeleteError(translateApiError(data, t));
        setDeleteLoading(false);
        return;
      }

      // Account deleted successfully - logout and redirect
      logout();
      navigate("/");
    } catch (error) {
      setDeleteError(t("settings.errorNetwork"));
      setDeleteLoading(false);
    }
  }

  return (
    <div className="settings-page">
      <h1 className="settings-title">{t("settings.title")}</h1>

      {/* Change Email Section */}
      <section className="settings-section">
        <h2 className="settings-section-title">{t("settings.changeEmail")}</h2>
        <form className="settings-form" onSubmit={handleChangeEmail}>
          <div className="settings-field">
            <label className="settings-label" htmlFor="email-password">
              {t("settings.currentPassword")}
            </label>
            <input
              id="email-password"
              type="password"
              className={`settings-input ${emailErrors.emailPassword ? "is-invalid" : ""}`}
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              placeholder={t("settings.currentPasswordPlaceholder")}
            />
            {emailErrors.emailPassword && (
              <span className="settings-error">{emailErrors.emailPassword}</span>
            )}
          </div>

          <div className="settings-field">
            <label className="settings-label" htmlFor="new-email">
              {t("settings.newEmail")}
            </label>
            <input
              id="new-email"
              type="email"
              className={`settings-input ${emailErrors.newEmail ? "is-invalid" : ""}`}
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder={t("settings.newEmailPlaceholder")}
            />
            {emailErrors.newEmail && (
              <span className="settings-error">{emailErrors.newEmail}</span>
            )}
          </div>

          <button
            type="submit"
            className="settings-button"
            disabled={emailLoading}
          >
            {emailLoading ? t("settings.updatingEmail") : t("settings.updateEmail")}
          </button>

          {emailSuccess && (
            <div className="settings-success">
              {t("settings.emailUpdated")}
            </div>
          )}

          {emailErrors.general && (
            <div className="settings-error-message">
              {emailErrors.general}
            </div>
          )}
        </form>
      </section>

      {/* Change Password Section */}
      <section className="settings-section">
        <h2 className="settings-section-title">{t("settings.changePassword")}</h2>
        <form className="settings-form" onSubmit={handleChangePassword}>
          <div className="settings-field">
            <label className="settings-label" htmlFor="current-password">
              {t("settings.currentPassword")}
            </label>
            <input
              id="current-password"
              type="password"
              className={`settings-input ${passwordErrors.currentPassword ? "is-invalid" : ""}`}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={t("settings.currentPasswordPlaceholder")}
            />
            {passwordErrors.currentPassword && (
              <span className="settings-error">{passwordErrors.currentPassword}</span>
            )}
          </div>

          <div className="settings-field">
            <label className="settings-label" htmlFor="new-password">
              {t("settings.newPassword")}
            </label>
            <input
              id="new-password"
              type="password"
              className={`settings-input ${passwordErrors.newPassword ? "is-invalid" : ""}`}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t("settings.newPasswordPlaceholder")}
            />
            {passwordErrors.newPassword && (
              <span className="settings-error">{passwordErrors.newPassword}</span>
            )}
          </div>

          <div className="settings-field">
            <label className="settings-label" htmlFor="confirm-password">
              {t("settings.confirmNewPassword")}
            </label>
            <input
              id="confirm-password"
              type="password"
              className={`settings-input ${passwordErrors.confirmPassword ? "is-invalid" : ""}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("settings.confirmNewPasswordPlaceholder")}
            />
            {passwordErrors.confirmPassword && (
              <span className="settings-error">{passwordErrors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className="settings-button"
            disabled={passwordLoading}
          >
            {passwordLoading ? t("settings.updatingPassword") : t("settings.updatePassword")}
          </button>

          {passwordSuccess && (
            <div className="settings-success">
              {t("settings.passwordUpdated")}
            </div>
          )}

          {passwordErrors.general && (
            <div className="settings-error-message">
              {passwordErrors.general}
            </div>
          )}
        </form>
      </section>

      {/* Delete Account Section */}
      <section className="settings-section danger-section">
        <h2 className="settings-section-title danger-title">{t("settings.dangerZone")}</h2>
        <p className="danger-description">
          {t("settings.dangerDescription")}
        </p>
        <button
          type="button"
          className="settings-button danger-button"
          onClick={() => setDeleteModalOpen(true)}
        >
          {t("settings.deleteAccount")}
        </button>
      </section>

      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onConfirm={handleDeleteAccount}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeleteError("");
        }}
        isLoading={deleteLoading}
        error={deleteError}
      />
    </div>
  );
}
