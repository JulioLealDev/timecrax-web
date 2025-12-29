import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";
import "./ConfirmModal.css";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
}: ConfirmModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      maxWidth="450px"
      showCloseButton={false}
    >
      <p className="confirm-modal-message">{message}</p>

      <div className="confirm-modal-actions">
        <button className="confirm-modal-btn cancel-btn" onClick={onCancel}>
          {cancelText ?? t("confirmModal.cancel")}
        </button>
        <button className="confirm-modal-btn confirm-btn" onClick={onConfirm}>
          {confirmText ?? t("confirmModal.confirm")}
        </button>
      </div>
    </Modal>
  );
}
