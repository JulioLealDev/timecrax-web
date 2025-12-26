import { apiRequest } from "./api";

/** Ajuste conforme o schema real do backend */
export type ThemeCardRequest = {
  orderIndex: number;
  year: number;
  era?: "AC" | "DC"; // se seu backend tiver isso, senão remova
  caption: string;
  imageUrl: string; // por enquanto, você só tem dataUrl. Ver observação abaixo.

  imageQuiz: {
    question: string;
    options: { imageUrl: string }[];
    correctIndex: number;
  };

  textQuiz: {
    question: string;
    options: { text: string }[];
    correctIndex: number;
  };

  trueFalseQuiz: {
    statement: string;
    answer: boolean;
  };

  correlationQuiz: {
    items: { text: string; imageUrl: string }[];
  };
};

export type CreateThemeRequest = {
  name: string;
  image?: string | null;
  cards: ThemeCardRequest[];
};

export type UpdateThemeRequest = {
  name?: string;
  image?: string | null;
  cards?: ThemeCardRequest[];
};

export type ThemeResponse = {
  id: string;
  name: string;
  image?: string | null;
};

export const themesService = {
  async createTheme(payload: CreateThemeRequest): Promise<ThemeResponse> {
    return await apiRequest<ThemeResponse>("/themes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateTheme(id: string, payload: UpdateThemeRequest): Promise<void> {
    await apiRequest<void>(`/themes/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async getTheme(id: string): Promise<any> {
    return await apiRequest<any>(`/themes/${id}`, { method: "GET" });
  },
};
