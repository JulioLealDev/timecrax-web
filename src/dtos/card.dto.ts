import type { ImageDto } from "./cardQuizzes.dto";
import type { ImageQuizDto } from "./cardQuizzes.dto";
import type { TextQuizDto } from "./cardQuizzes.dto";
import type { TrueFalseQuizDto } from "./cardQuizzes.dto";
import type { CorrelationQuizDto } from "./cardQuizzes.dto";

export interface CardCreateDto {
  year: number;
  era: string;
  caption: string;
  image: ImageDto;
  imageQuiz: ImageQuizDto;
  textQuiz: TextQuizDto;
  trueFalseQuiz: TrueFalseQuizDto;
  correlationQuiz: CorrelationQuizDto;
}
