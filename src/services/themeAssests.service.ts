import { apiRequest } from "./api";

export type CreateSessionResponse = {
  sessionId: string;
  themeId?: string;
  createdAt: string;
};

export type UploadAssetResponse = {
  slotKey: string;
  url: string;
};

export const themeAssetsService = {
  async createSession(themeId?: string): Promise<CreateSessionResponse> {
    return await apiRequest<CreateSessionResponse>("/theme-assets/sessions", {
      method: "POST",
      body: themeId ? JSON.stringify({ themeId }) : undefined,
      headers: themeId ? { "Content-Type": "application/json" } : undefined,
    });
  },

  async uploadOne(sessionId: string, file: File, slotKey: string): Promise<UploadAssetResponse> {
    const fd = new FormData();
    fd.append("file", file);       // IMPORTANT: tem que ser "file"
    fd.append("slotKey", slotKey); // IMPORTANT: tem que ser "slotKey"

    return await apiRequest<UploadAssetResponse>(`/theme-assets/sessions/${sessionId}/upload`, {
      method: "POST",
      body: fd,
    });
  },

  async deleteCardAssets(sessionId: string, cardIndex: number): Promise<{ deletedCount: number; message: string }> {
    return await apiRequest<{ deletedCount: number; message: string }>(
      `/theme-assets/sessions/${sessionId}/cards/${cardIndex}`,
      {
        method: "DELETE",
      }
    );
  },
};
