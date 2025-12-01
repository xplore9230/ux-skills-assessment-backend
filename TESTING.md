# Testing Documentation

This document provides comprehensive information about the automated testing suite for the UX Skills Assessment application.

## Overview

The testing suite uses [Playwright](https://playwright.dev/) for end-to-end browser testing, covering:
- UI interactions and user flows
- Accessibility (WCAG compliance)
- Responsive design across breakpoints
- Error handling and edge cases
- Visual regression testing
- Cross-browser compatibility

## Quick Start

### Running Tests Locally

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   npx playwright install --with-deps
   ```

2. **Start the development servers**:
   ```bash
   npm run dev
   ```
   The app should be running on `http://localhost:3000` and backend on `http://localhost:8000`.

3. **Run tests**:
   ```bash
   # Run all tests
   npm run test:all

   # Run specific test suites
   npm run test:ui          # UI interaction tests
   npm run test:accessibility  # Accessibility tests
   npm run test:error       # Error handling tests
   npm run test:visual      # Visual regression tests
   npm run test:responsive  # Responsive design tests

   # Run tests in CI mode (optimized for CI/CD)
   npm run test:ci
   ```

### Pre-Check Script

Before asking for code review, run the comprehensive test suite:

```bash
./scripts/test-before-check.sh
```

This script will:
- Install dependencies if needed
- Install Playwright browsers if needed
- Run all tests
- Generate test reports
- Exit with error code if tests fail

## Test Structure

### Test Files

Tests are located in `tests/e2e/`:

- `landing.spec.ts` - Landing page tests
- `quiz.spec.ts` - Quiz flow tests
- `results.spec.ts` - Results page tests
- `error-handling.spec.ts` - Error scenario tests
- `accessibility.spec.ts` - Accessibility compliance tests
- `responsive.spec.ts` - Responsive design tests
- `visual.spec.ts` - Visual regression tests
- `cross-browser.spec.ts` - Cross-browser compatibility tests
- `api.spec.ts` - API endpoint tests

### Test Helpers

Utility functions are in `tests/setup/test-helpers.ts`:

- `waitForAPICalls()` - Wait for network requests to complete
- `mockAPIResponse()` - Mock API responses
- `mockAPIError()` - Mock API errors
- `runAccessibilityScan()` - Run axe-core accessibility scans
- `setViewport()` - Set viewport for responsive testing
- `waitForAnimations()` - Wait for animations to complete

### Test Fixtures

Mock data and scenarios are in `tests/setup/fixtures.ts`:

- `mockAPIResponses` - Mock API response data
- `createMockCategoryScores()` - Generate mock category scores
- `createMockQuizAnswers()` - Generate mock quiz answers
- `userJourneys` - Common user journey scenarios
- `errorScenarios` - Error scenario builders

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    
    // Test assertions
    await expect(page.getByText('Hello')).toBeVisible();
  });
});
```

### Test Tags

Tests can be tagged for selective execution:

- `@ui` - UI interaction tests
- `@accessibility` - Accessibility tests
- `@error` - Error handling tests
- `@visual` - Visual regression tests
- `@responsive` - Responsive design tests

Run tagged tests:
```bash
npx playwright test --grep @accessibility
```

### Best Practices

1. **Use data-testid attributes** for reliable element selection
2. **Wait for animations** before taking screenshots or checking states
3. **Use meaningful test descriptions** that explain what is being tested
4. **Mock external dependencies** (APIs, network calls) when possible
5. **Clean up after tests** (close modals, reset state, etc.)
6. **Use fixtures** for common test data
7. **Tag tests appropriately** for easier filtering

### Example: Testing a User Flow

```typescript
test('user can complete quiz flow', async ({ page }) => {
  // Navigate to landing page
  await page.goto('/');
  
  // Start quiz
  const ctaButton = page.getByTestId('button-start-quiz');
  await ctaButton.click();
  await expect(page).toHaveURL(/\/quiz/);
  
  // Answer questions
  for (let i = 0; i < 15; i++) {
    const option = page.locator('[data-testid^="option-"]').first();
    await option.click();
    await page.waitForTimeout(500);
  }
  
  // Verify results page
  await expect(page).toHaveURL(/\/results/);
});
```

## Test Reports

### HTML Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

Or open manually:
- Standard report: `playwright-report/index.html`
- Enhanced report: `playwright-html-report/index.html`

### CI/CD Integration

Tests run automatically on:
- Push to `main` or `backend` branches
- Pull requests to `main` or `backend` branches

Test artifacts (reports, screenshots, videos) are uploaded and available in the GitHub Actions workflow.

## Debugging Failed Tests

### Using Playwright Inspector

Run tests in headed mode with inspector:

```bash
npx playwright test --headed --debug
```

### Taking Screenshots

Screenshots are automatically captured on failure. Find them in:
- `test-results/` directory

### Viewing Traces

Traces are recorded on first retry. View them:

```bash
npx playwright show-trace trace.zip
```

### Common Issues

1. **Tests timeout**: Increase timeout in `playwright.config.ts` or per test
2. **Elements not found**: Check if elements have proper `data-testid` attributes
3. **Flaky tests**: Add proper waits for animations/network requests
4. **API errors**: Ensure backend server is running on port 8000

## Continuous Integration

### GitHub Actions

The `.github/workflows/test.yml` workflow:
- Runs on push and pull requests
- Installs dependencies
- Starts development servers
- Runs tests in CI mode
- Uploads test artifacts

### Local CI Mode

Test in CI mode locally:

```bash
CI=true npm run test:ci
```

## Visual Regression Testing

Visual regression tests compare screenshots to detect visual changes:

```typescript
await expect(page).toHaveScreenshot('page-name.png');
```

### Updating Screenshots

When intentional changes are made, update baseline screenshots:

```bash
npm run test:ui-update
```

### Thresholds

Visual comparison uses a threshold (0.2 = 20% pixel difference tolerance) to account for:
- Anti-aliasing differences
- Font rendering differences
- Minor layout shifts

## Accessibility Testing

Accessibility tests use [axe-core](https://github.com/dequeystems/axe-core):

```typescript
const results = await runAccessibilityScan(page, {
  tags: ['wcag2a', 'wcag2aa'],
});
```

### WCAG Compliance

Tests check for:
- WCAG 2.1 Level A violations (critical)
- WCAG 2.1 Level AA violations (important)

Target: Zero critical violations, minimal important violations.

## Performance Testing

Basic performance checks are included:

```typescript
test('page loads within acceptable time', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(5000);
});
```

## Troubleshooting

### Port Already in Use

If port 3000 or 8000 is in use:

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

### Playwright Browsers Not Installed

```bash
npx playwright install --with-deps
```

### Tests Pass Locally but Fail in CI

- Check for environment-specific differences
- Ensure all dependencies are in `package.json`
- Verify CI environment variables are set correctly
- Check test timeouts (CI may be slower)

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [axe-core Documentation](https://github.com/dequeystems/axe-core)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Test Checklist](./UI_UX_TESTING_CHECKLIST.md)

## Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Run pre-check script before committing
4. Update this documentation if needed

