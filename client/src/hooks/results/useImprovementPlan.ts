/**
 * useImprovementPlan Hook
 * 
 * Fetches AI-generated 3-week improvement plan.
 * This is lazy-loaded after other sections complete.
 * No static fallback - fully AI-generated.
 */

import { useState, useEffect, useCallback } from "react";
import type { 
  Stage, 
  Category, 
  CategoryScore,
  ImprovementPlanData, 
  LoadingState 
} from "@/lib/results/types";

/**
 * Hook result type
 */
interface UseImprovementPlanResult {
  data: ImprovementPlanData | null;
  status: LoadingState;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook options
 */
interface UseImprovementPlanOptions {
  stage: Stage;
  strongCategories: Category[];
  weakCategories: Category[];
  categories?: CategoryScore[];
  enabled?: boolean;
}

/**
 * Fetch improvement plan from API
 */
async function fetchImprovementPlan(
  options: UseImprovementPlanOptions
): Promise<ImprovementPlanData> {
  const response = await fetch("/api/v2/improvement-plan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      stage: options.stage,
      strongCategories: options.strongCategories,
      weakCategories: options.weakCategories,
      categories: options.categories,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch improvement plan: ${response.status}`);
  }
  
  return response.json();
}

import { generateImprovementPlan } from "@/lib/results/fallback-generators";

/**
 * Hook for fetching AI-generated improvement plan
 * 
 * Note: This hook does NOT cache because the improvement plan
 * should be freshly generated for each session.
 */
export function useImprovementPlan(
  options: UseImprovementPlanOptions
): UseImprovementPlanResult {
  const { stage, strongCategories, weakCategories, categories, enabled = true } = options;
  
  const [data, setData] = useState<ImprovementPlanData | null>(null);
  const [status, setStatus] = useState<LoadingState>("idle");
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = useCallback(async () => {
    if (!enabled) {
      setStatus("idle");
      return;
    }
    
    // Fetch from API (no caching for improvement plan)
    setStatus("loading");
    setError(null);
    
    try {
      // Try API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout (longer for plan)
      
      try {
        const result = await fetchImprovementPlan(options);
        clearTimeout(timeoutId);
        
        setData(result);
        setStatus("success");
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    } catch (err) {
      console.warn("API failed, using fallback improvement plan:", err);
      
      // Fallback to client-side generation
      const weeks = generateImprovementPlan(stage, strongCategories, weakCategories);
      
      const fallbackData: ImprovementPlanData = { weeks };
      
      setData(fallbackData);
      setStatus("success");
    }
  }, [stage, strongCategories, weakCategories, categories, enabled]);
  
  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return {
    data,
    status,
    error,
    refetch: fetchData,
  };
}

export default useImprovementPlan;


