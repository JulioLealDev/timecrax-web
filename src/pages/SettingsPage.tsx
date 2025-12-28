import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { DeleteAccountModal } from "../components/DeleteAccountModal";
import "./SettingsPage.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export function SettingsPage() {
  const navigate = useNavigate();

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
      errors.emailPassword = "Current password is required.";
    }
    if (!newEmail.trim()) {
      errors.newEmail = "New email is required.";
    } else if (!newEmail.includes("@") || !newEmail.includes(".")) {
      errors.newEmail = "Please enter a valid email address.";
    }

    if (Object.keys(errors).length > 0) {
      setEmailErrors(errors);
      return;
    }

    setEmailLoading(true);

    try {
      const token = localStorage.getItem("token");
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
        setEmailErrors({ general: data.error || "Failed to change email." });
        return;
      }

      setEmailSuccess(true);
      setEmailPassword("");
      setNewEmail("");

      // Hide success message after 5 seconds
      setTimeout(() => setEmailSuccess(false), 5000);
    } catch (error) {
      setEmailErrors({ general: "Network error. Please try again." });
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
      errors.currentPassword = "Current password is required.";
    }
    if (!newPassword.trim()) {
      errors.newPassword = "New password is required.";
    } else if (newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters.";
    }
    if (!confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your new password.";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordLoading(true);

    try {
      const token = localStorage.getItem("token");
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
        setPasswordErrors({ general: data.error || "Failed to change password." });
        return;
      }

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Hide success message after 5 seconds
      setTimeout(() => setPasswordSuccess(false), 5000);
    } catch (error) {
      setPasswordErrors({ general: "Network error. Please try again." });
    } finally {
      setPasswordLoading(false);
    }
  }

  // Delete Account Handler
  async function handleDeleteAccount(password: string) {
    setDeleteError("");
    setDeleteLoading(true);

    try {
      const token = localStorage.getItem("token");
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
        setDeleteError(data.error || "Failed to delete account.");
        setDeleteLoading(false);
        return;
      }

      // Account deleted successfully - logout and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      navigate("/login");
    } catch (error) {
      setDeleteError("Network error. Please try again.");
      setDeleteLoading(false);
    }
  }

  return (
    <div className="settings-page">
      <h1 className="settings-title">Settings</h1>

      {/* Change Email Section */}
      <section className="settings-section">
        <h2 className="settings-section-title">Change Email</h2>
        <form className="settings-form" onSubmit={handleChangeEmail}>
          <div className="settings-field">
            <label className="settings-label" htmlFor="email-password">
              Current Password
            </label>
            <input
              id="email-password"
              type="password"
              className={`settings-input ${emailErrors.emailPassword ? "is-invalid" : ""}`}
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              placeholder="Enter your current password"
            />
            {emailErrors.emailPassword && (
              <span className="settings-error">{emailErrors.emailPassword}</span>
            )}
          </div>

          <div className="settings-field">
            <label className="settings-label" htmlFor="new-email">
              New Email
            </label>
            <input
              id="new-email"
              type="email"
              className={`settings-input ${emailErrors.newEmail ? "is-invalid" : ""}`}
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter your new email"
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
            {emailLoading ? "Updating..." : "Update Email"}
          </button>

          {emailSuccess && (
            <div className="settings-success">
              Email updated successfully!
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
        <h2 className="settings-section-title">Change Password</h2>
        <form className="settings-form" onSubmit={handleChangePassword}>
          <div className="settings-field">
            <label className="settings-label" htmlFor="current-password">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              className={`settings-input ${passwordErrors.currentPassword ? "is-invalid" : ""}`}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
            />
            {passwordErrors.currentPassword && (
              <span className="settings-error">{passwordErrors.currentPassword}</span>
            )}
          </div>

          <div className="settings-field">
            <label className="settings-label" htmlFor="new-password">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              className={`settings-input ${passwordErrors.newPassword ? "is-invalid" : ""}`}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
            {passwordErrors.newPassword && (
              <span className="settings-error">{passwordErrors.newPassword}</span>
            )}
          </div>

          <div className="settings-field">
            <label className="settings-label" htmlFor="confirm-password">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              className={`settings-input ${passwordErrors.confirmPassword ? "is-invalid" : ""}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
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
            {passwordLoading ? "Updating..." : "Update Password"}
          </button>

          {passwordSuccess && (
            <div className="settings-success">
              Password updated successfully!
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
        <h2 className="settings-section-title danger-title">Danger Zone</h2>
        <p className="danger-description">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          type="button"
          className="settings-button danger-button"
          onClick={() => setDeleteModalOpen(true)}
        >
          Delete Account
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
