/**
 * Score Calculation Logic
 * 
 * Calculates quiz results from raw answers.
 * - Per-category scores
 * - Total score
 * - Stage classification
 * - Band classification
 * - Strongest/weakest categories
 */

import { allQuestions } from "@/data/questions";
import type { 
  QuizAnswers, 
  QuizResults, 
  CategoryScore, 
  Stage, 
  Band,
  Category 
} from "./types";

// ========================================
// CONSTANTS
// ========================================

/**
 * Stage thresholds (inclusive lower bound)
 */
const STAGE_THRESHOLDS = {
  STRATEGIC_LEAD: 86,
  EMERGING_SENIOR: 66,
  PRACTITIONER: 41,
  EXPLORER: 0,
} as const;

/**
 * Band thresholds (inclusive lower bound)
 */
const BAND_THRESHOLDS = {
  STRONG: 80,
  NEEDS_WORK: 40,
  LEARN_BASICS: 0,
} as const;

/**
 * All category names in display order
 */
export const CATEGORY_ORDER: Category[] = [
  "UX Fundamentals",
  "UI Craft & Visual Design",
  "User Research & Validation",
  "Product Thinking & Strategy",
  "Collaboration & Communication",
];

/**
 * Minimum score to display (no zeros)
 */
const MIN_DISPLAY_SCORE = 5;

/**
 * Maximum answer value
 */
const MAX_ANSWER_VALUE = 5;

// ========================================
// MAIN CALCULATION FUNCTION
// ========================================

/**
 * Calculate complete quiz results from answers
 * 
 * @param answers - Map of questionId to selected value (1-5)
 * @returns Complete quiz results with scores, stage, and categories
 */
export function calculateQuizResults(answers: QuizAnswers): QuizResults {
  // Get category scores
  const categories = calculateCategoryScores(answers);
  
  // Calculate total score (average of category percentages)
  const totalScore = calculateTotalScore(categories);
  
  // Determine stage based on total score
  const stage = deriveStage(totalScore);
  
  // Get strongest and weakest categories
  const { strongest, weakest } = getStrongAndWeakCategories(categories);
  
  return {
    totalScore,
    stage,
    categories,
    strongestCategories: strongest,
    weakestCategories: weakest,
    answeredAt: new Date().toISOString(),
  };
}

// ========================================
// CATEGORY SCORING
// ========================================

/**
 * Calculate scores for each category
 */
function calculateCategoryScores(answers: QuizAnswers): CategoryScore[] {
  const categoryScores: CategoryScore[] = [];
  
  for (const categoryName of CATEGORY_ORDER) {
    // Get all questions for this category
    const categoryQuestions = allQuestions.filter(q => q.category === categoryName);
    
    // Get answers for questions in this category that were answered
    const answeredQuestions = categoryQuestions.filter(q => answers[q.id] !== undefined);
    
    if (answeredQuestions.length === 0) {
      // No questions answered for this category
      categoryScores.push({
        id: categoryNameToId(categoryName),
        name: categoryName,
        score: MIN_DISPLAY_SCORE,
        band: "Learn the Basics",
        rawScore: 0,
        maxPossible: 0,
        questionCount: 0,
      });
      continue;
    }
    
    // Calculate raw score (sum of answer values)
    const rawScore = answeredQuestions.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
    
    // Calculate max possible (questions answered * max value)
    const maxPossible = answeredQuestions.length * MAX_ANSWER_VALUE;
    
    // Calculate percentage (0-100)
    const percentage = maxPossible > 0 
      ? Math.round((rawScore / maxPossible) * 100) 
      : 0;
    
    // Apply minimum display score
    const displayScore = Math.max(percentage, MIN_DISPLAY_SCORE);
    
    // Derive band
    const band = deriveBand(displayScore);
    
    categoryScores.push({
      id: categoryNameToId(categoryName),
      name: categoryName,
      score: displayScore,
      band,
      rawScore,
      maxPossible,
      questionCount: answeredQuestions.length,
    });
  }
  
  return categoryScores;
}

/**
 * Calculate total score as average of category percentages
 */
function calculateTotalScore(categories: CategoryScore[]): number {
  const validCategories = categories.filter(c => c.questionCount > 0);
  
  if (validCategories.length === 0) {
    return MIN_DISPLAY_SCORE;
  }
  
  const sum = validCategories.reduce((acc, c) => acc + c.score, 0);
  const average = sum / validCategories.length;
  
  // Round to nearest integer and apply minimum
  return Math.max(Math.round(average), MIN_DISPLAY_SCORE);
}

// ========================================
// STAGE AND BAND DERIVATION
// ========================================

/**
 * Derive career stage from total score
 */
