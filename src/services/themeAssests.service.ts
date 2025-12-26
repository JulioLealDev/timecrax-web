import { apiRequest } from "./api";

export type CreateSessionResponse = {
  sessionId: string;
  createdAt: string;
};

export type UploadAssetResponse = {
  slotKey: string;
  url: string;
};

export const themeAssetsService = {
  async createSession(): Promise<CreateSessionResponse> {
    return await apiRequest<CreateSessionResponse>("/theme-assets/sessions", {
      method: "POST",
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
};
