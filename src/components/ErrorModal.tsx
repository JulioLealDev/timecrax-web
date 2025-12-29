import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";
import "./ErrorModal.css";

interface ErrorModalProps {
  isOpen: boolean;
  errors: Record<string, string>;
  onClose: () => void;
}

export function ErrorModal({ isOpen, errors, onClose }: ErrorModalProps) {
  const { t } = useTranslation();
  const errorList = Object.entries(errors);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("errorModal.title")}
      maxWidth="500px"
      showCloseButton={false}
    >
      <div className="error-modal-list">
        {errorList.map(([key, message]) => (
          <div key={key} className="error-modal-item">
            <span className="error-modal-bullet">•</span>
            <span className="error-modal-message">{message}</span>
          </div>
        ))}
      </div>

      <div className="error-modal-actions">
        <button className="error-modal-btn ok-btn" onClick={onClose}>
          {t("errorModal.ok")}
        </button>
      </div>
    </Modal>
  );
}
