/**
 * API mocking utilities for tests
 * Provides mock responses for all API endpoints
 */

import type { Page } from '@playwright/test';

export interface MockAPIResponses {
  resources?: any;
  deepDive?: any;
  layout?: any;
  insights?: any;
  improvementPlan?: any;
  jobLinks?: any;
}

/**
 * Default mock responses for API endpoints
 */
export const defaultMockResponses: MockAPIResponses = {
  resources: {
    readup: 'As a Practitioner UX designer, keep growing your skills and building on your strengths!',
    resources: [
      {
        title: 'Laws of UX',
        url: 'https://lawsofux.com/',
        description: 'A collection of best practices that designers can consider when building user interfaces.',
        tags: ['Heuristics', 'Psychology'],
      },
      {
        title: 'Nielsen Norman Group',
        url: 'https://www.nngroup.com/',
        description: 'Evidence-based user experience research, training, and consulting.',
        tags: ['Research', 'Reference'],
      },
    ],
    source: 'pregenerated',
    ollama_available: false,
    pregenerated_available: true,
  },
  deepDive: {
    topics: [
      {
        name: 'Master UX Fundamentals',
        pillar: 'UX Fundamentals',
        level: 'Intermediate',
        summary: 'Focus on improving your UX Fundamentals skills as a Practitioner designer.',
        practice_points: [
          'Review UX Fundamentals fundamentals',
          'Practice UX Fundamentals through hands-on projects',
          'Apply UX Fundamentals concepts to real-world scenarios',
        ],
        resources: [
          {
            title: 'Laws of UX',
            type: 'article',
            estimated_read_time: '5-10 min',
            source: 'lawsofux.com',
            url: 'https://lawsofux.com/',
            tags: ['Heuristics', 'Psychology'],
          },
        ],
      },
    ],
    source: 'curated',
    ollama_available: false,
    pregenerated_available: true,
  },
  layout: {
    section_order: [
      'hero',
      'stage-readup',
      'skill-breakdown',
      'resources',
      'deep-dive',
      'improvement-plan',
      'jobs',
    ],
    section_visibility: {
      hero: true,
      'stage-readup': true,
      'skill-breakdown': true,
      resources: true,
      'deep-dive': true,
      'improvement-plan': true,
      jobs: true,
    },
    content_depth: {
      resources: 'standard',
      'deep-dive': 'standard',
      'improvement-plan': 'standard',
    },
    priority_message: 'Based on your Practitioner level, here\'s your personalized roadmap.',
    source: 'pregenerated',
    ollama_available: false,
    pregenerated_available: true,
  },
  insights: {
    insights: [
      {
        category: 'UX Fundamentals',
        brief: 'You scored 50% in UX Fundamentals.',
        detailed: 'Your performance in UX Fundamentals shows room for growth. Focus on building stronger foundations in this area.',
        actionable: [
          'Review core concepts in UX Fundamentals',
          'Practice UX Fundamentals skills daily',
          'Seek feedback on your UX Fundamentals work',
        ],
      },
    ],
    source: 'pregenerated',
    ollama_available: false,
    pregenerated_available: true,
  },
  improvementPlan: {
    weeks: [
      {
        week: 1,
        tasks: [
          'Pick one live feature from a product',
          'Write a problem statement + success metric',
          'Map out the current user flow',
        ],
      },
      {
        week: 2,
        tasks: [
          'Talk to 3-5 users about the feature',
          'Synthesise insights into themes',
          'Create 2-3 design variations',
        ],
      },
    ],
  },
  jobLinks: {
    job_title: 'Product Designer',
    linkedin_url: 'https://www.linkedin.com/jobs/search/?keywords=Product%20Designer&location=Remote',
    google_url: 'https://www.google.com/search?q=Product%20Designer%20jobs%20in%20Remote&ibp=htl;jobs',
  },
};

/**
 * Setup all API mocks for a test page
 */
export async function setupAPIMocks(page: Page, customResponses?: Partial<MockAPIResponses>) {
  const responses = { ...defaultMockResponses, ...customResponses };

  // Mock Express routes (relative paths)
  await page.route('**/api/generate-resources', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(responses.resources),
    });
  });

  await page.route('**/api/generate-deep-dive', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(responses.deepDive),
    });
  });

  await page.route('**/api/generate-layout', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(responses.layout),
    });
  });

  await page.route('**/api/generate-category-insights', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(responses.insights),
    });
  });

  await page.route('**/api/generate-improvement-plan', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(responses.improvementPlan),
    });
  });

  await page.route('**/api/job-search-links**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(responses.jobLinks),
    });
  });

  // Mock Python backend routes (if used)
  await page.route('**/api/ollama-status', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ollama_available: false,
        ollama_ready: false,
        pregenerated_available: true,
        use_pregenerated: true,
        model_status: 'not_available',
      }),
    });
  });
}

/**
 * Setup API error mocks
 */
export async function setupAPIErrorMocks(page: Page, endpoint: string, status = 500) {
  await page.route(`**${endpoint}`, (route) => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal Server Error' }),
    });
  });
}

/**
 * Setup network failure mocks
 */
export async function setupNetworkFailureMocks(page: Page, endpoint: string) {
  await page.route(`**${endpoint}`, (route) => {
    route.abort('failed');
  });
}

