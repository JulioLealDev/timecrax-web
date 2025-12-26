
/* =========================
   EVENT CARD
========================= */

export type ImageDto =
  | { type: "dataUrl"; value: string } // ex: "data:image/png;base64,..."
  | { type: "url"; value: string };    // ex: "https://cdn.../img.png"

/* =========================
   IMAGE QUIZ
========================= */

export type ImageQuizOptionDto = {
  image: ImageDto;
};

export type ImageQuizDto = {
  question: string;
  options: [ImageQuizOptionDto, ImageQuizOptionDto, ImageQuizOptionDto, ImageQuizOptionDto];
  correctIndex: 0 | 1 | 2 | 3;
};

/* =========================
   TEXT QUIZ
========================= */

export type TextQuizOptionDto = {
  text: string;
};

export type TextQuizDto = {
  question: string;
  options: [TextQuizOptionDto, TextQuizOptionDto, TextQuizOptionDto, TextQuizOptionDto];
  correctIndex: 0 | 1 | 2 | 3;
};

/* =========================
   TRUE / FALSE QUIZ
========================= */

export type TrueFalseQuizDto = {
  statement: string;
  answer: boolean;
};

/* =========================
   CORRELATION QUIZ
========================= */

export type CorrelationItemDto = {
  image: ImageDto;
  text: string;
};

export type CorrelationQuizDto = {
  prompt: string;
  items: [CorrelationItemDto, CorrelationItemDto, CorrelationItemDto];
};
