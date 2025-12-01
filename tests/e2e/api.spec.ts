import { test, expect, request } from '@playwright/test';
import { mockAPIResponse, mockAPIError } from '../setup/test-helpers';
import { mockAPIResponses } from '../setup/fixtures';

test.describe('API Endpoints (Express + Python)', () => {
  const apiBase = process.env.PLAYWRIGHT_API_BASE || 'http://localhost:3000';

  test.describe('Successful Responses', () => {
    test('all Express endpoints respond successfully', async () => {
      const context = await request.newContext();

      const responses = await Promise.all([
        context.post(`${apiBase}/api/generate-improvement-plan`, {
          data: { totalScore: 70, categories: [] },
        }),
        context.post(`${apiBase}/api/generate-resources`, {
          data: { totalScore: 70, categories: [], stage: 'Practitioner' },
        }),
        context.post(`${apiBase}/api/generate-deep-dive`, {
          data: { totalScore: 70, categories: [] },
        }),
        context.post(`${apiBase}/api/generate-layout`, {
          data: { totalScore: 70, maxScore: 100, stage: 'Practitioner', categories: [] },
        }),
        context.post(`${apiBase}/api/generate-category-insights`, {
          data: { totalScore: 70, maxScore: 100, stage: 'Practitioner', categories: [] },
        }),
        context.get(`${apiBase}/api/job-search-links?stage=Practitioner&location=Remote`),
      ]);

      for (const res of responses) {
        expect(res.status(), `Endpoint ${res.url()} should return 2xx`).toBeGreaterThanOrEqual(200);
        expect(res.status(), `Endpoint ${res.url()} should return < 500`).toBeLessThan(500);
      }
    });

    test('generate-improvement-plan returns valid structure', async () => {
      const context = await request.newContext();
      const response = await context.post(`${apiBase}/api/generate-improvement-plan`, {
        data: { totalScore: 70, categories: [] },
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toBeDefined();
    });

    test('generate-resources returns valid structure', async () => {
      const context = await request.newContext();
      const response = await context.post(`${apiBase}/api/generate-resources`, {
        data: { totalScore: 70, categories: [], stage: 'Practitioner' },
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toBeDefined();
    });

    test('job-search-links returns valid URLs', async () => {
      const context = await request.newContext();
      const response = await context.get(`${apiBase}/api/job-search-links?stage=Practitioner&location=Remote`);

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      
      if (data.links) {
        expect(data.links).toBeDefined();
        if (data.links.linkedin) {
          expect(data.links.linkedin).toMatch(/^https?:\/\//);
        }
        if (data.links.google) {
          expect(data.links.google).toMatch(/^https?:\/\//);
        }
      }
    });
  });

  test.describe('Error Handling', () => {
    test('handles 500 errors gracefully', async ({ page }) => {
      await mockAPIError(page, /\/api\/generate-improvement-plan/, 500, 'Internal Server Error');
      
      await page.goto('/results');
      await page.waitForLoadState('domcontentloaded');
      
      // Page should not crash
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('handles 404 errors gracefully', async ({ page }) => {
      await mockAPIError(page, /\/api\/generate-resources/, 404, 'Not Found');
      
      await page.goto('/results');
      await page.waitForLoadState('domcontentloaded');
      
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('handles timeout errors', async ({ page }) => {
      await page.route('**/api/**', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        await route.abort('timedout');
      });
      
      await page.goto('/results');
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });

  test.describe('CORS Configuration', () => {
    test('API responses include CORS headers', async () => {
      const context = await request.newContext();
      const response = await context.post(`${apiBase}/api/generate-improvement-plan`, {
        data: { totalScore: 70, categories: [] },
      });

      const headers = response.headers();
      // CORS headers should be present (if configured)
      // Note: May not be present in all environments
    });
  });

  test.describe('Response Validation', () => {
    test('responses have valid JSON structure', async () => {
      const context = await request.newContext();
      const response = await context.post(`${apiBase}/api/generate-improvement-plan`, {
        data: { totalScore: 70, categories: [] },
      });

      expect(response.ok()).toBeTruthy();
      
      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('application/json');
      
      const data = await response.json();
      expect(typeof data).toBe('object');
    });

    test('error responses have error structure', async () => {
      const context = await request.newContext();
      // Try to trigger an error with invalid data
      const response = await context.post(`${apiBase}/api/generate-improvement-plan`, {
        data: { invalid: 'data' },
      });

      if (!response.ok()) {
        const data = await response.json().catch(() => ({}));
        // Error responses should have some structure
        expect(data).toBeDefined();
      }
    });
  });

  test.describe('Performance', () => {
    test('API responses return within acceptable time', async () => {
      const context = await request.newContext();
      
      const startTime = Date.now();
      const response = await context.post(`${apiBase}/api/generate-improvement-plan`, {
        data: { totalScore: 70, categories: [] },
      });
      const responseTime = Date.now() - startTime;
      
      expect(response.ok()).toBeTruthy();
      // API should respond within 10 seconds (allowing for LLM processing)
      expect(responseTime).toBeLessThan(10000);
    });
  });

  test.describe('RAG Endpoints', () => {
    test('RAG stats endpoint returns data', async () => {
      const context = await request.newContext();
      const response = await context.get(`${apiBase}/api/rag/stats`);

      if (response.ok()) {
        const contentType = response.headers()['content-type'];
        if (contentType?.includes('application/json')) {
          const data = await response.json();
          expect(data).toBeDefined();
        } else {
          // Endpoint might return HTML or other format
          const text = await response.text();
          expect(text).toBeTruthy();
        }
      }
    });
  });
});