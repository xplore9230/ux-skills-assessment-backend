/**
 * useDeepInsights Hook
 * 
 * Fetches advanced learning resources for growth areas.
 * Combines knowledge bank data with AI personalization.
 * Implements caching to avoid redundant API calls.
 */

import { useState, useEffect, useCallback } from "react";
import { 
  getCachedDeepInsights, 
  cacheDeepInsights 
} from "@/lib/results/cache";
import { getAdvancedResources } from "@/lib/knowledge-bank";
import type { 
  Stage, 
  Category, 
  DeepInsightsData, 
  DeepInsight,
  LoadingState 
} from "@/lib/results/types";

/**
 * Hook result type
 */
interface UseDeepInsightsResult {
  data: DeepInsightsData | null;
  status: LoadingState;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook options
 */
interface UseDeepInsightsOptions {
  stage: Stage;
  totalScore: number;
  strongCategories: Category[];
  weakCategories: Category[];
  enabled?: boolean;
}

/**
 * Fetch deep insights with AI personalization from API
 */
async function fetchDeepInsightsWithAI(
  options: UseDeepInsightsOptions
): Promise<DeepInsightsData> {
  const response = await fetch("/api/v2/deep-insights", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      stage: options.stage,
      strongCategories: options.strongCategories,
      weakCategories: options.weakCategories,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch deep insights: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Fallback: Get resources directly from knowledge bank without AI
 */
function getFallbackDeepInsights(
  stage: Stage,
  strongCategories: Category[],
  weakCategories: Category[]
): DeepInsightsData {
  const resources = getAdvancedResources(
    stage,
    strongCategories,
    weakCategories,
    6
  );
  
  // Convert to DeepInsight with generic reason
  const insights: DeepInsight[] = resources.map(r => ({
    ...r,
    whyThisForYou: `This ${r.level} ${r.type} will help strengthen your ${r.category} skills.`,
  }));
  
  return { insights };
}

/**
 * Hook for fetching deep insights
 */
export function useDeepInsights(
  options: UseDeepInsightsOptions
): UseDeepInsightsResult {
  const { 
    stage, 
    totalScore, 
    strongCategories, 
    weakCategories, 
    enabled = true 
  } = options;
  
  const [data, setData] = useState<DeepInsightsData | null>(null);
  const [status, setStatus] = useState<LoadingState>("idle");
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    // Check cache first
    const cached = getCachedDeepInsights(stage, totalScore);
    if (cached) {
      setData(cached);
      setStatus("success");
      return;
    }
    
    // Fetch from API
    setStatus("loading");
    setError(null);
    
    try {
      const result = await fetchDeepInsightsWithAI(options);
      
      // Cache the result
      cacheDeepInsights(stage, totalScore, result);
      
      setData(result);
      setStatus("success");
    } catch (err) {
      // Fallback to knowledge bank if API fails
      console.warn("API failed, using fallback deep insights:", err);
      
      const fallback = getFallbackDeepInsights(
        stage,
        strongCategories,
        weakCategories
      );
      setData(fallback);
      setStatus("success");
      
      // Don't cache fallback data
    }
  }, [stage, totalScore, strongCategories, weakCategories, enabled]);
  
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

export default useDeepInsights;