export function deriveStage(score: number): Stage {
  if (score >= STAGE_THRESHOLDS.STRATEGIC_LEAD) {
    return "Strategic Lead";
  }
  if (score >= STAGE_THRESHOLDS.EMERGING_SENIOR) {
    return "Emerging Senior";
  }
  if (score >= STAGE_THRESHOLDS.PRACTITIONER) {
    return "Practitioner";
  }
  return "Explorer";
}

/**
 * Derive skill band from category score
 */
export function deriveBand(score: number): Band {
  if (score >= BAND_THRESHOLDS.STRONG) {
    return "Strong";
  }
  if (score >= BAND_THRESHOLDS.NEEDS_WORK) {
    return "Needs Work";
  }
  return "Learn the Basics";
}

// ========================================
// CATEGORY ANALYSIS
// ========================================

/**
 * Get strongest and weakest categories
 * Returns up to 2 of each
 */
function getStrongAndWeakCategories(
  categories: CategoryScore[]
): { strongest: Category[]; weakest: Category[] } {
  // Sort by score (descending for strongest)
  const sorted = [...categories].sort((a, b) => b.score - a.score);
  
  // Top 2 are strongest (if score >= 60)
  const strongest = sorted
    .filter(c => c.score >= 60)
    .slice(0, 2)
    .map(c => c.name);
  
  // Bottom 2 are weakest (sorted ascending)
  const weakest = sorted
    .slice()
    .reverse()
    .filter(c => c.score < 80)
    .slice(0, 2)
    .map(c => c.name);
  
  return { strongest, weakest };
}

/**
 * Get category name for a question ID
 */
export function getCategoryForQuestion(questionId: string): Category | null {
  const question = allQuestions.find(q => q.id === questionId);
  return question ? (question.category as Category) : null;
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Convert category name to a URL-friendly ID
 */
export function categoryNameToId(name: Category): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

/**
 * Convert category ID back to name
 */
export function categoryIdToName(id: string): Category | null {
  const mapping: Record<string, Category> = {
    "ux-fundamentals": "UX Fundamentals",
    "ui-craft-visual-design": "UI Craft & Visual Design",
    "user-research-validation": "User Research & Validation",
    "product-thinking-strategy": "Product Thinking & Strategy",
    "collaboration-communication": "Collaboration & Communication",
  };
  return mapping[id] || null;
}

/**
 * Get score bucket for caching (round to nearest 5)
 */
export function getScoreBucket(score: number): number {
  return Math.round(score / 5) * 5;
}

/**
 * Check if a score qualifies as "passing"
 */
export function isPassingScore(score: number): boolean {
  return score >= STAGE_THRESHOLDS.PRACTITIONER;
}

/**
 * Get band color class for styling
 */
export function getBandColorClass(band: Band): string {
  switch (band) {
    case "Strong":
      return "text-green-500";
    case "Needs Work":
      return "text-amber-500";
    case "Learn the Basics":
      return "text-blue-500";
  }
}

/**
 * Get band background color class for styling
 */
export function getBandBgClass(band: Band): string {
  switch (band) {
    case "Strong":
      return "bg-green-500/10 border-green-500/20";
    case "Needs Work":
      return "bg-amber-500/10 border-amber-500/20";
    case "Learn the Basics":
      return "bg-blue-500/10 border-blue-500/20";
  }
}

/**
 * Get stage color class for styling
 */
export function getStageColorClass(stage: Stage): string {
  switch (stage) {
    case "Strategic Lead":
      return "text-purple-400";
    case "Emerging Senior":
      return "text-green-400";
    case "Practitioner":
      return "text-blue-400";
    case "Explorer":
      return "text-amber-400";
  }
}

/**
 * Get stage background class for badge styling
 */
export function getStageBgClass(stage: Stage): string {
  switch (stage) {
    case "Strategic Lead":
      return "bg-purple-500/10 border-purple-500/30";
    case "Emerging Senior":
      return "bg-green-500/10 border-green-500/30";
    case "Practitioner":
      return "bg-blue-500/10 border-blue-500/30";
    case "Explorer":
      return "bg-amber-500/10 border-amber-500/30";
  }
}

/**
 * Validate quiz answers structure
 */
export function validateAnswers(answers: QuizAnswers): boolean {
  if (!answers || typeof answers !== "object") {
    return false;
  }
  
  const answerCount = Object.keys(answers).length;
  if (answerCount === 0) {
    return false;
  }
  
  // All values should be between 1 and 5
  for (const value of Object.values(answers)) {
    if (typeof value !== "number" || value < 1 || value > 5) {
      return false;
    }
  }
  
  return true;
}


