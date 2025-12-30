import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { meService, type RankingUser } from "../services/me.service";
import { authService } from "../services/auth.service";
import { LoadingSpinner } from "../components/LoadingSpinner";
import "./RankingPage.css";

export function RankingPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<RankingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const currentUserRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 50;
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedUsers = users.slice(startIndex, endIndex);

  useEffect(() => {
    async function loadRanking() {
      try {
        setIsLoading(true);
        setError(null);

        // Load current user and ranking in parallel
        const [me, ranking] = await Promise.all([
          authService.me(),
          meService.getRanking()
        ]);

        const userId = me.id ?? null;
        setCurrentUserId(userId);
        setUsers(ranking);

        // Navegar para a página do usuário logado
        if (userId) {
          const userIndex = ranking.findIndex(u => u.id === userId);
          if (userIndex !== -1) {
            const userPage = Math.floor(userIndex / itemsPerPage) + 1;
            setCurrentPage(userPage);
          }
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load ranking");
      } finally {
        setIsLoading(false);
      }
    }

    loadRanking();
  }, []);

  // Scroll para o item do usuário logado após carregar
  useEffect(() => {
    if (!isLoading && currentUserId && currentUserRef.current) {
      setTimeout(() => {
        currentUserRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    }
  }, [isLoading, currentUserId, currentPage]);

  function getRankClass(index: number): string {
    if (index === 0) return "rank-1";
    if (index === 1) return "rank-2";
    if (index === 2) return "rank-3";
    return "rank-other";
  }

  function getMedalEmoji(index: number): string {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return "";
  }

  return (
    <div className="ranking-page">
      <h1 className="ranking-title">{t("ranking.title")}</h1>

      <div className="ranking-card">
        <div className="ranking-container">
          {isLoading ? (
            <LoadingSpinner size="large" message={t("ranking.loading")} />
          ) : error ? (
            <div className="ranking-error">{error}</div>
          ) : users.length === 0 ? (
            <div className="ranking-empty">{t("ranking.noUsers")}</div>
          ) : (
            <>
              <div className="ranking-list">
                {displayedUsers.map((user, pageIndex) => {
                  const actualIndex = startIndex + pageIndex;
                  const isCurrentUser = user.id === currentUserId;
                  return (
                    <div
                      key={user.id}
                      ref={isCurrentUser ? currentUserRef : null}
                      className={`ranking-item ${getRankClass(actualIndex)} ${isCurrentUser ? 'current-user' : ''}`}
                    >
                      <div className="ranking-position">
                        <span className="medal">{getMedalEmoji(actualIndex)}</span>
                        <span className="position-number">#{actualIndex + 1}</span>
                      </div>
                      <div className="ranking-name">{user.name}</div>
                      <div className="ranking-score">{user.score} pts</div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="ranking-pagination">
                  <button
                    className="pagination-button"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    {t("ranking.previous")}
                  </button>

                  <span className="pagination-info">
                    {t("ranking.pageOf", { current: currentPage, total: totalPages })}
                  </span>

                  <button
                    className="pagination-button"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    {t("ranking.next")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
