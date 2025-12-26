import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Props = {
  allowedRoles: Array<"teacher" | "student">;
};

export function RoleProtectedRoute({ allowedRoles }: Props) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role as any)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
