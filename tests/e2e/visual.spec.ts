import { test, expect } from '@playwright/test';
import { waitForAnimations, setViewport, RESPONSIVE_BREAKPOINTS } from '../setup/test-helpers';

test.describe('Visual Regression @visual', () => {
  test.describe('Landing Page', () => {
    test('landing page visual snapshot', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await waitForAnimations(page);
      
      await expect(page).toHaveScreenshot('landing-page-full.png', {
        fullPage: true,
        threshold: 0.2,
      });
    });

    test('CTA button visual snapshot', async ({ page }) => {
      await page.goto('/');
      await waitForAnimations(page);
      
      const ctaButton = page.getByTestId('button-start-quiz');
      await expect(ctaButton).toHaveScreenshot('landing-cta-button.png', {
        threshold: 0.2,
      });
    });
  });

  test.describe('Quiz Page', () => {
    test('quiz question visual snapshot', async ({ page }) => {
      await page.goto('/');
      const ctaButton = page.getByTestId('button-start-quiz');
      await ctaButton.click();
      
      await waitForAnimations(page);
      
      const questionContainer = page.locator('[data-testid^="option-"]').first().locator('..');
      await expect(questionContainer).toHaveScreenshot('quiz-question.png', {
        threshold: 0.3,
      });
    });

    test('progress bar visual snapshot', async ({ page }) => {
      await page.goto('/');
      const ctaButton = page.getByTestId('button-start-quiz');
      await ctaButton.click();
      
      await waitForAnimations(page);
      
      const progressBar = page.getByTestId('progress-bar-fill').locator('..');
      await expect(progressBar).toHaveScreenshot('quiz-progress-bar.png', {
        threshold: 0.2,
      });
    });
  });

  test.describe('Results Page', () => {
    test('results page visual snapshot', async ({ page }) => {
      await page.goto('/results');
      await page.waitForLoadState('networkidle', { timeout: 20000 });
      await waitForAnimations(page);
      
      await expect(page).toHaveScreenshot('results-page-full.png', {
        fullPage: true,
        threshold: 0.3, // Higher threshold for dynamic content
      });
    });
  });

  test.describe('Responsive Visuals', () => {
    test('mobile layout snapshot', async ({ page }) => {
      await setViewport(page, RESPONSIVE_BREAKPOINTS.mobile.width, RESPONSIVE_BREAKPOINTS.mobile.height);
      await page.goto('/');
      await waitForAnimations(page);
      
      await expect(page).toHaveScreenshot('landing-mobile.png', {
        fullPage: true,
        threshold: 0.2,
      });
    });

    test('tablet layout snapshot', async ({ page }) => {
      await setViewport(page, RESPONSIVE_BREAKPOINTS.tablet.width, RESPONSIVE_BREAKPOINTS.tablet.height);
      await page.goto('/');
      await waitForAnimations(page);
      
      await expect(page).toHaveScreenshot('landing-tablet.png', {
        fullPage: true,
        threshold: 0.2,
      });
    });

    test('desktop layout snapshot', async ({ page }) => {
      await setViewport(page, RESPONSIVE_BREAKPOINTS.desktop.width, RESPONSIVE_BREAKPOINTS.desktop.height);
      await page.goto('/');
      await waitForAnimations(page);
      
      await expect(page).toHaveScreenshot('landing-desktop.png', {
        fullPage: true,
        threshold: 0.2,
      });
    });
  });
});

