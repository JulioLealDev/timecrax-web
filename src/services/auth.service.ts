import { apiRequest } from "./api";

export type AchievementDto = {
  id: string;
  name: string;
  image: string;
  description: string;
  unlockedAt: string | null;
};

export type MedalDto = {
  id: string;
  name: string;
  image: string;
  minScore: number;
};

export type UserDto = {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: "student" | "teacher";
  schoolName?: string | null;
  picture?: string | null;
  score: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  achievements?: AchievementDto[];
  currentMedal?: MedalDto | null;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  role: "student" | "teacher";
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  schoolName?: string | null;
};

export type AuthResponse = {
  token: string;
  user?: UserDto;
};

const TOKEN_KEY = "auth_token";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5139";

function toAbsoluteUrl(pathOrUrl?: string | null) {
  if (!pathOrUrl) return null;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
  return `${API_BASE_URL}${pathOrUrl}`;
}

function normalizeUser(u: any): UserDto {
  const achievements = u?.achievements ?? u?.Achievements;
  const currentMedal = u?.currentMedal ?? u?.CurrentMedal;

  return {
    id: u?.id ?? u?.userId ?? u?.Id,
    email: u?.email ?? u?.Email,
    firstName: u?.firstName ?? u?.FirstName,
    lastName: u?.lastName ?? u?.LastName,
    role: u?.role ?? u?.Role,
    schoolName: u?.schoolName ?? u?.SchoolName ?? null,
    picture: toAbsoluteUrl(u?.picture ?? u?.Picture ?? null),
    score: u?.score ?? u?.Score,
    achievements: achievements ? achievements.map((a: any) => ({
      id: a?.id ?? a?.Id,
      name: a?.name ?? a?.Name,
      image: a?.image ?? a?.Image,
      description: a?.description ?? a?.Description,
      unlockedAt: a?.unlockedAt ?? a?.UnlockedAt ?? null,
    })) : undefined,
    currentMedal: currentMedal ? {
      id: currentMedal?.id ?? currentMedal?.Id,
      name: currentMedal?.name ?? currentMedal?.Name,
      image: currentMedal?.image ?? currentMedal?.Image,
      minScore: currentMedal?.minScore ?? currentMedal?.MinScore,
    } : null,
  };
}

function normalizeAuthResponse(data: any): AuthResponse {
  const token = data?.token || data?.accessToken || data?.jwt || "";

  // login pode não retornar user; nesse caso, não force normalizeUser(data)
  const rawUser = data?.user;
  return {
    token,
    user: rawUser ? normalizeUser(rawUser) : undefined,
  };
}

export const authService = {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    const data = await apiRequest<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const normalized = normalizeAuthResponse(data);

    if (normalized.token) {
      localStorage.setItem(TOKEN_KEY, normalized.token);
    }

    return normalized;
  },

  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const data = await apiRequest<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const normalized = normalizeAuthResponse(data);

    if (normalized.token) {
      localStorage.setItem(TOKEN_KEY, normalized.token);
    }

    return normalized;
  },

  async me(): Promise<UserDto> {
    const data = await apiRequest<any>("/me", { method: "GET" });
    return normalizeUser(data);
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
};
