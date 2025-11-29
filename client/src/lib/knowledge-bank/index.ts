/**
 * Knowledge Bank Query Utilities
 * 
 * Functions for filtering and retrieving resources from the knowledge bank
 * based on category, level, type, and other criteria.
 */

import { 
  knowledgeBank, 
  type Resource, 
  type Category, 
  type ResourceLevel, 
  type ResourceType 
} from "@/data/knowledge-bank";

export type { Resource, Category, ResourceLevel, ResourceType };

/**
 * Filter options for querying resources
 */
export interface ResourceFilters {
  categories?: Category[];
  levels?: ResourceLevel[];
  types?: ResourceType[];
  limit?: number;
  excludeIds?: string[];
  tags?: string[];
}

/**
 * Query resources from the knowledge bank with optional filters
 */
export function queryResources(filters: ResourceFilters = {}): Resource[] {
  let results = [...knowledgeBank];

  // Filter by categories
  if (filters.categories && filters.categories.length > 0) {
    results = results.filter(r => filters.categories!.includes(r.category));
  }

  // Filter by levels
  if (filters.levels && filters.levels.length > 0) {
    results = results.filter(r => filters.levels!.includes(r.level));
  }

  // Filter by types
  if (filters.types && filters.types.length > 0) {
    results = results.filter(r => filters.types!.includes(r.type));
  }

  // Filter by tags (any match)
  if (filters.tags && filters.tags.length > 0) {
    results = results.filter(r => 
      r.tags.some(tag => filters.tags!.includes(tag))
    );
  }

  // Exclude specific IDs
  if (filters.excludeIds && filters.excludeIds.length > 0) {
    results = results.filter(r => !filters.excludeIds!.includes(r.id));
  }

  // Apply limit
  if (filters.limit && filters.limit > 0) {
    results = results.slice(0, filters.limit);
  }

  return results;
}

/**
 * Get beginner (easy) resources for weak categories
 * Used for Section 4: Curated Resources
 * 
 * @param weakCategories - Categories where user scored low
 * @param limit - Maximum number of resources to return (default 5)
 */
export function getBeginnerResources(
  weakCategories: Category[],
  limit: number = 5
): Resource[] {
  // Get all easy resources for weak categories
  const resources = queryResources({
    categories: weakCategories,
    levels: ["explorer"],
  });

  // Shuffle to add variety
  const shuffled = shuffleArray(resources);

  // Return limited set
  return shuffled.slice(0, limit);
}

/**
 * Get advanced resources for growth areas
 * Used for Section 5: Deep Insights
 * 
 * Prioritizes:
 * 1. Intermediate/Advanced content
 * 2. Mix of content types (articles, videos, podcasts)
 * 3. Content from both strong and weak areas
 * 
 * @param stage - User's current stage
 * @param strongCategories - Categories where user excels
 * @param weakCategories - Categories needing improvement
 * @param limit - Maximum number of resources to return (default 6)
 */
export function getAdvancedResources(
  stage: string,
  strongCategories: Category[],
  weakCategories: Category[],
  limit: number = 6
): Resource[] {
  // Determine appropriate levels based on stage
  const levelsByStage: Record<string, ResourceLevel[]> = {
    Explorer: ["practitioner"],
    Practitioner: ["emerging-senior"],
    "Emerging Senior": ["emerging-senior", "strategic-lead"],
    "Strategic Lead": ["strategic-lead"],
  };

  const levels = levelsByStage[stage] ?? ["emerging-senior", "strategic-lead"];

  // Get resources for all relevant categories
  const allCategories = [...strongCategories, ...weakCategories];
  
  const resources = queryResources({
    categories: allCategories.length > 0 ? allCategories : undefined,
    levels,
  });

  // Try to get a mix of content types
  const byType = groupByType(resources);
  const mixed: Resource[] = [];
  const perType = Math.ceil(limit / 3);

  // Add articles
  mixed.push(...shuffleArray(byType.article).slice(0, perType));
  // Add videos
  mixed.push(...shuffleArray(byType.video).slice(0, perType));
  // Add podcasts
  mixed.push(...shuffleArray(byType.podcast).slice(0, perType));

  // Shuffle the mix and return limited set
  return shuffleArray(mixed).slice(0, limit);
}

/**
 * Get resources by specific category
 */
export function getResourcesByCategory(category: Category): Resource[] {
  return queryResources({ categories: [category] });
}

/**
 * Get resources by level
 */
export function getResourcesByLevel(level: ResourceLevel): Resource[] {
  return queryResources({ levels: [level] });
}

/**
 * Get a single resource by ID
 */
export function getResourceById(id: string): Resource | undefined {
  return knowledgeBank.find(r => r.id === id);
}

/**
 * Get resource count by category
 */
export function getResourceCountByCategory(): Record<Category, number> {
  const counts: Record<string, number> = {};
  
  for (const resource of knowledgeBank) {
    counts[resource.category] = (counts[resource.category] || 0) + 1;
  }
  
  return counts as Record<Category, number>;
}

/**
 * Get resource count by level
 */
export function getResourceCountByLevel(): Record<ResourceLevel, number> {
  const counts: Record<string, number> = {
    explorer: 0,
    practitioner: 0,
    "emerging-senior": 0,
    "strategic-lead": 0,
  };
  
  for (const resource of knowledgeBank) {
    counts[resource.level]++;
  }
  
  return counts as Record<ResourceLevel, number>;
}

/**
 * Search resources by title or summary
 */
export function searchResources(query: string): Resource[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) {
    return [];
  }
  
  return knowledgeBank.filter(r => 
    r.title.toLowerCase().includes(normalizedQuery) ||
    r.summary.toLowerCase().includes(normalizedQuery) ||
    r.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))
  );
}

/**
 * Get total resource count
 */
export function getTotalResourceCount(): number {
  return knowledgeBank.length;
}

// ========================================
// Helper Functions
// ========================================

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Group resources by type
 */
function groupByType(resources: Resource[]): Record<ResourceType, Resource[]> {
  return {
    article: resources.filter(r => r.type === "article"),
    video: resources.filter(r => r.type === "video"),
    podcast: resources.filter(r => r.type === "podcast"),
  };
}


