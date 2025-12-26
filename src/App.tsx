import { Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { RegisterPage } from "./pages/RegisterPage";
import { CreateThemePage } from "./pages/CreateThemePage";
import { NavBar } from "./components/NavBar";
import { ProfilePage } from "./pages/ProfilePage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleProtectedRoute } from "./components/RoleProtectedRoute";


function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<RoleProtectedRoute allowedRoles={["teacher"]} />}>
          <Route path="/create-theme" element={<CreateThemePage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
