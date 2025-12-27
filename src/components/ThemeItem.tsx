import imageTemplate from "../assets/imageTemplate.png";
import "./ThemeItem.css";

interface ThemeItemProps {
  id: string;
  name: string;
  image?: string | null;
  readyToPlay?: boolean;
  showActions: boolean;
  showReadyToPlay?: boolean;
  creatorName?: string;
  createdAt?: string;
  onClick: (themeId: string) => void;
  onEdit: (themeId: string) => void;
  onDelete: (themeId: string) => void;
}

function getDaysAgo(dateString?: string): string {
  if (!dateString) return "";

  const createdDate = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

export function ThemeItem({
  id,
  name,
  image,
  readyToPlay,
  showActions,
  showReadyToPlay = true,
  creatorName,
  createdAt,
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

      <div className="theme-item-card">
        <div className="theme-item">
          <div className="theme-item-content">
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
      </div>

      <div className="theme-info-section">
        <div className="theme-name">{name}</div>

        {showReadyToPlay && (
          <div className="theme-ready-to-play">
            <span className="ready-label">Ready to Play:</span>{" "}
            <span className="ready-value">{readyToPlay ? "YES" : "NO"}</span>
          </div>
        )}

        {createdAt && (
          <div className="theme-created-at">
            <span className="created-label">Created at:</span>{" "}
            <span className="created-value">{getDaysAgo(createdAt)}</span>
          </div>
        )}

        {creatorName && (
          <div className="theme-creator">
            <span className="creator-label">Creator:</span>{" "}
            <span className="creator-name">{creatorName}</span>
          </div>
        )}
      </div>
    </div>
  );
}
