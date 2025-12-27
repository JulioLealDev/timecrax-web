import { Routes, Route, useLocation } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { RegisterPage } from "./pages/RegisterPage";
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
import { RoleProtectedRoute } from "./components/RoleProtectedRoute";
import "./App.css";


function App() {
  const location = useLocation();
  const isHomePage = location.pathname === "/" || location.pathname === "/register";

  return (
    <>
      <NavBar />
      {!isHomePage && <Sidebar />}
      <div className={`main-content ${!isHomePage ? 'with-sidebar' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />

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
