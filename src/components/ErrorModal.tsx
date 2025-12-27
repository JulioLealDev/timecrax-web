import "./ErrorModal.css";

interface ErrorModalProps {
  isOpen: boolean;
  errors: Record<string, string>;
  onClose: () => void;
}

export function ErrorModal({ isOpen, errors, onClose }: ErrorModalProps) {
  if (!isOpen) return null;

  const errorList = Object.entries(errors);

  return (
    <div className="error-modal-overlay" onClick={onClose}>
      <div
        className="error-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="error-modal-title">Mandatory Fields</h3>

        <div className="error-modal-list">
          {errorList.map(([key, message]) => (
            <div key={key} className="error-modal-item">
              <span className="error-modal-bullet">•</span>
              <span className="error-modal-message">{message}</span>
            </div>
          ))}
        </div>

        <div className="error-modal-actions">
          <button
            className="error-modal-btn ok-btn"
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
