import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { themesService, type ThemeResponse } from "../services/themes.service";
import { ThemeItem } from "../components/ThemeItem";
import { ConfirmModal } from "../components/ConfirmModal";
import "./MyThemesPage.css";

export function MyThemesPage() {
  const navigate = useNavigate();
  const [themes, setThemes] = useState<ThemeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
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

  // Close active theme when clicking anywhere
  useEffect(() => {
    function handleClickOutside() {
      setActiveThemeId(null);
    }

    if (activeThemeId) {
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [activeThemeId]);

  function handleThemeClick(themeId: string) {
    // Toggle actions: if clicking the same theme, close it; otherwise open new one
    setActiveThemeId(activeThemeId === themeId ? null : themeId);
  }

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
      setActiveThemeId(null);
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
      <h1 className="my-themes-title">My Themes</h1>

      <div className="my-themes-container">
        {isLoading ? (
          <div className="my-themes-loading">Loading themes...</div>
        ) : error ? (
          <div className="my-themes-error">{error}</div>
        ) : themes.length === 0 ? (
          <div className="my-themes-empty">
            <p>No themes created yet. Start creating your first theme!</p>
          </div>
        ) : (
          <div className="my-themes-grid">
            {themes.map((theme) => (
              <ThemeItem
                key={theme.id}
                id={theme.id}
                name={theme.name}
                image={theme.image}
                readyToPlay={theme.readyToPlay}
                showActions={activeThemeId === theme.id}
                onClick={handleThemeClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Deletar Tema"
        message="Tem certeza que deseja deletar este tema? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Deletar"
        cancelText="Cancelar"
      />
    </div>
  );
}
