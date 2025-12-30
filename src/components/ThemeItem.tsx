import { useTranslation } from "react-i18next";
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
  resume?: string | null;
  recommendation?: string | null;
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
  showReadyToPlay = true,
  creatorName,
  createdAt,
  resume,
  recommendation,
  onClick: _onClick,
  onEdit,
  onDelete,
}: ThemeItemProps) {
  const { t } = useTranslation();

  function getDaysAgo(dateString?: string): string {
    if (!dateString) return "";

    const createdDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t("themeItem.today");
    if (diffDays === 1) return t("themeItem.oneDayAgo");
    return t("themeItem.daysAgo", { count: diffDays });
  }

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
            aria-label={`Edit theme: ${name}`}
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
            aria-label={`Delete theme: ${name}`}
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
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <div className="theme-info-section">
        <div className="theme-info-left">
          <div className="theme-name">{name}</div>

          {showReadyToPlay && (
            <div className="theme-ready-to-play">
              <span className="ready-label">{t("themeItem.readyToPlay")}:</span>{" "}
              <span className="ready-value">{readyToPlay ? t("themeItem.yes") : t("themeItem.no")}</span>
            </div>
          )}

          {createdAt && (
            <div className="theme-created-at">
              <span className="created-label">{t("themeItem.createdAt")}:</span>{" "}
              <span className="created-value">{getDaysAgo(createdAt)}</span>
            </div>
          )}

          {creatorName && (
            <div className="theme-creator">
              <span className="creator-label">{t("themeItem.creator")}:</span>{" "}
              <span className="creator-name">{creatorName}</span>
            </div>
          )}
        </div>

        <div className="theme-info-right">
          {resume && (
            <div className="theme-resume">
              <span className="resume-label">{t("themeItem.resume")}:</span>{" "}
              <span className="resume-value">{resume}</span>
            </div>
          )}

          {recommendation && (
            <div className="theme-recommendation">
              <span className="recommendation-label">{t("themeItem.recommendation")}:</span>{" "}
              <span className="recommendation-value">{recommendation}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
