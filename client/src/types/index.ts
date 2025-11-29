// Shared type definitions for the UX Skills Assessment Quiz

export interface Question {
  id: string;
  text: string;
  category: string;
  options: { value: number; label: string }[];
}

export type AppState = "landing" | "quiz";

