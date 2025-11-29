/**
 * useMeaning Hook
 * 
 * Fetches AI-generated "What this means for you" text.
 * Implements caching to avoid redundant API calls.
 */

import { useState, useEffect, useCallback } from "react";
import { 
  getCachedMeaning, 
  cacheMeaning 
} from "@/lib/results/cache";
import type { 
  Stage, 
  Category, 
  MeaningData, 
  LoadingState 
} from "@/lib/results/types";

/**
 * Hook result type
 */
interface UseMeaningResult {
  data: MeaningData | null;
  status: LoadingState;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook options
 */
interface UseMeaningOptions {
  stage: Stage;
  totalScore: number;
  strongCategories: Category[];
  weakCategories: Category[];
  enabled?: boolean;
}

/**
 * Fetch meaning from API
 */
async function fetchMeaning(options: UseMeaningOptions): Promise<MeaningData> {
  const response = await fetch("/api/v2/meaning", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      stage: options.stage,
      totalScore: options.totalScore,
      strongCategories: options.strongCategories,
      weakCategories: options.weakCategories,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch meaning: ${response.status}`);
  }
  
  return response.json();
}

import { generateMeaningText } from "@/lib/results/fallback-generators";

/**
 * Hook for fetching AI-generated meaning
 */
export function useMeaning(options: UseMeaningOptions): UseMeaningResult {
  const { stage, totalScore, strongCategories, weakCategories, enabled = true } = options;
  
  const [data, setData] = useState<MeaningData | null>(null);
  const [status, setStatus] = useState<LoadingState>("idle");
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    // Check cache first
    const cached = getCachedMeaning(stage, totalScore);
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
        const result = await fetchMeaning(options); // Pass options which has all needed data
        clearTimeout(timeoutId);
        
        // Cache the result
        cacheMeaning(stage, totalScore, result);
        
        setData(result);
        setStatus("success");
      } catch (err) {
        clearTimeout(timeoutId);
        throw err; // Re-throw to trigger fallback
      }
    } catch (err) {
      console.warn("API failed, using fallback meaning:", err);
      
      // Fallback to client-side generation
      const meaningText = generateMeaningText(
        stage, 
        totalScore, 
        strongCategories, 
        weakCategories
      );
      
      const fallbackData: MeaningData = { meaning: meaningText };
      
      setData(fallbackData);
      setStatus("success"); // Mark as success so UI renders
      // Don't cache fallback data usually, but for reliability we could. 
      // Let's NOT cache fallback so next time it might try API again.
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

export default useMeaning;


