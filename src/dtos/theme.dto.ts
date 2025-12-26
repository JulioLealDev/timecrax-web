import type { CardCreateDto } from "./card.dto";

export interface ThemeCreateDto {
  name: string;
  image: string;
  cards: CardCreateDto[];
}