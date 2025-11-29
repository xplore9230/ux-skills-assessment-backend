/**
 * Stage Configuration - Static Content
 * 
 * Static titles, descriptions, and role mappings for each career stage.
 * This content does not require AI generation.
 */

import type { Stage, TitleData, NextRoleData, AIInsightTeaserData } from "./types";

// ========================================
// STAGE TITLE CONFIGURATION
// ========================================

/**
 * Static title and description for each stage
 * Used in Section 2A: Title Block
 */
export const STAGE_TITLES: Record<Stage, TitleData> = {
  "Explorer": {
    title: "Explorer – Building Your Foundation",
    shortDescription: "You're at the beginning of your UX journey. Focus on mastering core principles, developing your visual eye, and getting hands-on experience with real projects.",
  },
  "Practitioner": {
    title: "Practitioner – Developing Your Craft",
    shortDescription: "You have solid fundamentals and growing expertise. Now focus on deepening specializations, improving research skills, and taking ownership of end-to-end design work.",
  },
  "Emerging Senior": {
    title: "Emerging Senior – End-to-End Flow Owner",
    shortDescription: "You're transitioning to senior-level impact. Strengthen your strategic thinking, mentor others, and learn to influence product decisions beyond just design.",
  },
  "Strategic Lead": {
    title: "Strategic Lead – Design Strategist",
    shortDescription: "You're operating at a senior/lead level. Focus on design leadership, organizational influence, and driving design culture across teams and products.",
  },
};

// ========================================
// ROLE CONFIGURATION
// ========================================

/**
 * Suggested job title for each stage
 * Used in Section 7: Next Role
 */
export const STAGE_ROLES: Record<Stage, string> = {
  "Explorer": "Junior Product Designer",
  "Practitioner": "Product Designer",
  "Emerging Senior": "Senior Product Designer",
  "Strategic Lead": "Lead Product Designer / Design Manager",
};

/**
 * Alternative role titles for variety
 */
export const ALTERNATIVE_ROLES: Record<Stage, string[]> = {
  "Explorer": [
    "Associate UX Designer",
    "Junior UX Designer",
    "UX Design Intern",
    "Product Design Associate",
  ],
  "Practitioner": [
    "UX Designer",
    "Interaction Designer",
    "Product Designer II",
    "Mid-level UX Designer",
  ],
  "Emerging Senior": [
    "Senior UX Designer",
    "Senior Interaction Designer",
    "UX Design Lead",
    "Staff Product Designer",
  ],
  "Strategic Lead": [
    "Principal Product Designer",
    "Design Director",
    "Head of Design",
    "VP of Design",
  ],
};

// ========================================
// JOB SEARCH URL GENERATION
// ========================================

/**
 * Generate job search URLs for a given stage and location
 */
export function generateJobSearchUrls(
  stage: Stage,
  location: string = "Remote"
): NextRoleData {
  const suggestedTitle = STAGE_ROLES[stage];
  const encodedTitle = encodeURIComponent(suggestedTitle);
  const encodedLocation = encodeURIComponent(location);
  
  // Google Jobs search URL
  const googleQuery = encodeURIComponent(`${suggestedTitle} jobs in ${location}`);
  const googleJobsUrl = `https://www.google.com/search?q=${googleQuery}&ibp=htl;jobs`;
  
  // LinkedIn Jobs search URL
  const linkedInUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodedTitle}&location=${encodedLocation}`;
  
  return {
    suggestedTitle,
    googleJobsUrl,
    linkedInUrl,
  };
}

// ========================================
// AI INSIGHT TEASER CONFIGURATION
// ========================================

/**
 * Static configuration for the AI Insight teaser section
 * Used in Section 8
 */
export const AI_INSIGHT_TEASER: AIInsightTeaserData = {
  enabled: false,
  label: "AI Career Insight – Launching Soon",
};

/**
 * Teaser description for the coming soon feature
 */
export const AI_INSIGHT_DESCRIPTION = 
  "We're working on a deeper AI-driven career intelligence layer. " +
  "Get personalized salary insights, growth trajectories, market demand analysis, " +
  "and custom roadmaps tailored to your unique skill profile.";

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get the title data for a given stage
 */
export function getTitleForStage(stage: Stage): TitleData {
  return STAGE_TITLES[stage];
}

/**
 * Get the suggested role for a given stage
 */
export function getRoleForStage(stage: Stage): string {
  return STAGE_ROLES[stage];
}

/**
 * Get next role data with search URLs
 */
export function getNextRoleData(stage: Stage, location?: string): NextRoleData {
  return generateJobSearchUrls(stage, location);
}

/**
 * Get AI insight teaser data
 */
export function getAIInsightTeaserData(): AIInsightTeaserData {
  return AI_INSIGHT_TEASER;
}

/**
 * Get a random alternative role title for a stage
 */
export function getAlternativeRole(stage: Stage): string {
  const alternatives = ALTERNATIVE_ROLES[stage];
  const randomIndex = Math.floor(Math.random() * alternatives.length);
  return alternatives[randomIndex];
}

// ========================================
// STAGE METADATA
// ========================================

/**
 * Additional metadata about each stage
 */
export const STAGE_METADATA: Record<Stage, {
  level: number;
  yearsExperience: string;
  keyFocus: string[];
}> = {
  "Explorer": {
    level: 1,
    yearsExperience: "0-2 years",
    keyFocus: [
      "Learning fundamentals",
      "Building portfolio",
      "Getting hands-on experience",
    ],
  },
  "Practitioner": {
    level: 2,
    yearsExperience: "2-4 years",
    keyFocus: [
      "Deepening expertise",
      "Taking ownership",
      "Improving research skills",
    ],
  },
  "Emerging Senior": {
    level: 3,
    yearsExperience: "4-7 years",
    keyFocus: [
      "Strategic thinking",
      "Mentoring others",
      "Influencing product decisions",
    ],
  },
  "Strategic Lead": {
    level: 4,
    yearsExperience: "7+ years",
    keyFocus: [
      "Design leadership",
      "Organizational influence",
      "Driving design culture",
    ],
  },
};

/**
 * Get the next stage in progression
 */
export function getNextStage(currentStage: Stage): Stage | null {
  const progression: Stage[] = [
    "Explorer",
    "Practitioner",
    "Emerging Senior",
    "Strategic Lead",
  ];
  
  const currentIndex = progression.indexOf(currentStage);
  if (currentIndex === -1 || currentIndex === progression.length - 1) {
    return null;
  }
  
  return progression[currentIndex + 1];
}

/**
 * Get previous stage in progression
 */
export function getPreviousStage(currentStage: Stage): Stage | null {
  const progression: Stage[] = [
    "Explorer",
    "Practitioner",
    "Emerging Senior",
    "Strategic Lead",
  ];
  
  const currentIndex = progression.indexOf(currentStage);
  if (currentIndex <= 0) {
    return null;
  }
  
  return progression[currentIndex - 1];
}


