import { Routes, Route, useLocation } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { CreateThemePage } from "./pages/CreateThemePage";
import { NavBar } from "./components/NavBar";
import { Sidebar } from "./components/Sidebar";
import { ProfilePage } from "./pages/ProfilePage";
import { ThemesPage } from "./pages/ThemesPage";
import { RankingPage } from "./pages/RankingPage";
import { SettingsPage } from "./pages/SettingsPage";
import { MyThemesPage } from "./pages/MyThemesPage";
import { ThemesStoragePage } from "./pages/ThemesStoragePage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicOnlyRoute } from "./components/PublicOnlyRoute";
import { RoleProtectedRoute } from "./components/RoleProtectedRoute";
import { isPublicRoute } from "./constants/routes";
import "./App.css";


function App() {
  const location = useLocation();
  const isPublicPage = isPublicRoute(location.pathname);

  return (
    <>
      <NavBar />
      {!isPublicPage && <Sidebar />}
      <div className={`main-content ${!isPublicPage ? 'with-sidebar' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/themes" element={<ThemesPage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/themes-storage" element={<ThemesStoragePage />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={["teacher"]} />}>
            <Route path="/create-theme" element={<CreateThemePage />} />
            <Route path="/my-themes" element={<MyThemesPage />} />
          </Route>
        </Routes>
      </div>
    </>
  );
}

export default App;
