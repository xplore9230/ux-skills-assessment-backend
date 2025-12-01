/**
 * Results Page Type Definitions
 * 
 * All TypeScript interfaces for the results page data layer.
 * This includes quiz results, section data, and API types.
 */

import type { Category, Resource, ResourceLevel, ResourceType } from "@/lib/knowledge-bank";

// Re-export knowledge bank types for convenience
export type { Category, Resource, ResourceLevel, ResourceType };

// ========================================
// STAGE TYPES
// ========================================

/**
 * Career stages based on total score
 * - Explorer: 0-40 (beginner)
 * - Practitioner: 41-65 (developing)
 * - Emerging Senior: 66-85 (proficient)
 * - Strategic Lead: 86-100 (expert)
 */
export type Stage = 
  | "Explorer" 
  | "Practitioner" 
  | "Emerging Senior" 
  | "Strategic Lead";

/**
 * Skill band classification
 * - Strong: >= 80%
 * - Needs Work: 40-79%
 * - Learn the Basics: < 40%
 */
export type Band = 
  | "Strong" 
  | "Needs Work" 
  | "Learn the Basics";

// ========================================
// QUIZ RESULTS
// ========================================

/**
 * Raw quiz answers from the quiz page
 * Maps question ID to selected score (1-5)
 */
export type QuizAnswers = Record<string, number>;

/**
 * Individual category score result
 */
export interface CategoryScore {
  id: string;           // Category identifier
  name: Category;       // Full category name
  score: number;        // Percentage score (0-100)
  band: Band;           // Classification band
  rawScore: number;     // Sum of answer values
  maxPossible: number;  // Max possible score (numQuestions * 5)
  questionCount: number; // Number of questions in category
}

/**
 * Complete quiz calculation result
 */
export interface QuizResults {
  totalScore: number;           // Overall percentage (0-100)
  stage: Stage;                 // Career stage classification
  categories: CategoryScore[];  // Per-category breakdown
  strongestCategories: Category[];  // Top performing categories
  weakestCategories: Category[];    // Lowest performing categories
  answeredAt: string;           // ISO timestamp
}

// ========================================
// SECTION 1: SCORE HERO
// ========================================

/**
 * Data for the hero score display
 */
export interface ScoreHeroData {
  totalScore: number;
  stage: Stage;
}

// ========================================
// SECTION 2: TITLE + MEANING
// ========================================

/**
 * Static title configuration (no AI)
 */
export interface TitleData {
  title: string;            // e.g., "Emerging Senior – End-to-End Flow Owner"
  shortDescription: string; // 30 words max
}

/**
 * AI-generated meaning text
 */
export interface MeaningData {
  meaning: string;  // 50 words max, personalized
}

// ========================================
// SECTION 3: SKILL ANALYSIS
// ========================================

/**
 * Individual category insight with AI-generated content
 */
export interface CategoryInsight {
  categoryId: string;
  categoryName: Category;
  score: number;
  band: Band;
  description: string;      // 2-3 sentence AI description
  checklist: ChecklistItem[]; // 5-7 action items
}

/**
 * Checklist item for skill improvement
 */
export interface ChecklistItem {
  id: string;
  text: string;
  priority?: "high" | "medium" | "low";
}

/**
 * Complete skill analysis data
 */
export interface SkillAnalysisData {
  insights: CategoryInsight[];
}

// ========================================
// SECTION 4: CURATED RESOURCES
// ========================================

/**
 * Resource with AI-generated selection reason
 */
export interface CuratedResource extends Resource {
  reasonSelected: string;  // Why this resource was chosen
}

/**
 * Curated resources section data
 */
export interface CuratedResourcesData {
  resources: CuratedResource[];
}

// ========================================
// SECTION 5: DEEP INSIGHTS
// ========================================

/**
 * Deep insight resource with personalized context
 */
export interface DeepInsight extends Resource {
  whyThisForYou: string;  // AI-generated personal relevance
}

/**
 * Deep insights section data
 */
export interface DeepInsightsData {
  insights: DeepInsight[];
}

// ========================================
// SECTION 6: IMPROVEMENT PLAN
// ========================================

/**
 * Individual task in the improvement plan
 */
export interface PlanTask {
  id: string;
  title: string;
  description: string;
  duration: string;       // e.g., "45 min"
  category?: Category;    // Related category
  type: "daily" | "deep-work";
}

/**
 * Single week in the improvement plan
 */
