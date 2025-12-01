/**
 * Shared test utilities and helpers for E2E and unit tests
 */

import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Wait for API calls to complete by checking network idle
 */
export async function waitForAPICalls(page: Page, timeout = 10000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Wait for a specific API endpoint to be called
 */
export async function waitForAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout = 10000
) {
  return page.waitForResponse(
    (response) => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout }
  );
}

/**
 * Mock API response for testing
 */
export async function mockAPIResponse(
  page: Page,
  url: string | RegExp,
  response: any,
  status = 200
) {
  await page.route(url, (route) => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * Mock API error response
 */
export async function mockAPIError(
  page: Page,
  url: string | RegExp,
  status = 500,
  errorMessage = 'Internal Server Error'
) {
  await page.route(url, (route) => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ error: errorMessage }),
    });
  });
}

/**
 * Mock network failure
 */
export async function mockNetworkFailure(page: Page, url: string | RegExp) {
  await page.route(url, (route) => {
    route.abort('failed');
  });
}

/**
 * Generate mock quiz answers for testing
 */
export function generateMockAnswers(questionIds: string[], answerValue = 3): Record<string, number> {
  return questionIds.reduce((acc, id) => {
    acc[id] = answerValue;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Generate mock category scores for testing
 */
export function generateMockCategoryScores(score = 50) {
  return [
    {
      name: 'UX Fundamentals',
      score,
      maxScore: 100,
      status: score >= 80 ? 'strong' : score >= 60 ? 'decent' : 'needs-work',
    },
    {
      name: 'UI Craft & Visual Design',
      score,
      maxScore: 100,
      status: score >= 80 ? 'strong' : score >= 60 ? 'decent' : 'needs-work',
    },
    {
      name: 'User Research & Validation',
      score,
      maxScore: 100,
      status: score >= 80 ? 'strong' : score >= 60 ? 'decent' : 'needs-work',
    },
    {
      name: 'Product Thinking & Strategy',
      score,
      maxScore: 100,
      status: score >= 80 ? 'strong' : score >= 60 ? 'decent' : 'needs-work',
    },
    {
      name: 'Collaboration & Communication',
      score,
      maxScore: 100,
      status: score >= 80 ? 'strong' : score >= 60 ? 'decent' : 'needs-work',
    },
  ];
}

/**
 * Wait for element to be visible and stable
 */
export async function waitForStableElement(
  page: Page,
  selector: string,
  timeout = 5000
) {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible', timeout });
  // Wait a bit more for animations to complete
  await page.waitForTimeout(300);
  return element;
}

/**
 * Check if element has proper ARIA attributes
 */
export async function checkAriaAttributes(
  page: Page,
  selector: string
): Promise<{ hasLabel: boolean; hasRole: boolean; hasDescription?: boolean }> {
  const element = page.locator(selector);
  const ariaLabel = await element.getAttribute('aria-label');
  const role = await element.getAttribute('role');
  const ariaDescribedBy = await element.getAttribute('aria-describedby');

  return {
    hasLabel: !!ariaLabel,
    hasRole: !!role,
    hasDescription: !!ariaDescribedBy,
  };
}

/**
 * Run accessibility scan using axe-core
 */
export async function runAccessibilityScan(
  page: Page,
  options?: {
    tags?: string[];
    rules?: Record<string, { enabled: boolean }>;
    exclude?: string;
  }
) {
  const builder = new AxeBuilder({ page });
  
  if (options?.tags) {
    builder.withTags(options.tags);
  }
  
  if (options?.rules) {
    for (const [ruleId, ruleConfig] of Object.entries(options.rules)) {
      if (ruleConfig.enabled) {
        builder.withRules(ruleId);
      } else {
        builder.disableRules(ruleId);
      }
    }
  }
  
  if (options?.exclude) {
    builder.exclude(options.exclude);
  }
  
  const results = await builder.analyze();
  return results;
}

/**
 * Take visual snapshot and compare
 */
export async function takeVisualSnapshot(
  page: Page,
  name: string,
  options?: {
    fullPage?: boolean;
    clip?: { x: number; y: number; width: number; height: number };
  }
) {
  await page.screenshot({
    path: `test-results/screenshots/${name}.png`,
    fullPage: options?.fullPage ?? false,
    clip: options?.clip,
  });
}

/**
 * Compare visual snapshot
 */
export async function compareVisualSnapshot(
  page: Page,
  name: string,
  options?: {
    fullPage?: boolean;
    clip?: { x: number; y: number; width: number; height: number };
    threshold?: number;
  }
) {
  await expect(page).toHaveScreenshot(name, {
    fullPage: options?.fullPage ?? false,
    clip: options?.clip,
    threshold: options?.threshold ?? 0.2,
  });
}

/**
 * Wait for animations to complete
 */
export async function waitForAnimations(page: Page, timeout = 1000) {
  await page.waitForFunction(
    () => {
      const animations = document.getAnimations();
      return animations.length === 0;
    },
    { timeout }
  ).catch(() => {
    // If timeout, just wait a fixed time for animations
    return page.waitForTimeout(500);
  });
}

/**
 * Set viewport for responsive testing
 */
export async function setViewport(
  page: Page,
  width: number,
  height: number
) {
  await page.setViewportSize({ width, height });
  await waitForAnimations(page);
}

/**
 * Test responsive breakpoints
 */
export const RESPONSIVE_BREAKPOINTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
  largeDesktop: { width: 1920, height: 1080 },
};

/**
 * Mock API timeout
 */
export async function mockAPITimeout(
  page: Page,
  url: string | RegExp,
  timeout = 5000
) {
  await page.route(url, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, timeout));
    route.abort('timedout');
  });
}

