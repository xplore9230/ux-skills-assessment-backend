/**
 * useImprovementPlan Hook
 * 
 * Fetches AI-generated 3-week improvement plan.
 * This is lazy-loaded after other sections complete.
 * Implements caching to avoid redundant API calls on page reload.
 */

import { useState, useEffect, useCallback } from "react";
import { 
  getCachedImprovementPlan, 
  cacheImprovementPlan 
} from "@/lib/results/cache";
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
  totalScore: number;
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
 * Implements caching to avoid redundant API calls on page reload.
 * Cache is keyed by stage + totalScore, expires after 24 hours.
 */
export function useImprovementPlan(
  options: UseImprovementPlanOptions
): UseImprovementPlanResult {
  const { stage, totalScore, strongCategories, weakCategories, categories, enabled = true } = options;
  
  const [data, setData] = useState<ImprovementPlanData | null>(null);
  const [status, setStatus] = useState<LoadingState>("idle");
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = useCallback(async () => {
    if (!enabled) {
      setStatus("idle");
      return;
    }
    
    // Check cache first
    const cached = getCachedImprovementPlan(stage, totalScore);
    if (cached) {
      setData(cached);
      setStatus("success");
      return;
    }
    
    // Fetch from API
    setStatus("loading");
    setError(null);
    
    try {
      // Try API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout (longer for plan)
      
      try {
        const result = await fetchImprovementPlan(options);
        clearTimeout(timeoutId);
        
        // Cache the result
        cacheImprovementPlan(stage, totalScore, result);
        
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
      
      // Don't cache fallback data
    }
  }, [stage, totalScore, strongCategories, weakCategories, categories, enabled]);
  
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


