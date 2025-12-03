/**
 * Results Cache Layer
 * 
 * Client-side caching for AI-generated results using localStorage.
 * Implements TTL-based expiration and version control for invalidation.
 */

import type { 
  Stage, 
  CacheEntry, 
  CacheKeyParams,
  MeaningData,
  SkillAnalysisData,
  CuratedResourcesData,
  DeepInsightsData,
  ImprovementPlanData,
} from "./types";
import { getScoreBucket } from "./scoring";

// ========================================
// CONSTANTS
// ========================================

/**
 * Cache key prefix
 */
const CACHE_PREFIX = "ux_results_v2";

/**
 * Current cache version (increment to invalidate all cached data)
 * 
 * VERSION HISTORY:
 * v1: Initial version (had placeholder data bug)
 * v2: Fixed placeholder data issue - now using real knowledge bank
 * v3: Stage-based resource overhaul + podcast section
 * 
 * IMPORTANT: Increment this version if you need to invalidate cached data
 * (e.g., after fixing data issues or changing response format)
 */
const CACHE_VERSION = 3;

/**
 * Default TTL in milliseconds (24 hours)
 */
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Section identifiers for cache keys
 */
export type CacheSection = 
  | "meaning"
  | "skill-analysis"
  | "resources"
  | "deep-insights"
  | "improvement-plan";

// ========================================
// CACHE KEY GENERATION
// ========================================

/**
 * Generate a cache key from parameters
 */
export function generateCacheKey(params: CacheKeyParams): string {
  const { stage, scoreBucket, section } = params;
  return `${CACHE_PREFIX}_${stage}_${scoreBucket}_${section}`;
}

/**
 * Generate cache key for a specific section
 */
export function getCacheKeyForSection(
  stage: Stage,
  totalScore: number,
  section: CacheSection
): string {
  const scoreBucket = getScoreBucket(totalScore);
  return generateCacheKey({ stage, scoreBucket, section });
}

// ========================================
// CACHE OPERATIONS
// ========================================

/**
 * Get data from cache
 * Returns null if not found, expired, or version mismatch
 */
export function getFromCache<T>(key: string): T | null {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) {
      return null;
    }
    
    const entry: CacheEntry<T> = JSON.parse(stored);
    
    // Check version
    if (entry.version !== CACHE_VERSION) {
      // Version mismatch - remove stale entry
      localStorage.removeItem(key);
      return null;
    }
    
    // Check expiration
    const now = new Date().toISOString();
    if (now > entry.expiresAt) {
      // Expired - remove stale entry
      localStorage.removeItem(key);
      return null;
    }
    
    return entry.data;
  } catch (error) {
    // Invalid JSON or other error - remove entry
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore removal errors
    }
    return null;
  }
}

/**
 * Store data in cache with TTL
 */
export function setCache<T>(
  key: string, 
  data: T, 
  ttlMs: number = DEFAULT_TTL_MS
): void {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMs);
    
    const entry: CacheEntry<T> = {
      data,
      cachedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      version: CACHE_VERSION,
    };
    
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    // Storage full or other error - fail silently
    console.warn("Failed to cache data:", error);
  }
}

/**
 * Remove a specific cache entry
 */
export function removeFromCache(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore removal errors
  }
}

/**
 * Clear all results cache entries
 */
export function clearResultsCache(): void {
  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.warn("Failed to clear cache:", error);
  }
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): void {
  try {
    const keysToRemove: string[] = [];
    const now = new Date().toISOString();
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const entry = JSON.parse(stored) as CacheEntry<unknown>;
            if (entry.version !== CACHE_VERSION || now > entry.expiresAt) {
              keysToRemove.push(key);
            }
          }
        } catch {
          // Invalid entry - mark for removal
          keysToRemove.push(key);
        }
      }
    }
    
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.warn("Failed to clear expired cache:", error);
  }
}

// ========================================
// SECTION-SPECIFIC CACHE HELPERS
// ========================================

