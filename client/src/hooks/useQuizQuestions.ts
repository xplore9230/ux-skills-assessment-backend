import { useMemo } from "react";
import { getRandomQuestions } from "@/data/questions";
import type { Question } from "@/types";

/**
 * Custom hook to manage quiz questions with memoization
 * Questions are generated once per session and cached until reset
 */
export function useQuizQuestions(resetKey: number = 0): Question[] {
  const questions = useMemo(() => {
    return getRandomQuestions();
  }, [resetKey]);

  return questions;
}

