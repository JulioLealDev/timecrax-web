export type CardDraft = {
  orderIndex: number;   // <<<<<< adicionar
  year: string;
  era?: "AC" | "DC";
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
};

export type SavedCard = CardDraft & { id: string };
