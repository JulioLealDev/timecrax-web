export type CardDraft = {
  orderIndex: number;   // <<<<<< adicionar
  year: string;
  era?: "BC" | "AD";
  caption: string;

  imageFile?: File;
  imageUrl?: string;
  imagePreview?: string;

  imageQuiz: {
    question: string;
    options: { imageFile?: File; imageUrl?: string }[];
    correctIndex: number | null;
  };

  textQuiz: {
    question: string;
    options: { text: string }[];
    correctIndex: number | null;
  };

  trueFalseQuiz: {
    statement: string;
    answer: "true" | "false" | null;
  };

  correlationQuiz: {
    prompt: string;
    items: { imageFile?: File; imageUrl?: string; text: string }[];
  };

  localizationQuiz: {
    mapImageFile?: File;
    mapImageUrl?: string;
    mapImagePreview?: string;
    mapOffset: { x: number; y: number };
    mapScale: number; // 0 = not yet initialized
    spots: { x: number; y: number; isCorrect: boolean }[];
  };
};

export type SavedCard = CardDraft & { id: string };
