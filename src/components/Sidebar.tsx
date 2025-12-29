import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

export function Sidebar() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  if (!user) return null;

  const isStudentOrPlayer = user.role === "student" || user.role === "player";
  const isTeacher = user.role === "teacher";

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <Link
          to="/profile"
          className={`sidebar-link ${isActive("/profile") ? "active" : ""}`}
        >
          <span className="sidebar-label">{t("sidebar.profile")}</span>
        </Link>

        {isStudentOrPlayer && (
          <>
            <Link
              to="/themes-storage"
              className={`sidebar-link ${isActive("/themes-storage") ? "active" : ""}`}
            >
              <span className="sidebar-label">{t("sidebar.themesStorage")}</span>
            </Link>

            <Link
              to="/ranking"
              className={`sidebar-link ${isActive("/ranking") ? "active" : ""}`}
            >
              <span className="sidebar-label">{t("sidebar.ranking")}</span>
            </Link>

            <Link
              to="/settings"
              className={`sidebar-link ${isActive("/settings") ? "active" : ""}`}
            >
              <span className="sidebar-label">{t("sidebar.settings")}</span>
            </Link>
          </>
        )}

        {isTeacher && (
          <>
            <Link
              to="/create-theme"
              className={`sidebar-link ${isActive("/create-theme") ? "active" : ""}`}
            >
              <span className="sidebar-label">{t("sidebar.createTheme")}</span>
            </Link>

            <Link
              to="/my-themes"
              className={`sidebar-link ${isActive("/my-themes") ? "active" : ""}`}
            >
              <span className="sidebar-label">{t("sidebar.myThemes")}</span>
            </Link>

            <Link
              to="/themes-storage"
              className={`sidebar-link ${isActive("/themes-storage") ? "active" : ""}`}
            >
              <span className="sidebar-label">{t("sidebar.themesStorage")}</span>
            </Link>

            <Link
              to="/ranking"
              className={`sidebar-link ${isActive("/ranking") ? "active" : ""}`}
            >
              <span className="sidebar-label">{t("sidebar.ranking")}</span>
            </Link>

            <Link
              to="/settings"
              className={`sidebar-link ${isActive("/settings") ? "active" : ""}`}
            >
              <span className="sidebar-label">{t("sidebar.settings")}</span>
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}
