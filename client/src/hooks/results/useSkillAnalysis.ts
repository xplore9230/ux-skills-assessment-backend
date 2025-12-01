/**
 * useSkillAnalysis Hook
 * 
 * Fetches AI-generated skill analysis with descriptions and checklists.
 * Implements caching to avoid redundant API calls.
 */

import { useState, useEffect, useCallback } from "react";
import { 
  getCachedSkillAnalysis, 
  cacheSkillAnalysis 
} from "@/lib/results/cache";
import type { 
  Stage, 
  CategoryScore, 
  SkillAnalysisData, 
  LoadingState 
} from "@/lib/results/types";

/**
 * Hook result type
 */
interface UseSkillAnalysisResult {
  data: SkillAnalysisData | null;
  status: LoadingState;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook options
 */
interface UseSkillAnalysisOptions {
  categories: CategoryScore[];
  stage: Stage;
  totalScore: number;
  enabled?: boolean;
}

/**
 * Fetch skill analysis from API
 */
async function fetchSkillAnalysis(
  options: UseSkillAnalysisOptions
): Promise<SkillAnalysisData> {
  const response = await fetch("/api/v2/skill-analysis", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      categories: options.categories,
      stage: options.stage,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch skill analysis: ${response.status}`);
  }
  
  return response.json();
}

import { generateCategoryInsight } from "@/lib/results/fallback-generators";

/**
 * Hook for fetching AI-generated skill analysis
 */
export function useSkillAnalysis(
  options: UseSkillAnalysisOptions
): UseSkillAnalysisResult {
  const { categories, stage, totalScore, enabled = true } = options;
  
  const [data, setData] = useState<SkillAnalysisData | null>(null);
  const [status, setStatus] = useState<LoadingState>("idle");
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    // Check cache first
    const cached = getCachedSkillAnalysis(stage, totalScore);
    if (cached) {
      setData(cached);
      setStatus("success");
      return;
    }
    
    // Fetch from API with fallback
    setStatus("loading");
    setError(null);
    
    try {
      // Try API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
      
      try {
        const result = await fetchSkillAnalysis(options);
        clearTimeout(timeoutId);
        
        // Cache the result
        cacheSkillAnalysis(stage, totalScore, result);
        
        setData(result);
        setStatus("success");
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    } catch (err) {
      console.warn("API failed, using fallback skill analysis:", err);
      
      // Fallback to client-side generation
      const safeCategories = Array.isArray(categories) ? categories : [];
      const insights = safeCategories.map(cat => generateCategoryInsight(cat, stage));
      
      const fallbackData: SkillAnalysisData = { insights };
      
      setData(fallbackData);
      setStatus("success");
    }
  }, [categories, stage, totalScore, enabled]);
  
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

export default useSkillAnalysis;


