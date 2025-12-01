/**
 * useResources Hook
 * 
 * Fetches curated beginner resources based on weak categories.
 * Combines knowledge bank data with AI ranking.
 * Implements caching to avoid redundant API calls.
 */

import { useState, useEffect, useCallback } from "react";
import { 
  getCachedResources, 
  cacheResources 
} from "@/lib/results/cache";
import { getBeginnerResources } from "@/lib/knowledge-bank";
import type { 
  Stage, 
  Category, 
  CuratedResourcesData, 
  CuratedResource,
  LoadingState 
} from "@/lib/results/types";

/**
 * Hook result type
 */
interface UseResourcesResult {
  data: CuratedResourcesData | null;
  status: LoadingState;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook options
 */
interface UseResourcesOptions {
  stage: Stage;
  totalScore: number;
  weakCategories: Category[];
  enabled?: boolean;
}

/**
 * Fetch resources with AI ranking from API
 */
async function fetchResourcesWithRanking(
  options: UseResourcesOptions
): Promise<CuratedResourcesData> {
  const response = await fetch("/api/v2/resources", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      stage: options.stage,
      weakCategories: options.weakCategories,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch resources: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Fallback: Get resources directly from knowledge bank without AI
 */
function getFallbackResources(
  weakCategories: Category[]
): CuratedResourcesData {
  const safeWeakCategories = Array.isArray(weakCategories) ? weakCategories : [];
  const resources = getBeginnerResources(safeWeakCategories, 5) || [];
  
  // Convert to CuratedResource with generic reason
  const curatedResources: CuratedResource[] = resources.map(r => ({
    ...r,
    reasonSelected: `Recommended for improving your ${r.category} skills.`,
  }));
  
  return { resources: curatedResources };
}

/**
 * Hook for fetching curated resources
 */
export function useResources(options: UseResourcesOptions): UseResourcesResult {
  const { stage, totalScore, weakCategories, enabled = true } = options;
  
  const [data, setData] = useState<CuratedResourcesData | null>(null);
  const [status, setStatus] = useState<LoadingState>("idle");
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    // Check cache first
    const cached = getCachedResources(stage, totalScore);
    if (cached) {
      setData(cached);
      setStatus("success");
      return;
    }
    
    // Fetch from API
    setStatus("loading");
    setError(null);
    
    try {
      const result = await fetchResourcesWithRanking(options);
      
      // Cache the result
      cacheResources(stage, totalScore, result);
      
      setData(result);
      setStatus("success");
    } catch (err) {
      // Fallback to knowledge bank if API fails
      console.warn("API failed, using fallback resources:", err);
      
      const fallback = getFallbackResources(weakCategories);
      setData(fallback);
      setStatus("success");
      
      // Don't cache fallback data
    }
  }, [stage, totalScore, weakCategories, enabled]);
  
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

export default useResources;


