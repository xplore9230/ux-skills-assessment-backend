/**
 * Results Library - Barrel Export
 * 
 * Re-exports all types, functions, and utilities for the results page.
 */

// Types
export * from "./types";

// Scoring logic
export { 
  calculateQuizResults,
  deriveStage,
  deriveBand,
  categoryNameToId,
  categoryIdToName,
  getScoreBucket,
  isPassingScore,
  getBandColorClass,
  getBandBgClass,
  getStageColorClass,
  getStageBgClass,
  validateAnswers,
  getCategoryForQuestion,
  CATEGORY_ORDER,
} from "./scoring";

// Stage configuration
export {
  STAGE_TITLES,
  STAGE_ROLES,
  ALTERNATIVE_ROLES,
  STAGE_METADATA,
  AI_INSIGHT_TEASER,
  AI_INSIGHT_DESCRIPTION,
  getTitleForStage,
  getRoleForStage,
  getNextRoleData,
  getAIInsightTeaserData,
  getAlternativeRole,
  getNextStage,
  getPreviousStage,
  generateJobSearchUrls,
} from "./stage-config";

// Cache utilities
export {
  generateCacheKey,
  getCacheKeyForSection,
  getFromCache,
  setCache,
  removeFromCache,
  clearResultsCache,
  clearExpiredCache,
  getCachedMeaning,
  cacheMeaning,
  getCachedSkillAnalysis,
  cacheSkillAnalysis,
  getCachedResources,
  cacheResources,
  getCachedDeepInsights,
  cacheDeepInsights,
  getCacheStats,
  initializeCache,
} from "./cache";

// Storage utilities (URL persistence)
export {
  generateResultId,
  saveResult,
  loadResult,
  resultExists,
  deleteResult,
  getMostRecentResultId,
  type StoredResult,
} from "./storage";


