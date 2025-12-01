/**
 * Test fixtures for mock data, API responses, and common scenarios
 */

import type { CategoryScore } from '@/types';

/**
 * Mock API responses
 */
export const mockAPIResponses = {
  generateImprovementPlan: {
    readup: "You're a Practitioner-level UX designer with solid foundational skills. Focus on deepening your research capabilities and expanding your strategic thinking.",
    weeks: [
      {
        week: 1,
        title: "Deepen User Research Skills",
        tasks: [
          "Conduct 3 user interviews this week",
          "Create a research synthesis document",
          "Share findings with your team",
        ],
      },
      {
        week: 2,
        title: "Advanced Prototyping",
        tasks: [
          "Build high-fidelity prototypes",
          "Test with real users",
          "Iterate based on feedback",
        ],
      },
    ],
  },

  generateResources: {
    resources: [
      {
        title: "Don't Make Me Think",
        url: "https://example.com/dont-make-me-think",
        description: "Classic book on web usability",
        type: "book",
        difficulty: "beginner",
      },
      {
        title: "The Design of Everyday Things",
        url: "https://example.com/design-everyday-things",
        description: "Essential reading on design principles",
        type: "book",
        difficulty: "beginner",
      },
    ],
  },

  generateDeepDive: {
    topics: [
      {
        title: "Usability Testing Methods",
        description: "Learn various approaches to testing user interfaces",
        resources: [
          {
            title: "Usability Testing Guide",
            url: "https://example.com/usability-testing",
            type: "article",
          },
        ],
      },
    ],
  },

  generateLayout: {
    layout: {
      heroSection: {
        score: 75,
        stage: "Practitioner",
      },
      categoryCards: true,
      improvementPlan: true,
      resources: true,
      deepDive: true,
      jobSearch: true,
    },
  },

  generateCategoryInsights: {
    insights: [
      {
        category: "User Research & Validation",
        insight: "You have strong foundational research skills but could benefit from advanced analysis techniques.",
      },
    ],
  },

  jobSearchLinks: {
    stage: "Practitioner",
    jobTitle: "UX Designer",
    links: {
      linkedin: "https://linkedin.com/jobs/search?keywords=UX+Designer",
      google: "https://google.com/search?q=UX+Designer+jobs",
    },
  },

  ragStats: {
    total_resources: 100,
    categories: {
      "UX Fundamentals": 20,
      "UI Craft & Visual Design": 25,
      "User Research & Validation": 20,
      "Product Thinking & Strategy": 20,
      "Collaboration & Communication": 15,
    },
  },
};

/**
 * Mock category scores
 */
export function createMockCategoryScores(
  scores: Partial<Record<string, number>> = {}
): CategoryScore[] {
  const defaults = {
    "UX Fundamentals": 70,
    "UI Craft & Visual Design": 65,
    "User Research & Validation": 60,
    "Product Thinking & Strategy": 75,
    "Collaboration & Communication": 80,
  };

  return Object.entries({ ...defaults, ...scores }).map(([name, score]) => ({
    name,
    score,
    maxScore: 100,
    status:
      score >= 80
        ? "strong"
        : score >= 60
        ? "decent"
        : "needs-work",
  }));
}

/**
 * Mock quiz answers
 */
export function createMockQuizAnswers(
  questionIds: string[],
  answerValue = 3
): Record<string, number> {
  return questionIds.reduce(
    (acc, id) => {
      acc[id] = answerValue;
      return acc;
    },
    {} as Record<string, number>
  );
}

/**
 * Mock complete results data
 */
export function createMockResultsData(overrides: Partial<{
  totalScore: number;
  maxScore: number;
  stage: string;
  categories: CategoryScore[];
}> = {}) {
  const defaultCategories = createMockCategoryScores();
  const totalScore = defaultCategories.reduce((sum, cat) => sum + cat.score, 0);
  const maxScore = defaultCategories.reduce((sum, cat) => sum + cat.maxScore, 0);

  return {
    totalScore: overrides.totalScore ?? totalScore,
    maxScore: overrides.maxScore ?? maxScore,
    stage: overrides.stage ?? "Practitioner",
    categories: overrides.categories ?? defaultCategories,
  };
}

/**
 * Mock API error responses
 */
export const mockAPIErrors = {
  serverError: {
    status: 500,
    body: { error: "Internal Server Error", message: "Something went wrong on our end" },
  },
  notFound: {
    status: 404,
    body: { error: "Not Found", message: "The requested resource was not found" },
  },
  timeout: {
    status: 504,
    body: { error: "Gateway Timeout", message: "The request took too long to process" },
  },
  badRequest: {
    status: 400,
    body: { error: "Bad Request", message: "Invalid request parameters" },
  },
  unauthorized: {
    status: 401,
    body: { error: "Unauthorized", message: "Authentication required" },
  },
};

/**
 * User journey fixtures
 */
export const userJourneys = {
  completeQuizFlow: {
    answers: createMockQuizAnswers([
      "q1", "q2", "q3", "q4", "q5",
      "q6", "q7", "q8", "q9", "q10",
      "q11", "q12", "q13", "q14", "q15",
    ], 3),
    expectedStage: "Practitioner",
    expectedScore: 45,
  },

  highScoreFlow: {
    answers: createMockQuizAnswers([
      "q1", "q2", "q3", "q4", "q5",
      "q6", "q7", "q8", "q9", "q10",
      "q11", "q12", "q13", "q14", "q15",
    ], 5),
    expectedStage: "Strategic Lead",
    expectedScore: 75,
  },

  lowScoreFlow: {
    answers: createMockQuizAnswers([
      "q1", "q2", "q3", "q4", "q5",
      "q6", "q7", "q8", "q9", "q10",
      "q11", "q12", "q13", "q14", "q15",
    ], 1),
    expectedStage: "Explorer",
    expectedScore: 15,
  },
};

/**
 * Error scenario builders
 */
export const errorScenarios = {
  networkFailure: {
    type: "network",
    action: "abort",
  },
  slowResponse: {
    type: "slow",
    delay: 5000,
  },
  timeout: {
    type: "timeout",
    timeout: 3000,
  },
  invalidResponse: {
    type: "invalid",
    response: { invalid: "data" },
  },
  emptyResponse: {
    type: "empty",
    response: {},
  },
};

/**
 * Responsive test viewports
 */
export const responsiveViewports = {
  mobile: { width: 375, height: 667 },
  mobileLandscape: { width: 667, height: 375 },
  tablet: { width: 768, height: 1024 },
  tabletLandscape: { width: 1024, height: 768 },
  desktop: { width: 1280, height: 720 },
  largeDesktop: { width: 1920, height: 1080 },
};

/**
 * Generate question IDs for testing
 */
export function generateQuestionIds(count = 15): string[] {
  return Array.from({ length: count }, (_, i) => `question-${i + 1}`);
}

/**
 * Create mock assessment input
 */
export function createMockAssessmentInput(overrides: Partial<{
  totalScore: number;
  maxScore: number;
  stage: string;
  categories: CategoryScore[];
}> = {}) {
  const defaults = createMockResultsData();
  return {
    totalScore: overrides.totalScore ?? defaults.totalScore,
    maxScore: overrides.maxScore ?? defaults.maxScore,
    stage: overrides.stage ?? defaults.stage,
    categories: overrides.categories ?? defaults.categories,
  };
}

