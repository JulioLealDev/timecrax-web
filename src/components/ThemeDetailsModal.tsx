import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";
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
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="500px">
      <div className="theme-modal-header">
        {themeImage && (
          <div className="theme-modal-image">
            <img src={themeImage} alt={themeName} />
          </div>
        )}
      </div>

      <div className="theme-modal-body">
        <h2>{themeName}</h2>
        <p className="theme-id">{t("themeDetailsModal.themeId")} {themeId}</p>
      </div>

      <div className="theme-modal-actions">
        {onEdit && (
          <button
            className="theme-button primary"
            onClick={() => onEdit(themeId)}
          >
            {t("themeDetailsModal.editTheme")}
          </button>
        )}
        {onDelete && (
          <button
            className="theme-button secondary"
            onClick={() => onDelete(themeId)}
          >
            {t("themeDetailsModal.delete")}
          </button>
        )}
        <button className="theme-button secondary" onClick={onClose}>
          {t("themeDetailsModal.close")}
        </button>
      </div>
    </Modal>
  );
}