/**
 * Get cached meaning data
 */
export function getCachedMeaning(
  stage: Stage,
  totalScore: number
): MeaningData | null {
  const key = getCacheKeyForSection(stage, totalScore, "meaning");
  return getFromCache<MeaningData>(key);
}

/**
 * Cache meaning data
 */
export function cacheMeaning(
  stage: Stage,
  totalScore: number,
  data: MeaningData
): void {
  const key = getCacheKeyForSection(stage, totalScore, "meaning");
  setCache(key, data);
}

/**
 * Get cached skill analysis data
 */
export function getCachedSkillAnalysis(
  stage: Stage,
  totalScore: number
): SkillAnalysisData | null {
  const key = getCacheKeyForSection(stage, totalScore, "skill-analysis");
  return getFromCache<SkillAnalysisData>(key);
}

/**
 * Cache skill analysis data
 */
export function cacheSkillAnalysis(
  stage: Stage,
  totalScore: number,
  data: SkillAnalysisData
): void {
  const key = getCacheKeyForSection(stage, totalScore, "skill-analysis");
  setCache(key, data);
}

/**
 * Get cached resources data
 */
export function getCachedResources(
  stage: Stage,
  totalScore: number
): CuratedResourcesData | null {
  const key = getCacheKeyForSection(stage, totalScore, "resources");
  return getFromCache<CuratedResourcesData>(key);
}

/**
 * Cache resources data
 */
export function cacheResources(
  stage: Stage,
  totalScore: number,
  data: CuratedResourcesData
): void {
  const key = getCacheKeyForSection(stage, totalScore, "resources");
  setCache(key, data);
}

/**
 * Get cached deep insights data
 */
export function getCachedDeepInsights(
  stage: Stage,
  totalScore: number
): DeepInsightsData | null {
  const key = getCacheKeyForSection(stage, totalScore, "deep-insights");
  return getFromCache<DeepInsightsData>(key);
}

/**
 * Cache deep insights data
 */
export function cacheDeepInsights(
  stage: Stage,
  totalScore: number,
  data: DeepInsightsData
): void {
  const key = getCacheKeyForSection(stage, totalScore, "deep-insights");
  setCache(key, data);
}

/**
 * Get cached improvement plan data
 */
export function getCachedImprovementPlan(
  stage: Stage,
  totalScore: number
): ImprovementPlanData | null {
  const key = getCacheKeyForSection(stage, totalScore, "improvement-plan");
  return getFromCache<ImprovementPlanData>(key);
}

/**
 * Cache improvement plan data
 */
export function cacheImprovementPlan(
  stage: Stage,
  totalScore: number,
  data: ImprovementPlanData
): void {
  const key = getCacheKeyForSection(stage, totalScore, "improvement-plan");
  setCache(key, data);
}

// ========================================
// CACHE STATISTICS
// ========================================

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  totalEntries: number;
  validEntries: number;
  expiredEntries: number;
  totalSizeBytes: number;
} {
  let totalEntries = 0;
  let validEntries = 0;
  let expiredEntries = 0;
  let totalSizeBytes = 0;
  const now = new Date().toISOString();
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        totalEntries++;
        const stored = localStorage.getItem(key);
        if (stored) {
          totalSizeBytes += stored.length * 2; // Approximate UTF-16 size
          try {
            const entry = JSON.parse(stored) as CacheEntry<unknown>;
            if (entry.version === CACHE_VERSION && now <= entry.expiresAt) {
              validEntries++;
            } else {
              expiredEntries++;
            }
          } catch {
            expiredEntries++;
          }
        }
      }
    }
  } catch (error) {
    console.warn("Failed to get cache stats:", error);
  }
  
  return {
    totalEntries,
    validEntries,
    expiredEntries,
    totalSizeBytes,
  };
}

// ========================================
// INITIALIZATION
// ========================================

/**
 * Initialize cache - clear expired entries
 * Call this on app startup
 */
export function initializeCache(): void {
  clearExpiredCache();
}


