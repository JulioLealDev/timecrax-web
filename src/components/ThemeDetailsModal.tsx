import "./ThemeDetailsModal.css";

interface ThemeDetailsModalProps {
  themeId: string;
  themeName: string;
  themeImage?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (themeId: string) => void;
  onDelete?: (themeId: string) => void;
}

export function ThemeDetailsModal({
  themeId,
  themeName,
  themeImage,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: ThemeDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="theme-modal-overlay" onClick={onClose}>
      <div
        className="theme-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="theme-modal-close" onClick={onClose}>
          ×
        </button>

        <div className="theme-modal-header">
          {themeImage && (
            <div className="theme-modal-image">
              <img src={themeImage} alt={themeName} />
            </div>
          )}
        </div>

        <div className="theme-modal-body">
          <h2>{themeName}</h2>
          <p className="theme-id">Theme ID: {themeId}</p>
        </div>

        <div className="theme-modal-actions">
          {onEdit && (
            <button
              className="theme-button primary"
              onClick={() => onEdit(themeId)}
            >
              Edit Theme
            </button>
          )}
          {onDelete && (
            <button
              className="theme-button secondary"
              onClick={() => onDelete(themeId)}
            >
              Delete
            </button>
          )}
          <button className="theme-button secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