export interface PlanWeek {
  weekNumber: number;     // 1, 2, or 3
  theme: string;          // e.g., "Foundation Fix"
  focusAreas: Category[];
  dailyTasks: PlanTask[];
  deepWorkTasks: PlanTask[];
  expectedOutcome: string;
}

/**
 * Complete 3-week improvement plan
 */
export interface ImprovementPlanData {
  weeks: PlanWeek[];
}

// ========================================
// SECTION 6B: TOP PODCASTS
// ========================================

/**
 * Podcast recommendation metadata
 */
export interface PodcastRecommendation {
  id: string;
  name: string;
  description: string;
  url: string;
  focus: string;
}

/**
 * Top podcasts section data
 */
export interface TopPodcastsData {
  podcasts: PodcastRecommendation[];
}

// ========================================
// SECTION 7: NEXT ROLE
// ========================================

/**
 * Job search links data
 */
export interface NextRoleData {
  suggestedTitle: string;   // e.g., "Senior Product Designer"
  googleJobsUrl: string;
  linkedInUrl: string;
}

// ========================================
// SECTION 8: AI INSIGHT (TEASER)
// ========================================

/**
 * AI insight teaser state
 */
export interface AIInsightTeaserData {
  enabled: boolean;
  label: string;
}

// ========================================
// API REQUEST/RESPONSE TYPES
// ========================================

/**
 * Request for meaning generation
 */
export interface MeaningRequest {
  stage: Stage;
  totalScore: number;
  strongCategories: Category[];
  weakCategories: Category[];
}

/**
 * Response for meaning generation
 */
export interface MeaningResponse {
  meaning: string;
}

/**
 * Request for skill analysis
 */
export interface SkillAnalysisRequest {
  categories: CategoryScore[];
  stage: Stage;
}

/**
 * Response for skill analysis
 */
export interface SkillAnalysisResponse {
  insights: CategoryInsight[];
}

/**
 * Request for curated resources
 */
export interface ResourcesRequest {
  stage: Stage;
  weakCategories: Category[];
  level: ResourceLevel;
}

/**
 * Response for curated resources
 */
export interface ResourcesResponse {
  resources: CuratedResource[];
}

/**
 * Request for deep insights
 */
export interface DeepInsightsRequest {
  stage: Stage;
  strongCategories: Category[];
  weakCategories: Category[];
}

/**
 * Response for deep insights
 */
export interface DeepInsightsResponse {
  insights: DeepInsight[];
}

/**
 * Request for improvement plan
 */
export interface ImprovementPlanRequest {
  stage: Stage;
  strongCategories: Category[];
  weakCategories: Category[];
}

/**
 * Response for improvement plan
 */
export interface ImprovementPlanResponse {
  weeks: PlanWeek[];
}

// ========================================
// LOADING STATES
// ========================================

/**
 * Section loading state enum
 */
export type LoadingState = 
  | "idle" 
  | "loading" 
  | "success" 
  | "error";

/**
 * Per-section loading status
 */
export interface SectionLoadingStates {
  scoreHero: LoadingState;
  title: LoadingState;
  meaning: LoadingState;
  skillAnalysis: LoadingState;
  resources: LoadingState;
  deepInsights: LoadingState;
  improvementPlan: LoadingState;
  nextRole: LoadingState;
}

// ========================================
// COMPLETE PAGE DATA
// ========================================

/**
 * All results page data combined
 */
export interface ResultsPageData {
  // Core quiz results
  quizResults: QuizResults;
  
  // Section data
  scoreHero: ScoreHeroData;
  title: TitleData;
  meaning: MeaningData | null;
  skillAnalysis: SkillAnalysisData | null;
  resources: CuratedResourcesData | null;
  deepInsights: DeepInsightsData | null;
  improvementPlan: ImprovementPlanData | null;
  nextRole: NextRoleData;
  aiInsightTeaser: AIInsightTeaserData;
  
  // Loading states
  loadingStates: SectionLoadingStates;
}

// ========================================
// CACHE TYPES
// ========================================

/**
 * Cache entry wrapper
 */
export interface CacheEntry<T> {
  data: T;
  cachedAt: string;     // ISO timestamp
  expiresAt: string;    // ISO timestamp
  version: number;      // Cache version for invalidation
}

/**
 * Cache key components
 */
export interface CacheKeyParams {
  stage: Stage;
  scoreBucket: number;  // Rounded to nearest 5
  section: string;
}


