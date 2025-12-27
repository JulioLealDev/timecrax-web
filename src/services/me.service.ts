import { apiRequest } from "./api";

export type UpdateProfileRequest = {
  firstName: string;
  lastName: string;
  schoolName: string;
};

export type UpdatePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type MeResponse = {
  userId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  schoolName?: string | null;
  role?: "student" | "teacher" | string;
  picture?: string | null;
};

export type RankingUser = {
  id: string;
  name: string;
  score: number;
};

export const meService = {
  async getMe(): Promise<MeResponse> {
    return await apiRequest<MeResponse>("/me", { method: "GET" });
  },

  async updateProfile(payload: UpdateProfileRequest): Promise<void> {
    await apiRequest<void>("/me/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async changePassword(payload: UpdatePasswordRequest): Promise<void> {
    await apiRequest<void>("/me/password", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async uploadPicture(file: File): Promise<{ picture: string }> {
    const formData = new FormData();
    formData.append("file", file);

    return await apiRequest<{ picture: string }>("/me/picture", {
      method: "POST",
      body: formData,
      headers: {}, // IMPORTANTE: não definir Content-Type
    });
  },

  async getRanking(): Promise<RankingUser[]> {
    return await apiRequest<RankingUser[]>("/me/ranking", {
      method: "GET",
    });
  },
};
