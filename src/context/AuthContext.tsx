import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService, type UserDto } from "../services/auth.service";

type AuthContextValue = {
  user: UserDto | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    schoolName: string,
    role: "student" | "teacher"
  ) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refreshMe() {
    const token = authService.getToken();
    if (!token) {
      setUser(null);
      return;
    }

    const me = await authService.me();
    setUser(me);
  }

  useEffect(() => {
    (async () => {
      try {
        await refreshMe();
      } catch {
        authService.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function login(email: string, password: string) {
    // 1) autentica (salva token/cookie)
    await authService.login({ email, password });

    // 2) carrega dados reais do usuário
    await refreshMe();
  }

  async function register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    schoolName: string,
    role: "student" | "teacher"
  ) {
    // 1) cria o usuário
    await authService.register({ firstName, lastName, email, password, schoolName, role });

    // 2) login automático (garante token)
    await authService.login({ email, password });

    // 3) carrega /me e popula contexto
    await refreshMe();
  }

  function logout() {
    authService.logout();
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout, refreshMe }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
