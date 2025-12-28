import { useState, FormEvent } from "react";
import "./DeleteAccountModal.css";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onConfirm: (password: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
}

export function DeleteAccountModal({
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false,
  error,
}: DeleteAccountModalProps) {
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.trim()) {
      onConfirm(password);
    }
  }

  function handleCancel() {
    setPassword("");
    onCancel();
  }

  return (
    <div className="delete-account-modal-overlay" onClick={handleCancel}>
      <div
        className="delete-account-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="delete-account-modal-title">Delete Account</h3>

        <div className="delete-account-warning">
          <div className="warning-icon">⚠️</div>
          <div className="warning-text">
            <strong>Warning: This action cannot be undone!</strong>
            <p>
              Deleting your account will permanently remove all your data, including:
            </p>
            <ul>
              <li>Your profile and personal information</li>
              <li>All themes you created</li>
              <li>Your progress and achievements</li>
              <li>Your score and ranking position</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="delete-account-form">
          <div className="delete-account-field">
            <label htmlFor="delete-password" className="delete-account-label">
              Enter your password to confirm:
            </label>
            <input
              id="delete-password"
              type="password"
              className="delete-account-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && (
            <div className="delete-account-error">{error}</div>
          )}

          <div className="delete-account-actions">
            <button
              type="button"
              className="delete-account-btn cancel-btn"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="delete-account-btn delete-btn"
              disabled={isLoading || !password.trim()}
            >
              {isLoading ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
