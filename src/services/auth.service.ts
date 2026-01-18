import { apiRequest, API_BASE_URL } from "./api";

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

export type CompletedThemeDto = {
  id: string;
  name: string;
  image: string;
  completedAt: string;
};

export type UserDto = {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: "student" | "teacher" | "player";
  schoolName?: string | null;
  picture?: string | null;
  score: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  achievements?: AchievementDto[];
  currentMedal?: MedalDto | null;
  completedThemes?: CompletedThemeDto[];
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  role: "student" | "teacher" | "player";
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  schoolName?: string | null;
  language?: string;
};

export type AuthResponse = {
  token: string;
  user?: UserDto;
};

// API response types (handles both camelCase and PascalCase from backend)
type ApiUserResponse = {
  id?: string;
  Id?: string;
  userId?: string;
  email?: string;
  Email?: string;
  firstName?: string;
  FirstName?: string;
  lastName?: string;
  LastName?: string;
  role?: string;
  Role?: string;
  schoolName?: string | null;
  SchoolName?: string | null;
  picture?: string | null;
  Picture?: string | null;
  score?: number;
  Score?: number;
  achievements?: ApiAchievementResponse[];
  Achievements?: ApiAchievementResponse[];
  currentMedal?: ApiMedalResponse | null;
  CurrentMedal?: ApiMedalResponse | null;
  completedThemes?: ApiCompletedThemeResponse[];
  CompletedThemes?: ApiCompletedThemeResponse[];
};

type ApiAchievementResponse = {
  id?: string;
  Id?: string;
  name?: string;
  Name?: string;
  image?: string;
  Image?: string;
  description?: string;
  Description?: string;
  unlockedAt?: string | null;
  UnlockedAt?: string | null;
};

type ApiMedalResponse = {
  id?: string;
  Id?: string;
  name?: string;
  Name?: string;
  image?: string;
  Image?: string;
  minScore?: number;
  MinScore?: number;
};

type ApiCompletedThemeResponse = {
  id?: string;
  Id?: string;
  name?: string;
  Name?: string;
  image?: string;
  Image?: string;
  completedAt?: string;
  CompletedAt?: string;
};

type ApiAuthResponse = {
  token?: string;
  accessToken?: string;
  jwt?: string;
  user?: ApiUserResponse;
};

const TOKEN_KEY = "auth_token";

function toAbsoluteUrl(pathOrUrl?: string | null) {
  if (!pathOrUrl) return null;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
  return `${API_BASE_URL}${pathOrUrl}`;
}

function normalizeUser(u: ApiUserResponse): UserDto {
  const achievements = u?.achievements ?? u?.Achievements;
  const currentMedal = u?.currentMedal ?? u?.CurrentMedal;
  const completedThemes = u?.completedThemes ?? u?.CompletedThemes;

  return {
    id: u?.id ?? u?.userId ?? u?.Id,
    email: u?.email ?? u?.Email ?? "",
    firstName: u?.firstName ?? u?.FirstName,
    lastName: u?.lastName ?? u?.LastName,
    role: (u?.role ?? u?.Role) as UserDto["role"],
    schoolName: u?.schoolName ?? u?.SchoolName ?? null,
    picture: toAbsoluteUrl(u?.picture ?? u?.Picture ?? null),
    score: u?.score ?? u?.Score ?? 0,
    achievements: achievements ? achievements.map((a: ApiAchievementResponse) => ({
      id: a?.id ?? a?.Id ?? "",
      name: a?.name ?? a?.Name ?? "",
      image: a?.image ?? a?.Image ?? "",
      description: a?.description ?? a?.Description ?? "",
      unlockedAt: a?.unlockedAt ?? a?.UnlockedAt ?? null,
    })) : undefined,
    currentMedal: currentMedal ? {
      id: currentMedal?.id ?? currentMedal?.Id ?? "",
      name: currentMedal?.name ?? currentMedal?.Name ?? "",
      image: currentMedal?.image ?? currentMedal?.Image ?? "",
      minScore: currentMedal?.minScore ?? currentMedal?.MinScore ?? 0,
    } : null,
    completedThemes: completedThemes ? completedThemes.map((ct: ApiCompletedThemeResponse) => ({
      id: ct?.id ?? ct?.Id ?? "",
      name: ct?.name ?? ct?.Name ?? "",
      image: ct?.image ?? ct?.Image ?? "",
      completedAt: ct?.completedAt ?? ct?.CompletedAt ?? "",
    })) : undefined,
  };
}

function normalizeAuthResponse(data: ApiAuthResponse): AuthResponse {
  const token = data?.token || data?.accessToken || data?.jwt || "";

  const rawUser = data?.user;
  return {
    token,
    user: rawUser ? normalizeUser(rawUser) : undefined,
  };
}

export const authService = {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    const data = await apiRequest<ApiAuthResponse>("/auth/login", {
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
    const data = await apiRequest<ApiAuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const normalized = normalizeAuthResponse(data);

    if (normalized.token) {
      localStorage.setItem(TOKEN_KEY, normalized.token);
    }

    return normalized;
  },

  async me(language?: string): Promise<UserDto> {
    // Converte formato do i18n (pt_br) para formato do backend (pt-br)
    const lang = language?.replace("_", "-") || "en";
    const data = await apiRequest<ApiUserResponse>(`/me?language=${lang}`, { method: "GET" });
    return normalizeUser(data);
  },

  async forgotPassword(email: string, language: string): Promise<{ success: boolean }> {
    const data = await apiRequest<{ success: boolean }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email, language }),
    });
    return data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean }> {
    const data = await apiRequest<{ success: boolean }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
    return data;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
};
