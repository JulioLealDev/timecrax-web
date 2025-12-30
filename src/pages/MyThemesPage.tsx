import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { themesService, type ThemeResponse } from "../services/themes.service";
import { ThemeItem } from "../components/ThemeItem";
import { ConfirmModal } from "../components/ConfirmModal";
import { LoadingSpinner } from "../components/LoadingSpinner";
import "./MyThemesPage.css";

type SortField = "name" | "date";
type SortOrder = "asc" | "desc";
type ReadyFilter = "all" | "true" | "false";

export function MyThemesPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [themes, setThemes] = useState<ThemeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [themeToDelete, setThemeToDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [readyFilter, setReadyFilter] = useState<ReadyFilter>("all");
  const [searchText, setSearchText] = useState("");

  // Filtered and sorted themes
  const filteredThemes = useMemo(() => {
    let result = [...themes];

    // Filter by search text
    if (searchText.trim()) {
      const search = searchText.toLowerCase().trim();
      result = result.filter((theme) =>
        theme.name.toLowerCase().includes(search)
      );
    }

    // Filter by ready to play
    if (readyFilter !== "all") {
      const isReady = readyFilter === "true";
      result = result.filter((theme) => theme.readyToPlay === isReady);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "date") {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        comparison = dateA - dateB;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [themes, searchText, readyFilter, sortField, sortOrder]);

  useEffect(() => {
    async function loadThemes() {
      try {
        setIsLoading(true);
        setError(null);
        const userThemes = await themesService.getUserThemes();
        setThemes(userThemes);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load themes";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    loadThemes();
  }, []);

  function handleEdit(themeId: string) {
    navigate(`/create-theme?edit=${themeId}`);
  }

  function handleDelete(themeId: string) {
    setDeleteError(null);
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
      setDeleteError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("myThemes.deleteError");
      setDeleteError(errorMessage);
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

      {deleteError && (
        <div className="my-themes-error" style={{ marginBottom: "1rem" }}>
          {deleteError}
        </div>
      )}

      <div className="my-themes-container">
        {isLoading ? (
          <LoadingSpinner size="large" message={t("myThemes.loading")} />
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

              {showFilters && (
                <div className="filter-options">
                  <div className="filter-group">
                    <label className="filter-label">{t("myThemes.filter.name")}</label>
                    <div className="filter-buttons">
                      <button
                        className={`filter-btn ${sortField === "name" && sortOrder === "asc" ? "active" : ""}`}
                        onClick={() => { setSortField("name"); setSortOrder("asc"); }}
                      >
                        A-Z
                      </button>
                      <button
                        className={`filter-btn ${sortField === "name" && sortOrder === "desc" ? "active" : ""}`}
                        onClick={() => { setSortField("name"); setSortOrder("desc"); }}
                      >
                        Z-A
                      </button>
                    </div>
                  </div>

                  <div className="filter-group">
                    <label className="filter-label">{t("myThemes.filter.date")}</label>
                    <div className="filter-buttons">
                      <button
                        className={`filter-btn ${sortField === "date" && sortOrder === "asc" ? "active" : ""}`}
                        onClick={() => { setSortField("date"); setSortOrder("asc"); }}
                      >
                        {t("myThemes.filter.oldest")}
                      </button>
                      <button
                        className={`filter-btn ${sortField === "date" && sortOrder === "desc" ? "active" : ""}`}
                        onClick={() => { setSortField("date"); setSortOrder("desc"); }}
                      >
                        {t("myThemes.filter.newest")}
                      </button>
                    </div>
                  </div>

                  <div className="filter-group">
                    <label className="filter-label">{t("myThemes.filter.readyToPlay")}</label>
                    <div className="filter-buttons">
                      <button
                        className={`filter-btn ${readyFilter === "all" ? "active" : ""}`}
                        onClick={() => setReadyFilter("all")}
                      >
                        {t("myThemes.filter.all")}
                      </button>
                      <button
                        className={`filter-btn ${readyFilter === "true" ? "active" : ""}`}
                        onClick={() => setReadyFilter("true")}
                      >
                        {t("myThemes.filter.yes")}
                      </button>
                      <button
                        className={`filter-btn ${readyFilter === "false" ? "active" : ""}`}
                        onClick={() => setReadyFilter("false")}
                      >
                        {t("myThemes.filter.no")}
                      </button>
                    </div>
                  </div>

                  <div className="filter-group filter-search">
                    <input
                      type="text"
                      className="filter-search-input"
                      placeholder={t("myThemes.filter.searchPlaceholder")}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <button
                className={`filter-icon-btn ${showFilters ? "active" : ""}`}
                onClick={() => setShowFilters(!showFilters)}
                aria-label={t("myThemes.filter.toggle")}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
              </button>
            </div>

            <div className="my-themes-grid">
              {filteredThemes.map((theme) => (
                <ThemeItem
                  key={theme.id}
                  id={theme.id}
                  name={theme.name}
                  image={theme.image}
                  readyToPlay={theme.readyToPlay}
                  createdAt={theme.createdAt}
                  cardCount={theme.cardCount}
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