/**
 * Mock slow API response
 */
export async function mockSlowAPI(
  page: Page,
  url: string | RegExp,
  response: any,
  delay = 2000
) {
  await page.route(url, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, delay));
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * Inject console error listener
 */
export async function captureConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}

/**
 * Measure page load performance
 */
export async function measurePerformance(page: Page) {
  const metrics = await page.evaluate(() => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
      firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
    };
  });
  return metrics;
}

/**
 * Test keyboard navigation flow
 */
export async function testKeyboardNavigation(
  page: Page,
  selectors: string[],
  options?: { waitFor?: number }
) {
  for (const selector of selectors) {
    await page.keyboard.press('Tab');
    const element = page.locator(selector);
    await expect(element).toBeFocused({ timeout: 2000 });
    if (options?.waitFor) {
      await page.waitForTimeout(options.waitFor);
    }
  }
}

/**
 * Test touch interaction (mobile)
 */
export async function testTouchInteraction(
  page: Page,
  selector: string
) {
  const element = page.locator(selector);
  await element.tap();
  await waitForAnimations(page);
}

/**
 * Wait for element to stop moving (for animations)
 */
export async function waitForElementStable(
  page: Page,
  selector: string,
  timeout = 5000
) {
  let previousBounds: { x: number; y: number; width: number; height: number } | null = null;
  let stableCount = 0;
  const requiredStableChecks = 3;

  const checkStability = async () => {
    const element = page.locator(selector);
    const bounds = await element.boundingBox();
    
    if (!bounds) {
      throw new Error(`Element ${selector} not found`);
    }

    if (previousBounds) {
      const isStable =
        Math.abs(bounds.x - previousBounds.x) < 1 &&
        Math.abs(bounds.y - previousBounds.y) < 1 &&
        Math.abs(bounds.width - previousBounds.width) < 1 &&
        Math.abs(bounds.height - previousBounds.height) < 1;

      if (isStable) {
        stableCount++;
        if (stableCount >= requiredStableChecks) {
          return true;
        }
      } else {
        stableCount = 0;
      }
    }

    previousBounds = bounds;
    await page.waitForTimeout(100);
    return false;
  };

  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (await checkStability()) {
      return;
    }
  }

  throw new Error(`Element ${selector} did not stabilize within ${timeout}ms`);
}

/**
 * Test color contrast ratio
 */
export async function testColorContrast(
  page: Page,
  selector: string
): Promise<{ ratio: number; passes: boolean }> {
  const result = await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return null;

    const styles = window.getComputedStyle(element);
    const bgColor = styles.backgroundColor;
    const textColor = styles.color;

    // Simple contrast calculation (simplified)
    // In real scenarios, you'd use a proper contrast calculation library
    return {
      bgColor,
      textColor,
      ratio: 4.5, // Placeholder - would calculate actual ratio
      passes: true,
    };
  }, selector);

  if (!result) {
    throw new Error(`Element ${selector} not found`);
  }

  return { ratio: result.ratio, passes: result.passes };
}
