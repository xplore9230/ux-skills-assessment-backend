import { useState, useCallback, useRef } from "react";
import { calculateResults } from "@/lib/scoring";
import type { 
  CategoryScore, 
  ImprovementWeek, 
  Resource, 
  DeepDiveTopic, 
  JobLinks, 
  LayoutStrategy, 
  CategoryInsight 
} from "@/types";

export type PrecomputationStatus = 'idle' | 'computing' | 'cached' | 'error';

export interface PrecomputedResults {
  // Core results
  stage: string;
  totalScore: number;
  maxScore: number;
  summary: string;
  categories: CategoryScore[];
  
  // AI-generated content
  improvementPlan?: ImprovementWeek[];
  stageReadup?: string;
  resources?: Resource[];
  deepDiveTopics?: DeepDiveTopic[];
  jobLinks?: JobLinks;
  layoutStrategy?: LayoutStrategy;
  categoryInsights?: CategoryInsight[];
  
  // Metadata
  isPreliminary: boolean;
  computedAt: number;
}

interface UseBackgroundComputationReturn {
  precomputationStatus: PrecomputationStatus;
  cachedResults: PrecomputedResults | null;
  startPrecomputation: (partialAnswers: Record<string, number>) => Promise<void>;
  clearCache: () => void;
}

const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL || "http://localhost:8000";

/**
 * Hook to manage background precomputation of results
 * Starts computing results when user is at 50% completion
 */
export function useBackgroundComputation(): UseBackgroundComputationReturn {
  const [status, setStatus] = useState<PrecomputationStatus>('idle');
  const [cachedResults, setCachedResults] = useState<PrecomputedResults | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isComputingRef = useRef(false);

  const startPrecomputation = useCallback(async (partialAnswers: Record<string, number>) => {
    // Prevent duplicate precomputation calls
    if (isComputingRef.current || status === 'cached') {
      return;
    }

    isComputingRef.current = true;
    setStatus('computing');

    // Create abort controller for cleanup
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      // First, calculate preliminary results locally
      const preliminaryResults = calculateResults(partialAnswers);
      
      // Prepare preliminary cached results with local data
      const preliminary: PrecomputedResults = {
        stage: preliminaryResults.stage,
        totalScore: preliminaryResults.totalScore,
        maxScore: preliminaryResults.maxScore,
        summary: preliminaryResults.summary,
        categories: preliminaryResults.categories,
        improvementPlan: preliminaryResults.improvementPlan,
        isPreliminary: true,
        computedAt: Date.now(),
      };

      // Start all API calls in parallel (fire and forget, will update cache as they complete)
      const apiCalls = [
        // 1. Generate improvement plan
        fetch(`${PYTHON_API_URL}/api/generate-improvement-plan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stage: preliminaryResults.stage,
            totalScore: preliminaryResults.totalScore,
            maxScore: preliminaryResults.maxScore,
            categories: preliminaryResults.categories,
          }),
          signal,
        }).then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            if (data.weeks && Array.isArray(data.weeks)) {
              preliminary.improvementPlan = data.weeks;
            }
          }
        }).catch((err) => {
          if (err.name !== 'AbortError') {
            console.warn("Failed to precompute improvement plan:", err);
          }
        }),

        // 2. Generate resources and stage readup
        fetch(`${PYTHON_API_URL}/api/generate-resources`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stage: preliminaryResults.stage,
            categories: preliminaryResults.categories,
          }),
          signal,
        }).then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            if (data) {
              preliminary.stageReadup = data.readup || "";
              preliminary.resources = Array.isArray(data.resources) ? data.resources : [];
            }
          }
        }).catch((err) => {
          if (err.name !== 'AbortError') {
            console.warn("Failed to precompute resources:", err);
          }
        }),

        // 3. Generate deep dive topics
        fetch(`${PYTHON_API_URL}/api/generate-deep-dive`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stage: preliminaryResults.stage,
            categories: preliminaryResults.categories,
          }),
          signal,
        }).then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.topics)) {
              preliminary.deepDiveTopics = data.topics;
            }
          }
        }).catch((err) => {
          if (err.name !== 'AbortError') {
            console.warn("Failed to precompute deep dive:", err);
          }
        }),

        // 4. Fetch job links
        fetch(`${PYTHON_API_URL}/api/job-search-links?stage=${encodeURIComponent(preliminaryResults.stage)}&location=Remote`, {
          signal,
        }).then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            if (data && data.job_title && data.linkedin_url && data.google_url) {
              preliminary.jobLinks = data;
            }
          }
        }).catch((err) => {
          if (err.name !== 'AbortError') {
            console.warn("Failed to precompute job links:", err);
          }
        }),

        // 5. Generate layout strategy
        fetch(`${PYTHON_API_URL}/api/generate-layout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stage: preliminaryResults.stage,
            totalScore: preliminaryResults.totalScore,
            maxScore: preliminaryResults.maxScore,
            categories: preliminaryResults.categories,
          }),
          signal,
        }).then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            if (data && data.section_order && data.section_visibility) {
              preliminary.layoutStrategy = data;
            }
          }
        }).catch((err) => {
          if (err.name !== 'AbortError') {
            console.warn("Failed to precompute layout:", err);
          }
        }),

        // 6. Generate category insights
        fetch(`${PYTHON_API_URL}/api/generate-category-insights`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stage: preliminaryResults.stage,
            totalScore: preliminaryResults.totalScore,
            maxScore: preliminaryResults.maxScore,
            categories: preliminaryResults.categories,
          }),
          signal,
        }).then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.insights)) {
              preliminary.categoryInsights = data.insights;
            }
          }
        }).catch((err) => {
          if (err.name !== 'AbortError') {
            console.warn("Failed to precompute insights:", err);
          }
        }),
      ];

      // Wait for all API calls to complete (or fail silently)
      await Promise.allSettled(apiCalls);

      // Check if we were aborted
      if (signal.aborted) {
        return;
      }

      // Cache the results
      setCachedResults(preliminary);
      setStatus('cached');
      isComputingRef.current = false;

      console.log("✅ Precomputation complete:", {
        stage: preliminary.stage,
        hasImprovementPlan: !!preliminary.improvementPlan,
        hasResources: !!preliminary.resources,
        hasDeepDive: !!preliminary.deepDiveTopics,
        hasJobLinks: !!preliminary.jobLinks,
        hasLayout: !!preliminary.layoutStrategy,
        hasInsights: !!preliminary.categoryInsights,
      });

    } catch (error) {
      if (abortControllerRef.current?.signal.aborted) {
        console.log("Precomputation aborted");
        return;
      }
      
      console.error("Precomputation error:", error);
      setStatus('error');
      isComputingRef.current = false;
    }
  }, [status]);

  const clearCache = useCallback(() => {
    // Abort any ongoing computation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setCachedResults(null);
    setStatus('idle');
    isComputingRef.current = false;
  }, []);

  return {
    precomputationStatus: status,
    cachedResults,
    startPrecomputation,
    clearCache,
  };
}

