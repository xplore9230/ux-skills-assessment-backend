import { test, expect } from '@playwright/test';

test.describe('Cross-Browser Compatibility', () => {
  test.describe('Critical User Flows', () => {
    test('complete quiz flow works', async ({ page, browserName }) => {
      test.info().annotations.push({
        type: 'browser',
        description: browserName,
      });

      await page.goto('/');
      
      const ctaButton = page.getByTestId('button-start-quiz');
      await expect(ctaButton).toBeVisible();
      await ctaButton.click();
      
      await expect(page).toHaveURL(/\/quiz/);
      
      // Answer first few questions
      for (let i = 0; i < 3; i++) {
        const option = page.locator('[data-testid^="option-"]').first();
        await option.waitFor({ state: 'visible' });
        await option.click();
        await page.waitForTimeout(500);
      }
      
      // Progress should update
      const progressText = page.getByTestId('text-progress');
      await expect(progressText).toContainText('Question');
    });

    test('navigation works correctly', async ({ page, browserName }) => {
      test.info().annotations.push({
        type: 'browser',
        description: browserName,
      });

      await page.goto('/');
      
      const ctaButton = page.getByTestId('button-start-quiz');
      await ctaButton.click();
      
      await expect(page).toHaveURL(/\/quiz/);
      
      // Go back
      await page.goBack();
      await expect(page).toHaveURL(/\//);
    });
  });

  test.describe('CSS Compatibility', () => {
    test('styles render correctly', async ({ page, browserName }) => {
      test.info().annotations.push({
        type: 'browser',
        description: browserName,
      });

      await page.goto('/');
      
      const ctaButton = page.getByTestId('button-start-quiz');
      const styles = await ctaButton.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          display: computed.display,
          visibility: computed.visibility,
          opacity: computed.opacity,
        };
      });
      
      expect(styles.display).not.toBe('none');
      expect(styles.visibility).toBe('visible');
      expect(parseFloat(styles.opacity)).toBeGreaterThan(0);
    });
  });

  test.describe('JavaScript Features', () => {
    test('interactive elements work', async ({ page, browserName }) => {
      test.info().annotations.push({
        type: 'browser',
        description: browserName,
      });

      await page.goto('/');
      
      const ctaButton = page.getByTestId('button-start-quiz');
      await ctaButton.click();
      
      // Quiz should load
      const option = page.locator('[data-testid^="option-"]').first();
      await expect(option).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Mobile Browsers', () => {
    test.use({ 
      viewport: { width: 375, height: 667 },
      hasTouch: true,
    });

    test('mobile viewport works', async ({ page }) => {
      await page.goto('/');
      
      const ctaButton = page.getByTestId('button-start-quiz');
      await expect(ctaButton).toBeVisible();
      
      // Touch interaction
      await ctaButton.tap();
      
      await expect(page).toHaveURL(/\/quiz/);
    });
  });
});

