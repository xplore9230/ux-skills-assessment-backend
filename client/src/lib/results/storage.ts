/**
 * Results Storage Utility
 * 
 * Persists quiz results with unique IDs so users can:
 * - Refresh the page without losing results
 * - Share their results via URL
 * - Return to results later
 */

import type { QuizAnswers, QuizResults } from "./types";

const STORAGE_KEY_PREFIX = "ux_quiz_result_";
const RESULTS_INDEX_KEY = "ux_quiz_results_index";
const MAX_STORED_RESULTS = 10; // Keep last 10 results

/**
 * Stored result entry
 */
export interface StoredResult {
  id: string;
  answers: QuizAnswers;
  results: QuizResults;
  createdAt: string;
}

/**
 * Generate a unique result ID
 * Format: 8 character alphanumeric string
 */
export function generateResultId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Save a result to localStorage
 */
export function saveResult(
  id: string,
  answers: QuizAnswers,
  results: QuizResults
): void {
  try {
    const entry: StoredResult = {
      id,
      answers,
      results,
      createdAt: new Date().toISOString(),
    };
    
    // Save the result
    localStorage.setItem(STORAGE_KEY_PREFIX + id, JSON.stringify(entry));
    
    // Update the index
    const index = getResultsIndex();
    if (!index.includes(id)) {
      index.unshift(id); // Add to beginning
      
      // Clean up old results if we have too many
      while (index.length > MAX_STORED_RESULTS) {
        const oldId = index.pop();
        if (oldId) {
          localStorage.removeItem(STORAGE_KEY_PREFIX + oldId);
        }
      }
      
      localStorage.setItem(RESULTS_INDEX_KEY, JSON.stringify(index));
    }
  } catch (error) {
    console.warn("Failed to save result to localStorage:", error);
  }
}

/**
 * Load a result from localStorage by ID
 */
export function loadResult(id: string): StoredResult | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PREFIX + id);
    if (!data) return null;
    
    const entry = JSON.parse(data) as StoredResult;
    
    // Validate the entry has required fields
    if (!entry.id || !entry.answers || !entry.results) {
      return null;
    }
    
    return entry;
  } catch (error) {
    console.warn("Failed to load result from localStorage:", error);
    return null;
  }
}

/**
 * Get the index of all stored result IDs
 */
function getResultsIndex(): string[] {
  try {
    const data = localStorage.getItem(RESULTS_INDEX_KEY);
    if (!data) return [];
    return JSON.parse(data) as string[];
  } catch {
    return [];
  }
}

/**
 * Check if a result exists
 */
export function resultExists(id: string): boolean {
  return localStorage.getItem(STORAGE_KEY_PREFIX + id) !== null;
}

/**
 * Delete a result
 */
export function deleteResult(id: string): void {
  try {
    localStorage.removeItem(STORAGE_KEY_PREFIX + id);
    
    const index = getResultsIndex();
    const newIndex = index.filter((i) => i !== id);
    localStorage.setItem(RESULTS_INDEX_KEY, JSON.stringify(newIndex));
  } catch (error) {
    console.warn("Failed to delete result:", error);
  }
}

/**
 * Get the most recent result ID (if any)
 */
export function getMostRecentResultId(): string | null {
  const index = getResultsIndex();
  return index.length > 0 ? index[0] : null;
}

