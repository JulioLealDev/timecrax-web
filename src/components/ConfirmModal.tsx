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
  confirmText = "Confirmar",
  cancelText = "Cancelar",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div
        className="confirm-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="confirm-modal-title">{title}</h3>
        <p className="confirm-modal-message">{message}</p>

        <div className="confirm-modal-actions">
          <button
            className="confirm-modal-btn cancel-btn"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className="confirm-modal-btn confirm-btn"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
