import { useState, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";
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
  const { t } = useTranslation();

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
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={t("deleteAccountModal.title")}
      variant="danger"
      maxWidth="550px"
      showCloseButton={false}
    >
      <div className="delete-account-warning">
        <div className="warning-icon">⚠️</div>
        <div className="warning-text">
          <strong>{t("deleteAccountModal.warningTitle")}</strong>
          <p>
            {t("deleteAccountModal.warningDescription")}
          </p>
          <ul>
            <li>{t("deleteAccountModal.warningProfile")}</li>
            <li>{t("deleteAccountModal.warningThemes")}</li>
            <li>{t("deleteAccountModal.warningProgress")}</li>
            <li>{t("deleteAccountModal.warningScore")}</li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="delete-account-form">
        <div className="delete-account-field">
          <label htmlFor="delete-password" className="delete-account-label">
            {t("deleteAccountModal.confirmLabel")}
          </label>
          <input
            id="delete-password"
            type="password"
            className="delete-account-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("deleteAccountModal.passwordPlaceholder")}
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
            {t("deleteAccountModal.cancel")}
          </button>
          <button
            type="submit"
            className="delete-account-btn delete-btn"
            disabled={isLoading || !password.trim()}
          >
            {isLoading ? t("deleteAccountModal.deleting") : t("deleteAccountModal.delete")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
