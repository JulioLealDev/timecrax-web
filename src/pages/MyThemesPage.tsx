import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { themesService, type ThemeResponse } from "../services/themes.service";
import { ThemeItem } from "../components/ThemeItem";
import { ConfirmModal } from "../components/ConfirmModal";
import "./MyThemesPage.css";

export function MyThemesPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [themes, setThemes] = useState<ThemeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [themeToDelete, setThemeToDelete] = useState<string | null>(null);

  useEffect(() => {
    async function loadThemes() {
      try {
        setIsLoading(true);
        setError(null);
        const userThemes = await themesService.getUserThemes();
        setThemes(userThemes);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load themes");
      } finally {
        setIsLoading(false);
      }
    }

    loadThemes();
  }, []);

  function handleEdit(themeId: string) {
    console.log("Edit theme:", themeId);
    navigate(`/create-theme?edit=${themeId}`);
  }

  function handleDelete(themeId: string) {
    setThemeToDelete(themeId);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!themeToDelete) return;

    try {
      await themesService.deleteTheme(themeToDelete);

      // Remove from state after successful deletion
      setThemes((prev) => prev.filter((t) => t.id !== themeToDelete));
      setDeleteModalOpen(false);
      setThemeToDelete(null);
    } catch (err: any) {
      alert(`Failed to delete theme: ${err?.message ?? "Unknown error"}`);
      setDeleteModalOpen(false);
      setThemeToDelete(null);
    }
  }

  function cancelDelete() {
    setDeleteModalOpen(false);
    setThemeToDelete(null);
  }

  return (
    <div className="my-themes-page">
      <h1 className="my-themes-title">{t("myThemes.title")}</h1>

      <div className="my-themes-container">
        {isLoading ? (
          <div className="my-themes-loading">{t("myThemes.loading")}</div>
        ) : error ? (
          <div className="my-themes-error">{error}</div>
        ) : themes.length === 0 ? (
          <div className="my-themes-empty">
            <p>
              {t("myThemes.noThemes")} <Link to="/create-theme">{t("myThemes.createFirst")}</Link>
            </p>
          </div>
        ) : (
          <>
            <div className="my-themes-header">
              <div
                className="info-icon"
                data-tooltip={t("myThemes.infoTooltip")}
              >
                ℹ
              </div>
            </div>

            <div className="my-themes-grid">
              {themes.map((theme) => (
                <ThemeItem
                  key={theme.id}
                  id={theme.id}
                  name={theme.name}
                  image={theme.image}
                  readyToPlay={theme.readyToPlay}
                  createdAt={theme.createdAt}
                  showActions={true}
                  onClick={() => {}}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        title={t("myThemes.deleteTitle")}
        message={t("myThemes.deleteMessage")}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText={t("myThemes.deleteConfirm")}
        cancelText={t("myThemes.deleteCancel")}
      />
    </div>
  );
}
