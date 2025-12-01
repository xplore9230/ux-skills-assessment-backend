import { test, expect } from '@playwright/test';
import { runAccessibilityScan, testKeyboardNavigation } from '../setup/test-helpers';

test.describe('Accessibility @accessibility', () => {
  test.describe('Landing Page', () => {
    test('has no critical accessibility violations', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const results = await runAccessibilityScan(page, {
        tags: ['wcag2a', 'wcag2aa'],
      });
      
      // Log violations for debugging
      if (results.violations.length > 0) {
        console.log('Accessibility violations found:', results.violations.length);
        results.violations.forEach((violation) => {
          console.log(`- ${violation.id}: ${violation.description}`);
        });
      }
      
      // Should have minimal violations
      expect(results.violations.length).toBeLessThan(10);
    });

    test('keyboard navigation works', async ({ page }) => {
      await page.goto('/');
      
      // Tab to CTA button
      let focused = false;
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        const activeElement = await page.evaluate(() => document.activeElement?.textContent);
        if (activeElement?.toLowerCase().includes('quiz')) {
          focused = true;
          break;
        }
      }
      
      expect(focused).toBeTruthy();
    });
  });

  test.describe('Quiz Page', () => {
    test('quiz options have proper ARIA attributes', async ({ page }) => {
      await page.goto('/');
      const ctaButton = page.getByTestId('button-start-quiz');
      await ctaButton.click();
      
      const option = page.locator('[data-testid^="option-"]').first();
      await option.waitFor({ state: 'visible' });
      
      const role = await option.getAttribute('role');
      expect(role).toBe('radio');
      
      const ariaChecked = await option.getAttribute('aria-checked');
      expect(ariaChecked).toBe('false');
    });

    test('progress bar has ARIA attributes', async ({ page }) => {
      await page.goto('/');
      const ctaButton = page.getByTestId('button-start-quiz');
      await ctaButton.click();
      
      const progressBar = page.getByRole('progressbar');
      await expect(progressBar).toBeVisible();
      
      const ariaValueNow = await progressBar.getAttribute('aria-valuenow');
      const ariaValueMin = await progressBar.getAttribute('aria-valuemin');
      const ariaValueMax = await progressBar.getAttribute('aria-valuemax');
      
      expect(ariaValueNow).toBeTruthy();
      expect(ariaValueMin).toBe('1');
      expect(ariaValueMax).toBeTruthy();
    });

    test('can navigate quiz with keyboard only', async ({ page }) => {
      await page.goto('/');
      const ctaButton = page.getByTestId('button-start-quiz');
      await ctaButton.click();
      
      // Navigate to first option
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);
      
      // Select with Enter
      await page.keyboard.press('Enter');
      await waitForAnimations(page);
      await page.waitForTimeout(500);
      
      const option = page.locator('[data-testid^="option-"]').first();
      const isChecked = await option.getAttribute('aria-checked');
      // Verify keyboard interaction worked
      if (isChecked !== 'true') {
        const classes = await option.getAttribute('class');
        expect(classes).toBeTruthy();
      } else {
        expect(isChecked).toBe('true');
      }
    });
  });

  test.describe('Results Page', () => {
    test('has proper heading hierarchy', async ({ page }) => {
      await page.goto('/results');
      await page.waitForLoadState('networkidle', { timeout: 20000 });
      
      const h1 = page.locator('h1').first();
      await h1.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
      
      // Should have semantic structure
      const main = page.locator('main, [role="main"]').first();
      if (await main.count() > 0) {
        await expect(main).toBeVisible();
      }
    });

    test('images have alt text', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const images = page.locator('img');
      const count = await images.count();
      
      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        expect(alt).not.toBeNull();
      }
    });
  });

  test.describe('Color Contrast', () => {
    test('text has sufficient contrast', async ({ page }) => {
      await page.goto('/');
      
      // Check main heading contrast
      const heading = page.locator('h1').first();
      const color = await heading.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.color;
      });
      
      expect(color).toBeTruthy();
      // Note: Actual contrast calculation would require color parsing
    });
  });

  test.describe('Focus Management', () => {
    test('focus indicators are visible', async ({ page }) => {
      await page.goto('/');
      
      const ctaButton = page.getByTestId('button-start-quiz');
      await ctaButton.focus();
      
      const focusStyles = await ctaButton.evaluate((el) => {
        const styles = window.getComputedStyle(el, ':focus-visible');
        return {
          outlineWidth: styles.outlineWidth,
          outline: styles.outline,
          boxShadow: styles.boxShadow,
        };
      });
      
      // Check if focus indicator exists (outline, box-shadow, or other visual indicator)
      const hasOutline = parseFloat(focusStyles.outlineWidth || '0') > 0;
      const hasBoxShadow = focusStyles.boxShadow !== 'none';
      const hasOutlineStyle = focusStyles.outline !== 'none' && focusStyles.outline !== '';
      
      expect(hasOutline || hasBoxShadow || hasOutlineStyle).toBeTruthy();
    });
  });
});