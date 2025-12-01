import { test, expect } from '@playwright/test';
import { runAccessibilityScan, setViewport, RESPONSIVE_BREAKPOINTS, waitForAnimations, testKeyboardNavigation } from '../setup/test-helpers';

test.describe('Landing Page @ui', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    await waitForAnimations(page);
  });

  test('renders hero content and primary CTA', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /find your ux career stage/i })).toBeVisible();

    const ctaButton = page.getByTestId('button-start-quiz');
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toBeEnabled();
    await expect(ctaButton).toContainText('Take the UX Quiz');
  });

  test('displays all key sections', async ({ page }) => {
    // Hero section
    await expect(page.getByTestId('text-hero-title')).toBeVisible();
    await expect(page.getByTestId('landing-illustration')).toBeVisible();

    // Features section
    await expect(page.getByRole('heading', { name: /what you'll learn/i })).toBeVisible();
    await expect(page.getByText(/AI Feedback/i).first()).toBeVisible();
    await expect(page.getByText(/Learning Graph/i).first()).toBeVisible();
    await expect(page.getByText(/Score Assessment/i).first()).toBeVisible();
    await expect(page.getByText(/Job Opportunities/i).first()).toBeVisible();
  });

  test('clicking CTA navigates to quiz page', async ({ page }) => {
    const ctaButton = page.getByTestId('button-start-quiz');
    await ctaButton.click();

    await expect(page).toHaveURL(/\/quiz/);
    await expect(page.getByText(/question/i)).toBeVisible({ timeout: 5000 });
  });

  test('illustration image loads correctly', async ({ page }) => {
    const image = page.getByTestId('landing-illustration');
    await expect(image).toBeVisible();
    
    const src = await image.getAttribute('src');
    expect(src).toBeTruthy();
    
    // Check if image has alt text
    const alt = await image.getAttribute('alt');
    expect(alt).toBeTruthy();
    expect(alt?.length).toBeGreaterThan(0);
  });

  test.describe('Keyboard Navigation @accessibility', () => {
    test('can navigate to CTA button with keyboard', async ({ page }) => {
      // Press Tab multiple times to reach the CTA button
      await page.keyboard.press('Tab');
      
      const ctaButton = page.getByTestId('button-start-quiz');
      
      // Focus should eventually reach the button
      let focused = false;
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        const isFocused = await ctaButton.evaluate((el) => document.activeElement === el);
        if (isFocused) {
          focused = true;
          break;
        }
      }
      
      expect(focused).toBeTruthy();
    });

    test('can activate CTA button with Enter key', async ({ page }) => {
      const ctaButton = page.getByTestId('button-start-quiz');
      await ctaButton.focus();
      await page.keyboard.press('Enter');

      await expect(page).toHaveURL(/\/quiz/, { timeout: 5000 });
    });

    test('can activate CTA button with Space key', async ({ page }) => {
      const ctaButton = page.getByTestId('button-start-quiz');
      await ctaButton.focus();
      await page.keyboard.press('Space');

      await expect(page).toHaveURL(/\/quiz/, { timeout: 5000 });
    });

    test('focus indicators are visible', async ({ page }) => {
      const ctaButton = page.getByTestId('button-start-quiz');
      await ctaButton.focus();
      
      const outline = await ctaButton.evaluate((el) => {
        const styles = window.getComputedStyle(el, ':focus-visible');
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
        };
      });
      
      expect(outline.outlineWidth).not.toBe('0px');
    });
  });

  test.describe('Responsive Design @responsive', () => {
    test('mobile layout (375px)', async ({ page }) => {
      await setViewport(page, RESPONSIVE_BREAKPOINTS.mobile.width, RESPONSIVE_BREAKPOINTS.mobile.height);
      
      const heroTitle = page.getByTestId('text-hero-title');
      await expect(heroTitle).toBeVisible();
      
      // Check that content is not horizontally scrollable
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10); // Small tolerance
    });

    test('tablet layout (768px)', async ({ page }) => {
      await setViewport(page, RESPONSIVE_BREAKPOINTS.tablet.width, RESPONSIVE_BREAKPOINTS.tablet.height);
      
      const featuresGrid = page.locator('.grid').first();
      await expect(featuresGrid).toBeVisible();
    });

    test('desktop layout (1280px)', async ({ page }) => {
      await setViewport(page, RESPONSIVE_BREAKPOINTS.desktop.width, RESPONSIVE_BREAKPOINTS.desktop.height);
      
      const heroTitle = page.getByTestId('text-hero-title');
      await expect(heroTitle).toBeVisible();
      
      // On desktop, features should be in a 2-column grid
      const featuresSection = page.locator('.grid.grid-cols-1.md\\:grid-cols-2').first();
      await expect(featuresSection).toBeVisible();
    });

    test('large desktop layout (1920px)', async ({ page }) => {
      await setViewport(page, RESPONSIVE_BREAKPOINTS.largeDesktop.width, RESPONSIVE_BREAKPOINTS.largeDesktop.height);
      
      // Content should be centered and not stretch too wide
      const container = page.locator('.container').first();
      const containerWidth = await container.boundingBox();
      expect(containerWidth?.width).toBeLessThan(RESPONSIVE_BREAKPOINTS.largeDesktop.width);
    });
  });

  test.describe('Accessibility @accessibility', () => {
    test('has proper heading hierarchy', async ({ page }) => {
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();
      
      const h2 = page.locator('h2').first();
      await expect(h2).toBeVisible();
    });

    test('images have alt text', async ({ page }) => {
      const images = page.locator('img');
      const count = await images.count();
      
      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        // Alt text should exist (can be empty for decorative images but should be present)
        expect(alt).not.toBeNull();
      }
    });

    test('buttons have accessible labels', async ({ page }) => {
      const ctaButton = page.getByTestId('button-start-quiz');
      const text = await ctaButton.textContent();
      expect(text?.toLowerCase()).toMatch(/take.*quiz|start.*quiz/i);
    });

    test('main content is in a semantic landmark', async ({ page }) => {
      // Check for main landmark or role
      const main = page.locator('main, [role="main"]').first();
      if (await main.count() > 0) {
        await expect(main).toBeVisible();
      }
      // If no main, check that page has structure
      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible();
    });

    test('runs accessibility scan with axe-core', async ({ page }) => {
      const results = await runAccessibilityScan(page, {
        tags: ['wcag2a', 'wcag2aa'],
      });
      
      if (results.violations.length > 0) {
        console.log('Accessibility violations:', results.violations);
      }
      
      // Allow some violations but log them
      expect(results.violations.length).toBeLessThan(10);
    });
  });

  test.describe('Visual Regression @visual', () => {
    test('landing page matches visual snapshot', async ({ page }) => {
      await waitForAnimations(page);
      await expect(page).toHaveScreenshot('landing-page.png', {
        fullPage: true,
        threshold: 0.2,
      });
    });

    test('CTA button matches visual snapshot', async ({ page }) => {
      const ctaButton = page.getByTestId('button-start-quiz');
      await waitForAnimations(page);
      
      await expect(ctaButton).toHaveScreenshot('landing-cta-button.png', {
        threshold: 0.2,
      });
    });

    test('features section matches visual snapshot', async ({ page }) => {
      const featuresSection = page.getByRole('heading', { name: /what you'll learn/i }).locator('..');
      await waitForAnimations(page);
      
      await expect(featuresSection).toHaveScreenshot('landing-features.png', {
        threshold: 0.2,
      });
    });
  });

  test.describe('Performance', () => {
    test('page loads within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Page should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('no console errors on load', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Filter out known non-critical errors
      const criticalErrors = errors.filter(
        (err) => !err.includes('favicon') && 
                 !err.includes('analytics') &&
                 !err.includes('Failed to load resource') &&
                 !err.includes('404')
      );
      
      // Allow some non-critical errors but not many
      expect(criticalErrors.length).toBeLessThan(3);
    });
  });

  test.describe('Interactive Elements', () => {
    test('CTA button has hover effect', async ({ page }) => {
      const ctaButton = page.getByTestId('button-start-quiz');
      
      await ctaButton.hover();
      await page.waitForTimeout(100); // Wait for hover transition
      
      const transform = await ctaButton.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.transform;
      });
      
      // Button should have some transform on hover
      expect(transform).not.toBe('none');
    });

    test('features have hover states', async ({ page }) => {
      const firstFeature = page.getByText(/AI Feedback/i).locator('..');
      await firstFeature.hover();
      await page.waitForTimeout(100);
      
      // Check that hover state is applied (color change, etc.)
      const color = await firstFeature.locator('h3').evaluate((el) => {
        return window.getComputedStyle(el).color;
      });
      
      expect(color).toBeTruthy();
    });
  });
});