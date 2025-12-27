import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

export function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isStudent = user.role === "student";
  const isTeacher = user.role === "teacher";

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <Link
          to="/profile"
          className={`sidebar-link ${isActive("/profile") ? "active" : ""}`}
        >
          <span className="sidebar-label">Profile</span>
        </Link>

        {isStudent && (
          <>
            <Link
              to="/themes"
              className={`sidebar-link ${isActive("/themes") ? "active" : ""}`}
            >
              <span className="sidebar-label">Storage Themes</span>
            </Link>

            <Link
              to="/ranking"
              className={`sidebar-link ${isActive("/ranking") ? "active" : ""}`}
            >
              <span className="sidebar-label">Ranking</span>
            </Link>

            <Link
              to="/settings"
              className={`sidebar-link ${isActive("/settings") ? "active" : ""}`}
            >
              <span className="sidebar-label">Settings</span>
            </Link>
          </>
        )}

        {isTeacher && (
          <>
            <Link
              to="/create-theme"
              className={`sidebar-link ${isActive("/create-theme") ? "active" : ""}`}
            >
              <span className="sidebar-label">Create Theme</span>
            </Link>

            <Link
              to="/my-themes"
              className={`sidebar-link ${isActive("/my-themes") ? "active" : ""}`}
            >
              <span className="sidebar-label">My Themes</span>
            </Link>

            <Link
              to="/themes-storage"
              className={`sidebar-link ${isActive("/themes-storage") ? "active" : ""}`}
            >
              <span className="sidebar-label">Themes Storage</span>
            </Link>

            <Link
              to="/ranking"
              className={`sidebar-link ${isActive("/ranking") ? "active" : ""}`}
            >
              <span className="sidebar-label">Ranking</span>
            </Link>

            <Link
              to="/settings"
              className={`sidebar-link ${isActive("/settings") ? "active" : ""}`}
            >
              <span className="sidebar-label">Settings</span>
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}
