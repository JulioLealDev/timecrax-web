import { useEffect, useState } from "react";
import { themesService, type ThemeResponse } from "../services/themes.service";
import { ThemeItem } from "../components/ThemeItem";
import "./ThemesStoragePage.css";

export function ThemesStoragePage() {
  const [themes, setThemes] = useState<ThemeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadThemes() {
      try {
        setIsLoading(true);
        setError(null);
        const storageThemes = await themesService.getThemesStorage();
        setThemes(storageThemes);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load themes");
      } finally {
        setIsLoading(false);
      }
    }

    loadThemes();
  }, []);

  function handleThemeClick() {
    // No action needed - themes are read-only in storage
  }

  function handleEdit() {
    // Not allowed in storage
  }

  function handleDelete() {
    // Not allowed in storage
  }

  return (
    <div className="themes-storage-page">
      <h1 className="themes-storage-title">Themes Storage</h1>

      <div className="themes-storage-container">
        {isLoading ? (
          <div className="themes-storage-loading">Loading themes...</div>
        ) : error ? (
          <div className="themes-storage-error">{error}</div>
        ) : themes.length === 0 ? (
          <div className="themes-storage-empty">
            <p>No themes available yet.</p>
          </div>
        ) : (
          <div className="themes-storage-grid">
            {themes.map((theme) => (
              <ThemeItem
                key={theme.id}
                id={theme.id}
                name={theme.name}
                image={theme.image}
                readyToPlay={theme.readyToPlay}
                showActions={false}
                showReadyToPlay={false}
                creatorName={theme.creatorName}
                createdAt={theme.createdAt}
                onClick={handleThemeClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
