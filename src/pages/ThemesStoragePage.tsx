import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { themesService, type ThemeResponse } from "../services/themes.service";
import { ThemeItem } from "../components/ThemeItem";
import { LoadingSpinner } from "../components/LoadingSpinner";
import "./ThemesStoragePage.css";

type SortField = "name" | "date";
type SortOrder = "asc" | "desc";
type RecommendationFilter = "all" | "cycle1" | "cycle2" | "cycle3" | "cycle4";

const RECOMMENDATION_VALUES: Record<RecommendationFilter, string | null> = {
  all: null,
  cycle1: "1º cicle: 6 - 10 years old",
  cycle2: "2º cicle: 10 - 12 years old",
  cycle3: "3º cicle: 12 - 15 years old",
  cycle4: "4º cicle: 15 - 18 years old",
};

export function ThemesStoragePage() {
  const { t } = useTranslation();
  const [themes, setThemes] = useState<ThemeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [recommendationFilter, setRecommendationFilter] = useState<RecommendationFilter>("all");
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

    // Filter by recommendation
    if (recommendationFilter !== "all") {
      const targetValue = RECOMMENDATION_VALUES[recommendationFilter];
      result = result.filter((theme) => theme.recommendation === targetValue);
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
  }, [themes, searchText, recommendationFilter, sortField, sortOrder]);

  useEffect(() => {
    async function loadThemes() {
      try {
        setIsLoading(true);
        setError(null);
        const storageThemes = await themesService.getThemesStorage();
        setThemes(storageThemes);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : t("themesStorage.errorLoad"));
      } finally {
        setIsLoading(false);
      }
    }

    loadThemes();
  }, [t]);

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
      <h1 className="themes-storage-title">{t("themesStorage.title")}</h1>

      <div className="themes-storage-container">
        {isLoading ? (
          <LoadingSpinner size="large" message={t("themesStorage.loading")} />
        ) : error ? (
          <div className="themes-storage-error">{error}</div>
        ) : themes.length === 0 ? (
          <div className="themes-storage-empty">
            <p>{t("themesStorage.noThemes")}</p>
          </div>
        ) : (
          <>
            <div className="themes-storage-header">
              {showFilters && (
                <div className="filter-options">
                  <div className="filter-group">
                    <label className="filter-label">{t("themesStorage.filter.name")}</label>
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
                    <label className="filter-label">{t("themesStorage.filter.date")}</label>
                    <div className="filter-buttons">
                      <button
                        className={`filter-btn ${sortField === "date" && sortOrder === "asc" ? "active" : ""}`}
                        onClick={() => { setSortField("date"); setSortOrder("asc"); }}
                      >
                        {t("themesStorage.filter.oldest")}
                      </button>
                      <button
                        className={`filter-btn ${sortField === "date" && sortOrder === "desc" ? "active" : ""}`}
                        onClick={() => { setSortField("date"); setSortOrder("desc"); }}
                      >
                        {t("themesStorage.filter.newest")}
                      </button>
                    </div>
                  </div>

                  <div className="filter-group">
                    <label className="filter-label">{t("themesStorage.filter.recommendation")}</label>
                    <select
                      className="filter-select"
                      value={recommendationFilter}
                      onChange={(e) => setRecommendationFilter(e.target.value as RecommendationFilter)}
                    >
                      <option value="all">{t("themesStorage.filter.all")}</option>
                      <option value="cycle1">{t("createTheme.cycle1")}</option>
                      <option value="cycle2">{t("createTheme.cycle2")}</option>
                      <option value="cycle3">{t("createTheme.cycle3")}</option>
                      <option value="cycle4">{t("createTheme.cycle4")}</option>
                    </select>
                  </div>

                  <div className="filter-group filter-search">
                    <input
                      type="text"
                      className="filter-search-input"
                      placeholder={t("themesStorage.filter.searchPlaceholder")}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <button
                className={`filter-icon-btn ${showFilters ? "active" : ""}`}
                onClick={() => setShowFilters(!showFilters)}
                aria-label={t("themesStorage.filter.toggle")}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
              </button>
            </div>

            <div className="themes-storage-grid">
              {filteredThemes.map((theme) => (
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
                resume={theme.resume}
                recommendation={theme.recommendation}
                onClick={handleThemeClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
          </>
        )}
      </div>
    </div>
  );
}
