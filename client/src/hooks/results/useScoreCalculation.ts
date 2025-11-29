/**
 * useScoreCalculation Hook
 * 
 * Pure client-side hook for calculating quiz results from answers.
 * No API calls - runs the scoring logic locally.
 */

import { useMemo } from "react";
import { calculateQuizResults, validateAnswers } from "@/lib/results/scoring";
import type { QuizAnswers, QuizResults } from "@/lib/results/types";

/**
 * Hook result type
 */
interface UseScoreCalculationResult {
  results: QuizResults | null;
  isValid: boolean;
  error: string | null;
}

/**
 * Calculate quiz results from answers
 * 
 * @param answers - Map of questionId to selected value (1-5)
 * @returns Calculated results, validity flag, and any error
 */
export function useScoreCalculation(
  answers: QuizAnswers | null | undefined
): UseScoreCalculationResult {
  return useMemo(() => {
    // Handle null/undefined answers
    if (!answers) {
      return {
        results: null,
        isValid: false,
        error: "No answers provided",
      };
    }
    
    // Validate answer structure
    if (!validateAnswers(answers)) {
      return {
        results: null,
        isValid: false,
        error: "Invalid answer format",
      };
    }
    
    try {
      // Calculate results
      const results = calculateQuizResults(answers);
      
      return {
        results,
        isValid: true,
        error: null,
      };
    } catch (error) {
      return {
        results: null,
        isValid: false,
        error: error instanceof Error ? error.message : "Calculation failed",
      };
    }
  }, [answers]);
}

export default useScoreCalculation;


