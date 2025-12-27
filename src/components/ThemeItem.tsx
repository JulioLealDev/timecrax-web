import imageTemplate from "../assets/imageTemplate.png";
import "./ThemeItem.css";

interface ThemeItemProps {
  id: string;
  name: string;
  image?: string | null;
  readyToPlay?: boolean;
  showActions: boolean;
  onClick: (themeId: string) => void;
  onEdit: (themeId: string) => void;
  onDelete: (themeId: string) => void;
}

export function ThemeItem({
  id,
  name,
  image,
  readyToPlay,
  showActions,
  onClick,
  onEdit,
  onDelete,
}: ThemeItemProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(id);
    }
  };

  return (
    <div className="theme-item-wrapper">
      <div className="theme-name">{name}</div>

      <div
        className={`theme-item ${showActions ? "active" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onClick(id);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {showActions && (
          <div className="theme-actions">
            <button
              className="theme-action-btn edit-btn"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(id);
              }}
              data-tooltip="Editar tema"
            >
              ✏️
            </button>
            <button
              className="theme-action-btn delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
              data-tooltip="Deletar tema"
            >
              🗑️
            </button>
          </div>
        )}

        <div className="theme-item-content">
          {showActions && <div className="theme-overlay" />}

          {image && (
            <div
              className="theme-image"
              style={{ backgroundImage: `url(${image})` }}
            />
          )}
          <img
            src={imageTemplate}
            alt="Theme frame"
            className="theme-frame"
          />
        </div>
      </div>

      <div className="theme-ready-to-play">
        Ready to Play: {readyToPlay ? "Yes" : "No"}
      </div>
    </div>
  );
}
